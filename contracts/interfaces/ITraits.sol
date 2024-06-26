// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

import {IBaseSetup} from "./IBaseSetup.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface ITraits is IBaseSetup, IERC1155 {
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

    struct TraitsSetup {
        string[] traitTypeNames;
        string[] traitTypeValues;
        string[] traitNames;
        string[] traitValues;
        uint256[] traitTypeIndexes;
        uint256[] traitMaxSupplys;
    }

    event AuctionUpdated(
        uint256 auctionStartTime,
        uint256 auctionEndTime,
        uint256 auctionStartPrice,
        uint256 auctionEndPrice,
        uint256 auctionPriceSteps,
        bool auctionExponential,
        uint256 traitsSaleStartTime
    );

    error OnlyArtwork();
    error OnlyProjectRegistry();
    error AlreadySetup();
    error AuctionIsLive();
    error InvalidAuction();
    error MaxSupply();
    error InvalidEthAmount();
    error InvalidTraits();
    error AuctionNotLive();
    error InvalidTokenId();
    error TraitsSaleStartTime();
    error InvalidArrayLengths();
    error Cancelled();

    /**
     * Updates the schedule of the dutch auction, can only
     * be called if the dutch auction hasn't started yet, and
     * can only update the auction to a later time, not sooner
     *
     * @param _auctionStartTime timestamp the auction begins at
     * @param _auctionEndTime timestamp the auction ends at
     * @param _auctionStartPrice trait price the auction begins at
     * @param _auctionEndPrice trait price the auction ends at
     * @param _auctionPriceSteps number of different prices auction steps through
     * @param _auctionExponential true indicates auction curve is exponential, otherwise linear
     * @param _traitsSaleStartTime timestamp at which traits can be bought individually
     */
    function updateAuction(
        uint256 _auctionStartTime,
        uint256 _auctionEndTime,
        uint256 _auctionStartPrice,
        uint256 _auctionEndPrice,
        uint256 _auctionPriceSteps,
        bool _auctionExponential,
        uint256 _traitsSaleStartTime
    ) external;

    /**
     * Allows a user to mint any number of traits and amounts using ether
     *
     * @param _recipient the address to receive the trait tokens
     * @param _traitTokenIds the trait token IDs to buy
     * @param _traitAmounts the amounts of each token ID to buy
     */
    function mintTraits(
        address _recipient,
        uint256[] calldata _traitTokenIds,
        uint256[] calldata _traitAmounts
    ) external payable;

    /**
     * Mints traits for artist proof and for whitelisted mints
     *
     * @param _recipient address to receive the minted traits
     * @param _traitTokenIds trait token IDs to mint
     */
    function mintTraitsWhitelistOrProof(
        address _recipient,
        uint256[] calldata _traitTokenIds
    ) external;

    /**
     * Called by the Artwork contract to transfer traits from the caller to the Artwork
     * contract to create a new Artwork token
     *
     * @param _caller the address creating the artwork
     * @param _traitTokenIds the trait token IDs used to create the artwork
     */
    function transferTraitsToMintArtwork(
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
     * Returns which price step the auction is currently on
     *
     * @return the current price step
     */
    function traitPriceStep() external view returns (uint256);

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
     * Returns the auction start timestamp
     *
     * @return uint256 the timestamp the auction starts
     */
    function auctionStartTime()
        external
        view
        returns (uint256);

    /**
     * Returns whether the specified interface ID is supported by the contract
     *
     * @param interfaceId the interface ID to check
     * @return bool True if the interface is supported, otherwise False
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}
