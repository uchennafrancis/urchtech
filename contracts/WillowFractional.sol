// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title WillowFractional
/// @notice ERC-20 fractional ownership tokens for a single property NFT
contract WillowFractional is ERC20, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant YIELD_DISTRIBUTOR_ROLE = keccak256("YIELD_DISTRIBUTOR_ROLE");

    address   public immutable parentNFT;
    uint256   public immutable nftTokenId;
    uint256   public           totalShares;
    IERC20    public immutable usdc;

    // Per-share yield accumulator (scaled 1e18)
    uint256 public yieldPerShareAccumulated;
    mapping(address => uint256) public yieldPerShareClaimed;
    mapping(address => uint256) public yieldBalance;

    uint256 public totalYieldDistributed;
    bool    public isLiquidated;

    event YieldDistributed(uint256 amount, uint256 perShare, uint256 timestamp);
    event YieldClaimed(address indexed holder, uint256 amount);
    event Liquidated(uint256 saleProceeds, uint256 perShare);

    constructor(
        address         _nft,
        uint256         _tokenId,
        uint256         _shares,
        string memory   _name,
        string memory   _symbol,
        address         _usdc,
        address[] memory founders,
        uint256[] memory allocations
    ) ERC20(_name, _symbol) {
        require(founders.length == allocations.length, "Length mismatch");
        parentNFT   = _nft;
        nftTokenId  = _tokenId;
        totalShares = _shares;
        usdc        = IERC20(_usdc);

        _grantRole(DEFAULT_ADMIN_ROLE,    msg.sender);
        _grantRole(YIELD_DISTRIBUTOR_ROLE, msg.sender);

        uint256 total;
        for (uint256 i; i < founders.length; i++) {
            total += allocations[i];
            _mint(founders[i], allocations[i]);
        }
        require(total == _shares, "Allocations must equal totalShares");
    }

    /// @notice Distribute USDC yield proportionally to share holders
    function distributeYield(uint256 usdcAmount)
        external onlyRole(YIELD_DISTRIBUTOR_ROLE) nonReentrant
    {
        require(totalSupply() > 0, "No shares outstanding");
        require(!isLiquidated, "Property liquidated");
        usdc.transferFrom(msg.sender, address(this), usdcAmount);
        yieldPerShareAccumulated += (usdcAmount * 1e18) / totalSupply();
        totalYieldDistributed    += usdcAmount;
        emit YieldDistributed(usdcAmount, yieldPerShareAccumulated, block.timestamp);
    }

    /// @notice Claim accumulated USDC yield
    function claimYield() external nonReentrant {
        _settlePending(msg.sender);
        uint256 owed = yieldBalance[msg.sender];
        require(owed > 0, "Nothing to claim");
        yieldBalance[msg.sender] = 0;
        usdc.transfer(msg.sender, owed);
        emit YieldClaimed(msg.sender, owed);
    }

    /// @notice Liquidate — distribute sale proceeds to all holders
    function liquidate(uint256 saleProceeds)
        external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant
    {
        require(!isLiquidated, "Already liquidated");
        isLiquidated = true;
        usdc.transferFrom(msg.sender, address(this), saleProceeds);
        uint256 perShare = (saleProceeds * 1e18) / totalSupply();
        yieldPerShareAccumulated += perShare;
        emit Liquidated(saleProceeds, perShare);
    }

    /// @notice Get shareholder info
    function getShareHolder(address user)
        external view returns (uint256 shares, uint256 percentage, uint256 yieldOwed)
    {
        shares     = balanceOf(user);
        percentage = totalSupply() > 0 ? (shares * 10000) / totalSupply() : 0;
        yieldOwed  = yieldBalance[user] + _pendingYield(user);
    }

    // ── Internal helpers ─────────────────────────────────────────────────────
    function _pendingYield(address account) internal view returns (uint256) {
        return (balanceOf(account) * (yieldPerShareAccumulated - yieldPerShareClaimed[account])) / 1e18;
    }

    function _settlePending(address account) internal {
        uint256 pending = _pendingYield(account);
        if (pending > 0) yieldBalance[account] += pending;
        yieldPerShareClaimed[account] = yieldPerShareAccumulated;
    }

    // Settle yield on every ERC-20 transfer
    function _update(address from, address to, uint256 value) internal override {
        if (from != address(0)) _settlePending(from);
        if (to   != address(0)) _settlePending(to);
        super._update(from, to, value);
    }

    function pause()   external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
}
