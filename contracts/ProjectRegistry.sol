//SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract ProjectRegistry is OwnableUpgradeable {
    struct Project {
        address artwork;
        address traits;
    }

    uint256 public projectCount;
    mapping(address => bool) public admins;
    mapping(uint256 => Project) public projects;

    event ProjectRegistered(uint256 projectId, address artwork, address traits);

    error OnlyAdmin();

    modifier onlyAdmin() {
        if(!admins[msg.sender]) revert OnlyAdmin();
        _;
    }

    function initialize(
        address _owner,
        address[] calldata _admins
    ) external initializer {
        _transferOwnership(_owner);
        _addAdmins(_admins);
    }

    function registerProject(
        address _artwork,
        address _traits
    ) external onlyAdmin {
        projectCount++;

        projects[projectCount].artwork = _artwork;
        projects[projectCount].traits = _traits;

        emit ProjectRegistered(projectCount, _artwork, _traits);
    }

    function addAdmins(address[] calldata _admins) external onlyOwner {
        _addAdmins(_admins);
    }

    function _addAdmins(address[] calldata _admins) private {
        for (uint256 i; i < _admins.length; i++) {
            admins[_admins[i]] = true;
        }
    }

    function removeAdmins(address[] calldata _admins) external onlyOwner {
        _removeAdmins(_admins);
    }

    function _removeAdmins(address[] calldata _admins) private {
        for (uint256 i; i < _admins.length; i++) {
            admins[_admins[i]] = false;
        }
    }
}
