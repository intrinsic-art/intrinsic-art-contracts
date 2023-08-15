// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IArtwork is IERC721 {
    struct ArtworkData {
        bytes32 hash;
        uint256[] traitTokenIds;
    }

    error TraitsAlreadySet();
    error TraitsNotSet();
    error Locked();
    error OnlyArtist();
    error OnlyArtworkOwner();

    event BaseURIUpdated(string baseURI);
    event ArtworkCreated(
        uint256 indexed artworkTokenId,
        uint256[] traitTokenIds,
        bytes32 hash,
        address indexed creator
    );
    event TraitsReclaimed(
        uint256 indexed artworkTokenId,
        address indexed caller
    );

    /**
     * Sets the address of the Traits contract
     *
     * @param _traits address of the traits contract
     */
    function setTraits(address _traits) external;

    /**
     * Updates the script at the specified index in the scripts array
     *
     * @param _scriptIndex index of the script to update
     * @param _script updated generative script
     */
    function updateScript(
        uint256 _scriptIndex,
        string calldata _script
    ) external;

    /**
     * Updates the URI base string
     *
     * @param _baseURI the updated base URI string
     */
    function updateBaseURI(string memory _baseURI) external;

    /**
     * Locks the project so that project configuration is immutable
     * before the trait auction begins
     */
    function lockProject() external;

    /**
     * Creates a new artwork with the specified trait token IDs
     * The caller must own the specified traits
     *
     * @param _traitTokenIds the trait token IDs to create the artwork with
     * @param _saltNonce salt number that is used to generate the artwork hash
     * @return _artworkTokenId the token ID of the newly minted artwork
     */
    function createArtwork(
        uint256[] calldata _traitTokenIds,
        uint256 _saltNonce
    ) external returns (uint256 _artworkTokenId);

    /**
     * Reclaims the traits the specified artwork token into the traits its composed of
     * The artwork token is burned, and the token ID will never be reused
     * The traits are transferred to the caller's address
     *
     * @param _artworkTokenId the token ID of the artwork being reclaimed
     */
    function reclaimTraits(uint256 _artworkTokenId) external;

    /**
     * Buys traits with specified amounts, and create an artwork in a single transaction
     *
     * @param _traitTokenIdsToBuy token IDs of the traits to buy
     * @param _traitAmountsToBuy amounts of each trait to buy
     * @param _traitTokenIdsToCreateArtwork token IDs of the traits to use to create the artwork
     * @param _saltNonce salt number that is used to generate the artwork hash
     */
    function buyTraitsCreateArtwork(
        uint256[] calldata _traitTokenIdsToBuy,
        uint256[] calldata _traitAmountsToBuy,
        uint256[] calldata _traitTokenIdsToCreateArtwork,
        uint256 _saltNonce
    ) external payable;

    /**
     * Returns the URI of the specified token ID
     *
     * @param _tokenId token ID to get URI for
     * @return string the token URI
     */
    function tokenURI(uint256 _tokenId) external view returns (string memory);

    /**
     * Returns info about the specified artwork token
     *
     * @param _artworkTokenId token ID of the artwork
     * @return _traitTokenIds the token IDs of the traits the artwork contains
     * @return _traitNames the human readable trait names contained in the artwork
     * @return _traitValues the trait values used by the generative script
     * @return _traitTypeNames the human readable trait type names
     * @return _traitTypeValues the trait type values used by the generative script
     * @return _hash the artwork hash
     */
    function artwork(
        uint256 _artworkTokenId
    )
        external
        view
        returns (
            uint256[] memory _traitTokenIds,
            string[] memory _traitNames,
            string[] memory _traitValues,
            string[] memory _traitTypeNames,
            string[] memory _traitTypeValues,
            bytes32 _hash
        );

    /**
     * Returns an array of strings to be concatenated together to form the generative script
     *
     * @return _scripts the array of script strings
     */
    function projectScripts() external view returns (string[] memory _scripts);

    /**
     * Returns the number of strings contained in the script array
     *
     * @return uint256 the number of script strings
     */
    function projectScriptCount() external view returns (uint256);

    /**
     * Returns the specified user's nonce, which is used to generate artwork hashes
     *
     * @param _user the address of the user
     * @return uint256 the user's nonce
     */
    function userNonce(address _user) external view returns (uint256);

    /**
     * Returns whether the project has been locked
     *
     * @return bool True if the project is locked, otherwise False
     */
    function locked() external view returns (bool);

    /**
     * Returns whether the specified interface ID is supported by the contract
     *
     * @param interfaceId the interface ID to check
     * @return bool True if the interface is supported, otherwise False
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}