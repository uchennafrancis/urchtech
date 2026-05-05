// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title LeaseAgreement
/// @notice On-chain lease with automated USDC rent collection
contract LeaseAgreement is ReentrancyGuard, Pausable {
    enum LeaseStatus { PENDING, ACTIVE, EXPIRED, TERMINATED }

    address public immutable landlord;
    address public immutable tenant;
    uint256 public immutable propertyNFTId;
    uint256 public immutable monthlyRentUSDC;
    uint256 public immutable depositAmount;
    uint256 public immutable leaseDuration;     // seconds
    uint256 public immutable totalExpected;     // total payments expected
    IERC20  public immutable usdc;
    address public immutable factory;

    uint256     public leaseStart;
    uint256     public nextPaymentDue;
    uint256     public paymentsCompleted;
    bool        public isActive;
    bool        public depositReleased;
    LeaseStatus public status;

    event LeaseActivated(address indexed tenant, address indexed landlord, uint256 propertyId, uint256 monthlyRent);
    event RentPaid(address indexed tenant, address indexed landlord, uint256 amount, uint256 paymentNumber, uint256 timestamp);
    event RentOverdue(address indexed tenant, uint256 propertyId, uint256 missedPayments);
    event DepositReleased(address indexed tenant, uint256 amount, uint256 deductions);
    event LeaseTerminated(address indexed initiator, string reason);

    modifier onlyLandlord() { require(msg.sender == landlord, "Not landlord"); _; }
    modifier onlyTenant()   { require(msg.sender == tenant,   "Not tenant");   _; }
    modifier onlyParty()    { require(msg.sender == landlord || msg.sender == tenant, "Not a party"); _; }

    constructor(
        address _landlord,
        address _tenant,
        uint256 _nftTokenId,
        uint256 _monthlyRentUSDC,
        uint256 _depositAmount,
        uint256 _durationMonths,
        address _usdc
    ) {
        landlord         = _landlord;
        tenant           = _tenant;
        propertyNFTId    = _nftTokenId;
        monthlyRentUSDC  = _monthlyRentUSDC;
        depositAmount    = _depositAmount;
        leaseDuration    = _durationMonths * 30 days;
        totalExpected    = _durationMonths;
        usdc             = IERC20(_usdc);
        factory          = msg.sender;
        status           = LeaseStatus.PENDING;
    }

    /// @notice Tenant activates lease by paying deposit in USDC
    function activateLease() external onlyTenant nonReentrant whenNotPaused {
        require(status == LeaseStatus.PENDING, "Not pending");
        usdc.transferFrom(tenant, address(this), depositAmount);
        leaseStart     = block.timestamp;
        nextPaymentDue = block.timestamp + 30 days;
        isActive       = true;
        status         = LeaseStatus.ACTIVE;
        emit LeaseActivated(tenant, landlord, propertyNFTId, monthlyRentUSDC);
    }

    /// @notice Tenant pays monthly rent — USDC goes directly to landlord
    function payRent() external onlyTenant nonReentrant whenNotPaused {
        require(status == LeaseStatus.ACTIVE, "Lease not active");
        usdc.transferFrom(tenant, landlord, monthlyRentUSDC);
        paymentsCompleted++;
        nextPaymentDue += 30 days;
        emit RentPaid(tenant, landlord, monthlyRentUSDC, paymentsCompleted, block.timestamp);
        if (paymentsCompleted >= totalExpected) {
            status   = LeaseStatus.EXPIRED;
            isActive = false;
        }
    }

    /// @notice Flag overdue status on-chain (callable by anyone)
    function flagOverdue() external {
        require(isRentOverdue(), "Not overdue");
        emit RentOverdue(tenant, propertyNFTId, getMissedPayments());
    }

    /// @notice Landlord releases deposit at end of lease
    function releaseDeposit(bool fullReturn) external onlyLandlord nonReentrant {
        require(!depositReleased, "Already released");
        require(
            status == LeaseStatus.EXPIRED || status == LeaseStatus.TERMINATED,
            "Lease still active"
        );
        depositReleased  = true;
        uint256 deductions = fullReturn ? 0 : depositAmount / 5; // 20% if not full return
        uint256 refund     = depositAmount - deductions;
        if (refund      > 0) usdc.transfer(tenant,   refund);
        if (deductions  > 0) usdc.transfer(landlord, deductions);
        emit DepositReleased(tenant, refund, deductions);
    }

    /// @notice Terminate lease with reason
    function terminateLease(string calldata reason) external onlyParty {
        require(
            status == LeaseStatus.ACTIVE || status == LeaseStatus.PENDING,
            "Cannot terminate"
        );
        status   = LeaseStatus.TERMINATED;
        isActive = false;
        emit LeaseTerminated(msg.sender, reason);
    }

    function isRentOverdue() public view returns (bool) {
        return status == LeaseStatus.ACTIVE && block.timestamp > nextPaymentDue;
    }

    function getMissedPayments() public view returns (uint256) {
        if (!isRentOverdue()) return 0;
        return (block.timestamp - nextPaymentDue) / 30 days + 1;
    }

    function getRemainingTenure() external view returns (uint256) {
        if (!isActive) return 0;
        uint256 end = leaseStart + leaseDuration;
        return block.timestamp >= end ? 0 : end - block.timestamp;
    }

    function pause()   external { require(msg.sender == factory, "Only factory"); _pause(); }
    function unpause() external { require(msg.sender == factory, "Only factory"); _unpause(); }
}
