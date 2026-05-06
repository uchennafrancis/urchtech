// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./WillowFractional.sol";

/// @title WillowFractionalFactory
/// @notice Deploys WillowFractional ERC-20 contracts per property
contract WillowFractionalFactory is AccessControl, Pausable {
    bytes32 public constant WILLOW_ADMIN_ROLE = keccak256("WILLOW_ADMIN_ROLE");

    address public immutable propertyNFT;
    address public immutable usdc;

    mapping(uint256 => address) public fractionalByTokenId;
    address[]                   public allFractionalContracts;

    event FractionalDeployed(
        uint256 indexed nftTokenId,
        address         fractionalContract,
        string          tokenName
    );

    constructor(address _propertyNFT, address _usdc, address admin) {
        propertyNFT = _propertyNFT;
        usdc        = _usdc;
        _grantRole(DEFAULT_ADMIN_ROLE,  admin);
        _grantRole(WILLOW_ADMIN_ROLE,   admin);
    }

    function createFractionalProperty(
        uint256         nftTokenId,
        uint256         totalShares,
        string calldata tokenName,
        string calldata tokenSymbol,
        address[] calldata founders,
        uint256[] calldata allocations
    ) external onlyRole(WILLOW_ADMIN_ROLE) whenNotPaused returns (address) {
        require(fractionalByTokenId[nftTokenId] == address(0), "Already fractionalised");

        WillowFractional fractional = new WillowFractional(
            propertyNFT,
            nftTokenId,
            totalShares,
            tokenName,
            tokenSymbol,
            usdc,
            founders,
            allocations
        );

        address addr = address(fractional);
        fractionalByTokenId[nftTokenId] = addr;
        allFractionalContracts.push(addr);

        emit FractionalDeployed(nftTokenId, addr, tokenName);
        return addr;
    }

    function getAllFractionalContracts() external view returns (address[] memory) {
        return allFractionalContracts;
    }

    function pause()   external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
}
