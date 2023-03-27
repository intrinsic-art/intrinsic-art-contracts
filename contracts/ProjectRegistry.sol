//SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract ProjectRegistry is OwnableUpgradeable {
    struct Project {
        address studio;
        address traits;
    }

    uint256 public projectCount;
    mapping(address => bool) public admins;
    mapping(uint256 => Project) public projects;

    event ProjectRegistered(uint256 projectId, address studio, address traits);

    modifier onlyAdmin() {
        require(admins[msg.sender], "P01");
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
        address _studio,
        address _traits
    ) external onlyAdmin {
        projectCount++;

        projects[projectCount].studio = _studio;
        projects[projectCount].traits = _traits;

        emit ProjectRegistered(projectCount, _studio, _traits);
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
