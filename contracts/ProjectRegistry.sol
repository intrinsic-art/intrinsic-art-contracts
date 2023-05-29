// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IProjectRegistry} from "./interfaces/IProjectRegistry.sol";

/**
 * Provides functionality for registering the Traits and Artwork
 * contract addresses for each intrinsic.art project
 */
contract ProjectRegistry is IProjectRegistry, Ownable {
    uint256 public projectCount;
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
    function registerProject(
        address _artwork,
        address _traits
    ) external onlyAdmin {
        projectCount++;

        projects[projectCount].artwork = _artwork;
        projects[projectCount].traits = _traits;

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
        for (uint256 i; i < _admins.length; i++) {
            admins[_admins[i]] = true;

            emit AdminAdded(_admins[i]);
        }
    }

    /**
     * Removes multiple addresses from being admins
     *
     * @param _admins the addresses remove from being admins
     */
    function _removeAdmins(address[] memory _admins) private {
        for (uint256 i; i < _admins.length; i++) {
            admins[_admins[i]] = false;

            emit AdminRemoved(_admins[i]);
        }
    }
}
