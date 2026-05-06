// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title WillowPropertyNFT
/// @notice ERC-721 token — one NFT per registered property on the Willow platform
contract WillowPropertyNFT is ERC721, ERC721URIStorage, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant WILLOW_ADMIN_ROLE = keccak256("WILLOW_ADMIN_ROLE");
    bytes32 public constant AI_ORACLE_ROLE    = keccak256("AI_ORACLE_ROLE");

    struct PropertyData {
        string  willowPropertyId;  // links to PostgreSQL property.id
        string  metadataURI;       // IPFS URI
        string  location;
        uint256 valuationNaira;    // in kobo
        uint256 uosScore;          // 0-100
        bool    isVerified;
        uint256 registeredAt;
    }

    uint256 public tokenCounter;
    mapping(uint256 => PropertyData) public properties;
    mapping(uint256 => address)      public propertyOwner;

    event PropertyRegistered(uint256 indexed tokenId, string willowId, address indexed owner);
    event OwnershipTransferred(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price);
    event ValuationUpdated(uint256 indexed tokenId, uint256 oldVal, uint256 newVal);

    constructor(address admin) ERC721("WillowPropertyNFT", "WPNFT") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(WILLOW_ADMIN_ROLE,  admin);
    }

    /// @notice Mint a new property NFT — only callable by WILLOW_ADMIN
    function mintProperty(
        address         owner,
        string calldata willowId,
        string calldata metadataURI,
        string calldata location,
        uint256         valuation
    ) external onlyRole(WILLOW_ADMIN_ROLE) whenNotPaused returns (uint256) {
        uint256 tokenId = ++tokenCounter;
        _safeMint(owner, tokenId);
        _setTokenURI(tokenId, metadataURI);

        properties[tokenId] = PropertyData({
            willowPropertyId: willowId,
            metadataURI:      metadataURI,
            location:         location,
            valuationNaira:   valuation,
            uosScore:         0,
            isVerified:       false,
            registeredAt:     block.timestamp
        });
        propertyOwner[tokenId] = owner;

        emit PropertyRegistered(tokenId, willowId, owner);
        return tokenId;
    }

    /// @notice Record an on-chain ownership transfer (NFT + registry update)
    function transferOwnership(
        uint256 tokenId,
        address newOwner,
        uint256 salePrice
    ) external nonReentrant whenNotPaused {
        require(
            ownerOf(tokenId) == msg.sender || hasRole(WILLOW_ADMIN_ROLE, msg.sender),
            "Not authorised"
        );
        address oldOwner = propertyOwner[tokenId];
        propertyOwner[tokenId] = newOwner;
        _transfer(msg.sender, newOwner, tokenId);
        emit OwnershipTransferred(tokenId, oldOwner, newOwner, salePrice);
    }

    /// @notice Update valuation — called by AI oracle after Claude analysis
    function updateValuation(
        uint256 tokenId,
        uint256 newValuation,
        uint256 newUOS
    ) external onlyRole(AI_ORACLE_ROLE) {
        uint256 oldVal = properties[tokenId].valuationNaira;
        if (newValuation > 0) properties[tokenId].valuationNaira = newValuation;
        properties[tokenId].uosScore = newUOS;
        emit ValuationUpdated(tokenId, oldVal, newValuation);
    }

    /// @notice Update IPFS metadata URI — owner or admin
    function updateMetadata(uint256 tokenId, string calldata newURI) external {
        require(
            ownerOf(tokenId) == msg.sender || hasRole(WILLOW_ADMIN_ROLE, msg.sender),
            "Not authorised"
        );
        properties[tokenId].metadataURI = newURI;
        _setTokenURI(tokenId, newURI);
    }

    /// @notice Toggle Urchmond verified status
    function setVerified(uint256 tokenId, bool verified) external onlyRole(WILLOW_ADMIN_ROLE) {
        properties[tokenId].isVerified = verified;
    }

    function getPropertyData(uint256 tokenId) external view returns (PropertyData memory) {
        return properties[tokenId];
    }

    function pause()   external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    // ── Overrides ────────────────────────────────────────────────────────────
    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage) returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
