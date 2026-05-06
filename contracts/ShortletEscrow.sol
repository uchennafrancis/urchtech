// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title ShortletEscrow
/// @notice Trustless USDC escrow for shortlet bookings — releases to host on check-in
contract ShortletEscrow is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant WILLOW_ORACLE_ROLE = keccak256("WILLOW_ORACLE_ROLE");

    enum BookingStatus { PENDING, ACTIVE, COMPLETED, REFUNDED }

    struct Booking {
        address guest;
        address host;
        uint256 propertyNFTId;
        uint256 totalUSDC;
        uint256 serviceFeeUSDC;
        uint256 checkinTime;
        uint256 checkoutTime;
        string  bookingReference;
        BookingStatus status;
    }

    IERC20  public immutable usdc;
    address public           platformWallet;
    uint256 public constant  SERVICE_FEE_BPS = 500; // 5%

    mapping(bytes32 => Booking) public bookings;
    bytes32[]                   public allBookingIds;

    event BookingCreated(bytes32 indexed bookingId, address indexed guest, address indexed host, uint256 amount);
    event CheckinConfirmed(bytes32 indexed bookingId, address indexed host, uint256 amountReleased);
    event RefundProcessed(bytes32 indexed bookingId, address indexed guest, uint256 refundAmount);
    event StayCompleted(bytes32 indexed bookingId, address indexed guest, address indexed host);

    constructor(address _usdc, address _platformWallet, address admin) {
        usdc           = IERC20(_usdc);
        platformWallet = _platformWallet;
        _grantRole(DEFAULT_ADMIN_ROLE,  admin);
        _grantRole(WILLOW_ORACLE_ROLE,  admin);
    }

    /// @notice Guest creates booking — USDC held in escrow
    function createBooking(
        address         host,
        uint256         nftTokenId,
        uint256         totalUSDC,
        uint256         checkinTime,
        uint256         checkoutTime,
        string calldata reference
    ) external nonReentrant whenNotPaused returns (bytes32) {
        require(checkinTime  > block.timestamp, "Checkin must be future");
        require(checkoutTime > checkinTime,     "Invalid checkout");

        uint256 serviceFee = (totalUSDC * SERVICE_FEE_BPS) / 10000;
        bytes32 bookingId  = keccak256(
            abi.encodePacked(msg.sender, host, nftTokenId, checkinTime, block.timestamp)
        );

        usdc.transferFrom(msg.sender, address(this), totalUSDC);

        bookings[bookingId] = Booking({
            guest:            msg.sender,
            host:             host,
            propertyNFTId:    nftTokenId,
            totalUSDC:        totalUSDC,
            serviceFeeUSDC:   serviceFee,
            checkinTime:      checkinTime,
            checkoutTime:     checkoutTime,
            bookingReference: reference,
            status:           BookingStatus.PENDING
        });
        allBookingIds.push(bookingId);

        emit BookingCreated(bookingId, msg.sender, host, totalUSDC);
        return bookingId;
    }

    /// @notice Host or oracle confirms check-in — releases funds to host
    function confirmCheckin(bytes32 bookingId) external nonReentrant whenNotPaused {
        Booking storage b = bookings[bookingId];
        require(b.status == BookingStatus.PENDING, "Not pending");
        require(
            msg.sender == b.host || hasRole(WILLOW_ORACLE_ROLE, msg.sender),
            "Not authorised"
        );
        require(block.timestamp >= b.checkinTime, "Too early for checkin");

        b.status = BookingStatus.ACTIVE;
        uint256 hostAmount = b.totalUSDC - b.serviceFeeUSDC;
        usdc.transfer(b.host, hostAmount);
        usdc.transfer(platformWallet, b.serviceFeeUSDC);

        emit CheckinConfirmed(bookingId, b.host, hostAmount);
    }

    /// @notice Guest requests refund — policy: 100% if >48hrs, 50% if <48hrs
    function requestRefund(bytes32 bookingId) external nonReentrant whenNotPaused {
        Booking storage b = bookings[bookingId];
        require(b.status == BookingStatus.PENDING, "Not refundable");
        require(msg.sender == b.guest, "Not the guest");
        require(block.timestamp < b.checkinTime, "Cannot refund after checkin");

        b.status = BookingStatus.REFUNDED;
        uint256 timeUntilCheckin = b.checkinTime - block.timestamp;
        uint256 guestRefund;
        uint256 hostFee;

        if (timeUntilCheckin > 48 hours) {
            guestRefund = b.totalUSDC;
        } else {
            guestRefund = b.totalUSDC / 2;
            hostFee     = b.totalUSDC - guestRefund;
        }

        if (guestRefund > 0) usdc.transfer(b.guest, guestRefund);
        if (hostFee     > 0) usdc.transfer(b.host,  hostFee);

        emit RefundProcessed(bookingId, b.guest, guestRefund);
    }

    /// @notice Finalise a completed stay after checkout time
    function completeStay(bytes32 bookingId) external {
        Booking storage b = bookings[bookingId];
        require(b.status == BookingStatus.ACTIVE, "Not active");
        require(block.timestamp >= b.checkoutTime, "Guest not checked out yet");
        b.status = BookingStatus.COMPLETED;
        emit StayCompleted(bookingId, b.guest, b.host);
    }

    function updatePlatformWallet(address newWallet) external onlyRole(DEFAULT_ADMIN_ROLE) {
        platformWallet = newWallet;
    }

    function pause()   external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
}
