// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title WillowTitleRegistry
/// @notice On-chain land title registry — blockchain-native alternative to paper title deeds
contract WillowTitleRegistry is AccessControl, Pausable {
    bytes32 public constant URCHMOND_ADMIN_ROLE = keccak256("URCHMOND_ADMIN_ROLE");

    struct Title {
        uint256   propertyNFTId;
        string    titleNumber;      // mirrors physical C of O / R of O
        address   currentOwner;
        uint256   purchasePrice;
        uint256   acquisitionDate;
        bool      hasEncumbrance;
        address   encumbrancer;     // lender wallet (if mortgaged)
        string[]  documentIPFS;     // C of O, survey plan, deed of assignment
    }

    struct TransferRecord {
        address  from;
        address  to;
        uint256  salePrice;
        uint256  timestamp;
        string[] newDocIPFS;
    }

    struct EncumbranceRecord {
        address lender;
        uint256 loanAmount;
        uint256 loanEnd;
        uint256 registeredAt;
        bool    active;
    }

    mapping(uint256 => Title)               public titles;
    mapping(uint256 => TransferRecord[])    public transferHistory;
    mapping(uint256 => EncumbranceRecord[]) public encumbranceHistory;
    uint256[]                               public registeredTokenIds;

    event TitleRegistered(uint256 indexed nftTokenId, string titleNumber, address indexed owner);
    event TitleTransferred(uint256 indexed nftTokenId, address indexed from, address indexed to, uint256 price);
    event EncumbranceRegistered(uint256 indexed nftTokenId, address indexed lender, uint256 loanAmount);
    event EncumbranceDischarged(uint256 indexed nftTokenId, address indexed lender);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE,  admin);
        _grantRole(URCHMOND_ADMIN_ROLE, admin);
    }

    /// @notice First registration of a property title on-chain
    function registerTitle(
        uint256            nftTokenId,
        string calldata    titleNumber,
        address            owner,
        uint256            price,
        string[] calldata  docIPFS
    ) external onlyRole(URCHMOND_ADMIN_ROLE) whenNotPaused {
        require(titles[nftTokenId].acquisitionDate == 0, "Title already registered");
        titles[nftTokenId] = Title({
            propertyNFTId:  nftTokenId,
            titleNumber:    titleNumber,
            currentOwner:   owner,
            purchasePrice:  price,
            acquisitionDate: block.timestamp,
            hasEncumbrance: false,
            encumbrancer:   address(0),
            documentIPFS:   docIPFS
        });
        registeredTokenIds.push(nftTokenId);
        emit TitleRegistered(nftTokenId, titleNumber, owner);
    }

    /// @notice Transfer title to new owner (current owner or admin)
    function transferTitle(
        uint256            nftTokenId,
        address            newOwner,
        uint256            salePrice,
        string[] calldata  newDocIPFS
    ) external whenNotPaused {
        Title storage t = titles[nftTokenId];
        require(
            t.currentOwner == msg.sender || hasRole(URCHMOND_ADMIN_ROLE, msg.sender),
            "Not authorised"
        );
        require(!t.hasEncumbrance, "Property has active encumbrance");

        transferHistory[nftTokenId].push(TransferRecord({
            from:       t.currentOwner,
            to:         newOwner,
            salePrice:  salePrice,
            timestamp:  block.timestamp,
            newDocIPFS: newDocIPFS
        }));

        address oldOwner     = t.currentOwner;
        t.currentOwner       = newOwner;
        t.purchasePrice      = salePrice;
        t.acquisitionDate    = block.timestamp;
        t.documentIPFS       = newDocIPFS;

        emit TitleTransferred(nftTokenId, oldOwner, newOwner, salePrice);
    }

    /// @notice Lender registers a mortgage charge on the property
    function registerEncumbrance(
        uint256 nftTokenId,
        address lender,
        uint256 loanAmount,
        uint256 loanEnd
    ) external onlyRole(URCHMOND_ADMIN_ROLE) {
        titles[nftTokenId].hasEncumbrance = true;
        titles[nftTokenId].encumbrancer   = lender;
        encumbranceHistory[nftTokenId].push(EncumbranceRecord({
            lender:       lender,
            loanAmount:   loanAmount,
            loanEnd:      loanEnd,
            registeredAt: block.timestamp,
            active:       true
        }));
        emit EncumbranceRegistered(nftTokenId, lender, loanAmount);
    }

    /// @notice Lender confirms mortgage repaid — clears encumbrance
    function dischargeEncumbrance(uint256 nftTokenId) external {
        Title storage t = titles[nftTokenId];
        require(t.hasEncumbrance, "No active encumbrance");
        require(
            msg.sender == t.encumbrancer || hasRole(URCHMOND_ADMIN_ROLE, msg.sender),
            "Not lender"
        );
        t.hasEncumbrance = false;
        address lender   = t.encumbrancer;
        t.encumbrancer   = address(0);
        EncumbranceRecord[] storage records = encumbranceHistory[nftTokenId];
        if (records.length > 0) records[records.length - 1].active = false;
        emit EncumbranceDischarged(nftTokenId, lender);
    }

    function getTitleHistory(uint256 nftTokenId) external view returns (TransferRecord[] memory) {
        return transferHistory[nftTokenId];
    }

    function verifyOwnership(uint256 nftTokenId, address claimant) external view returns (bool) {
        return titles[nftTokenId].currentOwner == claimant;
    }

    function getTitle(uint256 nftTokenId) external view returns (Title memory) {
        return titles[nftTokenId];
    }

    function getAllRegisteredTokenIds() external view returns (uint256[] memory) {
        return registeredTokenIds;
    }

    function pause()   external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
}
