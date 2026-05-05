// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title WillowStablecoin (wNGN)
/// @notice ERC-20 wrapped Nigerian Naira — 1:1 pegged to NGN, backed by Urchmond treasury
contract WillowStablecoin is ERC20, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public exchangeRateNGNUSD; // NGN per 1 USD, scaled 1e6

    event ExchangeRateUpdated(uint256 oldRate, uint256 newRate);

    constructor(address admin) ERC20("Wrapped Nigerian Naira", "wNGN") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE,        admin);
        exchangeRateNGNUSD = 1_500_000000; // ~₦1,500 per USD (initial)
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyRole(MINTER_ROLE) {
        _burn(from, amount);
    }

    /// @notice Update NGN/USD exchange rate (Chainlink oracle can call this)
    function updateExchangeRate(uint256 newRate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 oldRate    = exchangeRateNGNUSD;
        exchangeRateNGNUSD = newRate;
        emit ExchangeRateUpdated(oldRate, newRate);
    }

    /// @notice Convert NGN amount to USDC equivalent (6 decimals)
    function ngnToUSDC(uint256 ngnAmount) external view returns (uint256) {
        return (ngnAmount * 1e6) / exchangeRateNGNUSD;
    }

    /// @notice Convert USDC (6 decimals) to NGN equivalent
    function usdcToNGN(uint256 usdcAmount) external view returns (uint256) {
        return (usdcAmount * exchangeRateNGNUSD) / 1e6;
    }

    function pause()   external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
}
