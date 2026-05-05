// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./WillowFractional.sol";

/// @title WillowInvestmentPool
/// @notice Pooled USDC fund that acquires fractional property tokens; mints pool-participation tokens
contract WillowInvestmentPool is ERC20, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant POOL_MANAGER_ROLE = keccak256("POOL_MANAGER_ROLE");

    enum PoolStatus { OPEN, CLOSED, INVESTING, DISTRIBUTING, COMPLETE }

    string     public poolName;
    uint256    public targetRaiseUSDC;
    uint256    public totalRaisedUSDC;
    uint256    public investorCount;
    uint256    public minInvestmentUSDC;
    PoolStatus public status;
    IERC20     public immutable usdc;

    mapping(address => uint256) public investments;
    address[]                   public heldFractionalContracts;

    event Invested(address indexed investor, uint256 amount, uint256 poolTokens);
    event RoundClosed(uint256 totalRaised, uint256 investors);
    event FractionalAcquired(address fractionalContract, uint256 shareAmount);
    event PoolYieldDistributed(uint256 totalAmount, uint256 perToken, uint256 timestamp);
    event Redeemed(address indexed investor, uint256 poolTokens, uint256 usdcReceived);

    constructor(
        string memory _poolName,
        uint256       _targetRaiseUSDC,
        uint256       _minInvestmentUSDC,
        address       _usdc,
        address       admin
    ) ERC20(_poolName, "WPOOL") {
        poolName          = _poolName;
        targetRaiseUSDC   = _targetRaiseUSDC;
        minInvestmentUSDC = _minInvestmentUSDC;
        usdc              = IERC20(_usdc);
        status            = PoolStatus.OPEN;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(POOL_MANAGER_ROLE,  admin);
    }

    /// @notice Investor deposits USDC; receives pool tokens 1:1
    function invest(uint256 usdcAmount) external nonReentrant whenNotPaused {
        require(status == PoolStatus.OPEN, "Pool not open for investment");
        require(usdcAmount >= minInvestmentUSDC, "Below minimum investment");

        usdc.transferFrom(msg.sender, address(this), usdcAmount);
        totalRaisedUSDC += usdcAmount;

        if (investments[msg.sender] == 0) investorCount++;
        investments[msg.sender] += usdcAmount;

        _mint(msg.sender, usdcAmount); // 1 pool token per USDC
        emit Invested(msg.sender, usdcAmount, usdcAmount);
    }

    /// @notice Close the raise and move to investing phase
    function closeRound() external onlyRole(POOL_MANAGER_ROLE) {
        require(status == PoolStatus.OPEN, "Not open");
        status = PoolStatus.INVESTING;
        emit RoundClosed(totalRaisedUSDC, investorCount);
    }

    /// @notice Pool buys fractional shares in a property (manager executes OTC purchase)
    function acquireFractional(
        address fractionalContract,
        uint256 shareAmount,
        uint256 usdcCost
    ) external onlyRole(POOL_MANAGER_ROLE) nonReentrant {
        require(status == PoolStatus.INVESTING, "Not in investing phase");
        usdc.approve(fractionalContract, usdcCost);
        IERC20(fractionalContract).transferFrom(msg.sender, address(this), shareAmount);
        heldFractionalContracts.push(fractionalContract);
        emit FractionalAcquired(fractionalContract, shareAmount);
    }

    /// @notice Claim yield from all held fractional contracts and distribute
    function distributePoolYield() external onlyRole(POOL_MANAGER_ROLE) nonReentrant {
        uint256 before = usdc.balanceOf(address(this));
        for (uint256 i; i < heldFractionalContracts.length; i++) {
            try WillowFractional(heldFractionalContracts[i]).claimYield() {} catch {}
        }
        uint256 received = usdc.balanceOf(address(this)) - before;
        if (received > 0 && totalSupply() > 0) {
            emit PoolYieldDistributed(received, (received * 1e18) / totalSupply(), block.timestamp);
        }
    }

    /// @notice Investor burns pool tokens and receives proportional USDC
    function redeem(uint256 poolTokens) external nonReentrant {
        require(status == PoolStatus.COMPLETE, "Pool not complete");
        require(balanceOf(msg.sender) >= poolTokens, "Insufficient pool tokens");
        uint256 usdcShare = (poolTokens * usdc.balanceOf(address(this))) / totalSupply();
        _burn(msg.sender, poolTokens);
        usdc.transfer(msg.sender, usdcShare);
        emit Redeemed(msg.sender, poolTokens, usdcShare);
    }

    function completePool() external onlyRole(POOL_MANAGER_ROLE) {
        status = PoolStatus.COMPLETE;
    }

    function getHeldFractionals() external view returns (address[] memory) {
        return heldFractionalContracts;
    }

    function pause()   external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
}
