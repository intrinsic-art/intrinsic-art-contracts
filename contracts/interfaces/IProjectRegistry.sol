// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

interface IProjectRegistry {
    struct Project {
        address artwork;
        address traits;
    }

    error OnlyAdmin();

    event ProjectRegistered(
        uint256 indexed projectId,
        address indexed artwork,
        address indexed traits
    );
    event AdminAdded(address indexed account);
    event AdminRemoved(address indexed account);

    /**
     * Registers a project by storing the Artwork and Traits contract addresses
     *
     * @param _artwork the address of the Artwork contract
     * @param _traits the address of the Traits contract
     */
    function registerProject(address _artwork, address _traits) external;

    /**
     * Adds multiple addresses to be made admins
     *
     * @param _admins the addresses to make admins
     */
    function addAdmins(address[] memory _admins) external;

    /**
     * Removes multiple addresses from being admins
     *
     * @param _admins the addresses remove from being admins
     */
    function removeAdmins(address[] memory _admins) external;
}
