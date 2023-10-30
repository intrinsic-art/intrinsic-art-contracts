// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

import {IProjectRegistry} from "./interfaces/IProjectRegistry.sol";
import {IArtwork} from "./interfaces/IArtwork.sol";
import {ITraits} from "./interfaces/ITraits.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * Provides functionality for registering the Traits and Artwork
 * contract addresses for each project
 */
contract ProjectRegistry is IProjectRegistry, Ownable {
    uint256 public projectCount;
    string public baseURI;
    mapping(address => bool) public admins;
    mapping(uint256 => Project) public projects;

    modifier onlyAdmin() {
        if (!admins[msg.sender]) revert OnlyAdmin();
        _;
    }

    constructor(address _owner, address[] memory _admins) {
        _transferOwnership(_owner);
        _addAdmins(_admins);
    }

    /** @inheritdoc IProjectRegistry*/
    function updateBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
        emit BaseURIUpdated(_baseURI);
    }

    /** @inheritdoc IProjectRegistry*/
    function registerProject(
        address _artwork,
        address _traits
    ) external onlyAdmin {
        if (_artwork == address(0) || _traits == address(0)) revert InvalidAddress();
        projectCount++;

        projects[projectCount].artwork = _artwork;
        projects[projectCount].traits = _traits;

        IArtwork(_artwork).setTraits(_traits);
        ITraits(_traits).setAr

        emit ProjectRegistered(projectCount, _artwork, _traits);
    }

    /** @inheritdoc IProjectRegistry*/
    function addAdmins(address[] memory _admins) external onlyOwner {
        _addAdmins(_admins);
    }

    /** @inheritdoc IProjectRegistry*/
    function removeAdmins(address[] memory _admins) external onlyOwner {
        _removeAdmins(_admins);
    }

    /**
     * Adds multiple addresses to be made admins
     *
     * @param _admins the addresses to make admins
     */
    function _addAdmins(address[] memory _admins) private {
        for (uint256 i; i < _admins.length; ) {
            admins[_admins[i]] = true;
            emit AdminAdded(_admins[i]);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * Removes multiple addresses from being admins
     *
     * @param _admins the addresses remove from being admins
     */
    function _removeAdmins(address[] memory _admins) private {
        for (uint256 i; i < _admins.length; ) {
            admins[_admins[i]] = false;
            emit AdminRemoved(_admins[i]);
            unchecked {
                ++i;
            }
        }
    }
}
