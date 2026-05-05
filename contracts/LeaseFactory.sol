// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./LeaseAgreement.sol";

/// @title LeaseFactory
/// @notice Deploys on-chain LeaseAgreement contracts
contract LeaseFactory is AccessControl, Pausable {
    bytes32 public constant WILLOW_ADMIN_ROLE = keccak256("WILLOW_ADMIN_ROLE");

    address public immutable usdc;

    mapping(uint256 => address[]) public leasesByProperty;
    mapping(address => address[]) public leasesByTenant;
    mapping(address => address[]) public leasesByLandlord;
    address[]                     public allLeases;

    event LeaseDeployed(
        address indexed leaseContract,
        address indexed landlord,
        address indexed tenant,
        uint256         nftTokenId
    );

    constructor(address _usdc, address admin) {
        usdc = _usdc;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(WILLOW_ADMIN_ROLE,  admin);
    }

    function deployLease(
        address landlord,
        address tenant,
        uint256 nftTokenId,
        uint256 monthlyRentUSDC,
        uint256 depositAmount,
        uint256 durationMonths
    ) external onlyRole(WILLOW_ADMIN_ROLE) whenNotPaused returns (address) {
        LeaseAgreement lease = new LeaseAgreement(
            landlord,
            tenant,
            nftTokenId,
            monthlyRentUSDC,
            depositAmount,
            durationMonths,
            usdc
        );
        address leaseAddr = address(lease);
        leasesByProperty[nftTokenId].push(leaseAddr);
        leasesByTenant[tenant].push(leaseAddr);
        leasesByLandlord[landlord].push(leaseAddr);
        allLeases.push(leaseAddr);
        emit LeaseDeployed(leaseAddr, landlord, tenant, nftTokenId);
        return leaseAddr;
    }

    function getLeasesForProperty(uint256 nftTokenId) external view returns (address[] memory) {
        return leasesByProperty[nftTokenId];
    }

    function getLeasesForTenant(address tenant) external view returns (address[] memory) {
        return leasesByTenant[tenant];
    }

    function getLeasesForLandlord(address landlord) external view returns (address[] memory) {
        return leasesByLandlord[landlord];
    }

    function pause()   external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
}
