// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface ITraits is IERC1155 {
    struct TraitType {
        string name;
        string value;
    }

    struct Trait {
        string name;
        string value;
        uint256 typeIndex;
        uint256 maxSupply;
    }

    event TraitsBought(
        address indexed recipient,
        uint256[] traitTokenIds,
        uint256[] traitAmounts
    );

    error OnlyArtwork();
    error Locked();
    error InvalidArrayLengths();
    error NotLocked();
    error InvalidAuction();
    error OnlyClaimer();
    error MaxSupply();
    error InvalidEthAmount();
    error InvalidTraits();
    error NoRevenue();
    error AuctionNotLive();
    error TraitsAlreadyCreated();
    error InvalidTokenId();
    error TraitsSaleStartTime();

    /**
     * Sets up the traits and trait types
     *
     * @param _traitTypeNames human readable trait type names
     * @param _traitTypeValues trait type values used in the generative scripts
     * @param _traitNames human readable trait names
     * @param _traitValues trait values used in the generative scripts
     * @param _traitTypeIndexes trait type indexes each trait belongs to
     * @param _traitMaxSupplys maximum number of mints for each trait
     */
    function createTraitsAndTypes(
        string[] memory _traitTypeNames,
        string[] memory _traitTypeValues,
        string[] calldata _traitNames,
        string[] calldata _traitValues,
        uint256[] calldata _traitTypeIndexes,
        uint256[] calldata _traitMaxSupplys
    ) external;

    /**
     * Schedules the dutch auction start and end time, and the prices
     * the traits will start and end the auction at
     *
     * @param _auctionStartTime timestamp the auction begins at
     * @param _auctionEndTime timestamp the auction ends at
     * @param _auctionStartPrice trait price the auction begins at
     * @param _auctionEndPrice trait price the auction ends at
     * @param _traitsSaleStartTime timestamp at which traits can be bought individually
     */
    function scheduleAuction(
        uint256 _auctionStartTime,
        uint256 _auctionEndTime,
        uint256 _auctionStartPrice,
        uint256 _auctionEndPrice,
        uint256 _traitsSaleStartTime
    ) external;

    /**
     * Updates the base URI string used to get full token URIs
     *
     * @param _uri the new base URI string
     */
    function updateURI(string memory _uri) external;

    /**
     * Allows a user to buy any number of traits and amounts using ether
     *
     * @param _recipient the address to receive the trait tokens
     * @param _traitTokenIds the trait token IDs to buy
     * @param _traitAmounts the amounts of each token ID to buy
     */
    function buyTraits(
        address _recipient,
        uint256[] calldata _traitTokenIds,
        uint256[] calldata _traitAmounts
    ) external payable;

    /**
     * Called by the Artwork contract to transfer traits from the caller to the Artwork
     * contract to create a new Artwork token
     *
     * @param _caller the address creating the artwork
     * @param _traitTokenIds the trait token IDs used to create the artwork
     */
    function transferTraitsToCreateArtwork(
        address _caller,
        uint256[] calldata _traitTokenIds
    ) external;

    /**
     * Returns the trait types
     *
     * @return _traitTypeNames human readable trait type names
     * @return _traitTypeValues trait type values used in the generative script
     */
    function traitTypes()
        external
        view
        returns (
            string[] memory _traitTypeNames,
            string[] memory _traitTypeValues
        );

    /**
     * Returns info about an individual trait
     *
     * @param _tokenId token ID to get info about
     * @return _traitName human readable trait name
     * @return _traitValue trait type value used in the generative script
     * @return _traitTypeName human readable trait type name
     * @return _traitTypeValue trait type value used in the generative script
     */
    function trait(
        uint256 _tokenId
    )
        external
        view
        returns (
            string memory _traitName,
            string memory _traitValue,
            string memory _traitTypeName,
            string memory _traitTypeValue
        );

    /**
     * Returns info about all traits
     *
     * @return _traitTokenIds token IDs of the traits
     * @return _traitNames human readable trait names
     * @return _traitValues trait type values used in the generative script
     * @return _traitTypeIndexes trait type index each trait belongs to
     * @return _traitTypeNames human readable trait type names
     * @return _traitTypeValues trait type values used in the generative script
     * @return _traitTotalSupplys total supply of each trait
     * @return _traitMaxSupplys max supply of each trait
     */
    function traits()
        external
        view
        returns (
            uint256[] memory _traitTokenIds,
            string[] memory _traitNames,
            string[] memory _traitValues,
            uint256[] memory _traitTypeIndexes,
            string[] memory _traitTypeNames,
            string[] memory _traitTypeValues,
            uint256[] memory _traitTotalSupplys,
            uint256[] memory _traitMaxSupplys
        );

    /**
     * Returns the current trait price
     *
     * @return _price the current trait price in ether
     */
    function traitPrice() external view returns (uint256 _price);

    /**
     * Returns the max supply of the specified token ID
     *
     * @return _maxSupply the max supply of the token
     */
    function maxSupply(
        uint256 _tokenId
    ) external view returns (uint256 _maxSupply);

    /**
     * Returns the URI of the specified token ID
     *
     * @param _tokenId the token ID to get the URI for
     * @return string the token specific URI
     */
    function uri(uint256 _tokenId) external view returns (string memory);

    /**
     * Returns whether the specified interface ID is supported by the contract
     *
     * @param interfaceId the interface ID to check
     * @return bool True if the interface is supported, otherwise False
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}
