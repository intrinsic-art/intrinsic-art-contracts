// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

interface IProjectRegistry {
    struct Project {
        address artwork;
        address traits;
    }

    error OnlyAdmin();
    error InvalidAddress();
    error InvalidArrayLengths();
    error OnlyDeregisterLastProject();

    event BaseURIUpdated(string baseURI);
    event ProjectRegistered(
        uint256 indexed projectId,
        address indexed artwork,
        address indexed traits
    );
    event ProjectDeregistered(uint256 indexed projectId);
    event AdminAdded(address indexed account);
    event AdminRemoved(address indexed account);

    /**
     * Updates the URI base string
     *
     * @param _baseURI the updated base URI string
     */
    function updateBaseURI(string memory _baseURI) external;

    /**
     * Registers a project by storing the Artwork and Traits contract addresses,
     * and calls setup on both contracts with the corresponding bytes data
     *
     * @param _artwork the address of the Artwork contract
     * @param _artworkData data to pass to setup function of the Artwork contract
     * @param _traits the address of the Traits contract
     * @param _traitsData data to pass to setup function of the Traits contract
     */
    function registerProject(
        address _artwork,
        bytes calldata _artworkData,
        address _traits,
        bytes calldata _traitsData
    ) external;

    /**
     * Deregisters a project and zeroes out the addresses in the project mapping
     * Will revert if called after a projects auction has started
     *
     * @param _projectId the ID of the project
     */
    function deregisterProject(uint256 _projectId) external;

    /**
     * Executes an arbitrary number of external function calls
     *
     * @param _targets the array of addresses to call
     * @param _values array of Ether amounts for each transaction
     * @param _calldatas array of transaction calldata bytes
     */
    function execute(
        address[] calldata _targets,
        uint256[] calldata _values,
        bytes[] calldata _calldatas
    ) external;

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

    /**
     * Returns the base URI string
     *
     * @return the base URI string
     */
    function baseURI() external view returns (string memory);
}
