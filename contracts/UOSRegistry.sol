// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./WillowPropertyNFT.sol";

/// @title UOSRegistry
/// @notice Immutable on-chain log of every Urchmond Operating System improvement
contract UOSRegistry is AccessControl, Pausable {
    bytes32 public constant URCHMOND_INSPECTOR_ROLE = keccak256("URCHMOND_INSPECTOR_ROLE");

    struct Improvement {
        uint256 propertyNFTId;
        string  improvementType;   // "Smart Home" / "Solar" / "Interior" etc.
        uint256 costNaira;
        uint256 valueImpactNaira;
        uint256 completionDate;
        uint256 uosScoreBefore;
        uint256 uosScoreAfter;
        string  evidenceIPFS;      // IPFS hash of before/after photos
        address certifiedBy;       // Urchmond inspector wallet
    }

    WillowPropertyNFT                   public immutable propertyNFT;
    mapping(uint256 => Improvement[])   public improvementsByProperty;
    mapping(uint256 => uint256)         public totalValueAdded;

    event ImprovementRecorded(
        uint256 indexed propertyId,
        string          improvementType,
        uint256         valueImpact,
        uint256         newUOS
    );

    constructor(address _propertyNFT, address admin) {
        propertyNFT = WillowPropertyNFT(_propertyNFT);
        _grantRole(DEFAULT_ADMIN_ROLE,        admin);
        _grantRole(URCHMOND_INSPECTOR_ROLE,   admin);
    }

    /// @notice Record a completed improvement and update the NFT valuation
    function recordImprovement(
        uint256         propertyNFTId,
        string calldata improvType,
        uint256         cost,
        uint256         valueImpact,
        uint256         uosBefore,
        uint256         uosAfter,
        string calldata evidenceIPFS
    ) external onlyRole(URCHMOND_INSPECTOR_ROLE) whenNotPaused {
        improvementsByProperty[propertyNFTId].push(Improvement({
            propertyNFTId:    propertyNFTId,
            improvementType:  improvType,
            costNaira:        cost,
            valueImpactNaira: valueImpact,
            completionDate:   block.timestamp,
            uosScoreBefore:   uosBefore,
            uosScoreAfter:    uosAfter,
            evidenceIPFS:     evidenceIPFS,
            certifiedBy:      msg.sender
        }));

        totalValueAdded[propertyNFTId] += valueImpact;
        // Update NFT — pass 0 valuation to only update score
        propertyNFT.updateValuation(propertyNFTId, 0, uosAfter);

        emit ImprovementRecorded(propertyNFTId, improvType, valueImpact, uosAfter);
    }

    function getImprovementHistory(uint256 propertyNFTId) external view returns (Improvement[] memory) {
        return improvementsByProperty[propertyNFTId];
    }

    function getTotalValueAdded(uint256 propertyNFTId) external view returns (uint256) {
        return totalValueAdded[propertyNFTId];
    }

    function pause()   external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
}
