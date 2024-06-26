// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

import {ITraits, IBaseSetup} from "./interfaces/ITraits.sol";
import {IArtwork} from "./interfaces/IArtwork.sol";
import {IProjectRegistry} from "./interfaces/IProjectRegistry.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

/**
 * Implements ERC-1155 standard for trait tokens,
 * and provides Dutch Auction functionality for initial trait sales
 */
contract Traits is ITraits, ERC2981, ERC1155, ERC1155Supply {
    using Strings for uint256;
    using Strings for address;

    bool public auctionExponential;
    bool public cancelled;
    string public constant VERSION = "1.0";
    IArtwork public artwork;
    IProjectRegistry public projectRegistry;
    address payable public primarySalesReceiver;
    uint256 public auctionStartTime;
    uint256 public auctionEndTime;
    uint256 public auctionStartPrice;
    uint256 public auctionEndPrice;
    uint256 public auctionPriceSteps;
    uint256 public traitsSaleStartTime;

    TraitType[] private _traitTypes;
    Trait[] private _traits;

    modifier onlyArtwork() {
        if (msg.sender != address(artwork)) revert OnlyArtwork();
        _;
    }

    modifier onlyProjectRegistry() {
        if (msg.sender != address(projectRegistry))
            revert OnlyProjectRegistry();
        _;
    }

    modifier notCancelled() {
        if (cancelled) revert Cancelled();
        _;
    }

    constructor(
        address _projectRegistry,
        address _primarySalesReceiver,
        TraitsSetup memory _traitsSetup
    ) ERC1155("") {
        projectRegistry = IProjectRegistry(_projectRegistry);
        primarySalesReceiver = payable(_primarySalesReceiver);

        _createTraitsAndTypes(
            _traitsSetup.traitTypeNames,
            _traitsSetup.traitTypeValues,
            _traitsSetup.traitNames,
            _traitsSetup.traitValues,
            _traitsSetup.traitTypeIndexes,
            _traitsSetup.traitMaxSupplys
        );
    }

    /** @inheritdoc IBaseSetup*/
    function setup(bytes calldata _data) external onlyProjectRegistry {
        if (address(artwork) != address(0)) revert AlreadySetup();

        (
            address _artwork,
            bool _auctionExponential,
            uint256 _auctionStartTime,
            uint256 _auctionEndTime,
            uint256 _auctionStartPrice,
            uint256 _auctionEndPrice,
            uint256 _auctionPriceSteps,
            uint256 _traitsSaleStartTime
        ) = abi.decode(
                _data,
                (
                    address,
                    bool,
                    uint256,
                    uint256,
                    uint256,
                    uint256,
                    uint256,
                    uint256
                )
            );

        artwork = IArtwork(_artwork);

        _updateAuction(
            _auctionStartTime,
            _auctionEndTime,
            _auctionStartPrice,
            _auctionEndPrice,
            _auctionPriceSteps,
            _auctionExponential,
            _traitsSaleStartTime
        );
    }

    /** @inheritdoc IBaseSetup*/
    function cancel() external onlyProjectRegistry {
        if (block.timestamp >= auctionStartTime) revert AuctionIsLive();

        cancelled = true;
    }

    /** @inheritdoc ITraits*/
    function updateAuction(
        uint256 _auctionStartTime,
        uint256 _auctionEndTime,
        uint256 _auctionStartPrice,
        uint256 _auctionEndPrice,
        uint256 _auctionPriceSteps,
        bool _auctionExponential,
        uint256 _traitsSaleStartTime
    ) external onlyProjectRegistry {
        if (auctionStartTime <= block.timestamp) revert AuctionIsLive();

        _updateAuction(
            _auctionStartTime,
            _auctionEndTime,
            _auctionStartPrice,
            _auctionEndPrice,
            _auctionPriceSteps,
            _auctionExponential,
            _traitsSaleStartTime
        );
    }

    /** @inheritdoc ITraits*/
    function mintTraits(
        address _recipient,
        uint256[] calldata _traitTokenIds,
        uint256[] calldata _traitAmounts
    ) external payable notCancelled {
        if (_traitTokenIds.length != _traitAmounts.length)
            revert InvalidArrayLengths();
        if (
            msg.sender != address(artwork) &&
            block.timestamp < traitsSaleStartTime
        ) revert TraitsSaleStartTime();

        uint256 _traitCount;

        for (uint256 i; i < _traitAmounts.length; ) {
            _traitCount += _traitAmounts[i];
            if (
                totalSupply(_traitTokenIds[i]) + _traitAmounts[i] >
                _traits[_traitTokenIds[i]].maxSupply
            ) revert MaxSupply();
            unchecked {
                ++i;
            }
        }

        if (msg.value < _traitCount * traitPrice()) revert InvalidEthAmount();

        _mintBatch(_recipient, _traitTokenIds, _traitAmounts, "");

        primarySalesReceiver.transfer(msg.value);
    }

    /** @inheritdoc ITraits*/
    function mintTraitsWhitelistOrProof(
        address _recipient,
        uint256[] calldata _traitTokenIds
    ) external onlyArtwork notCancelled {
        if (_traitTokenIds.length != _traitTypes.length)
            revert InvalidArrayLengths();

        uint256[] memory traitAmounts = new uint256[](_traitTokenIds.length);

        for (uint256 i; i < _traitTokenIds.length; ) {
            if (_traits[_traitTokenIds[i]].typeIndex != i)
                revert InvalidTraits();
            if (
                totalSupply(_traitTokenIds[i]) + 1 >
                _traits[_traitTokenIds[i]].maxSupply
            ) revert MaxSupply();
            traitAmounts[i] = 1;

            unchecked {
                ++i;
            }
        }

        _mintBatch(_recipient, _traitTokenIds, traitAmounts, "");
    }

    /** @inheritdoc ITraits*/
    function transferTraitsToMintArtwork(
        address _caller,
        uint256[] calldata _traitTokenIds
    ) external onlyArtwork notCancelled {
        if (_traitTokenIds.length != _traitTypes.length)
            revert InvalidArrayLengths();

        uint256[] memory amounts = new uint256[](_traitTokenIds.length);

        for (uint256 i; i < _traitTokenIds.length; ) {
            if (_traits[_traitTokenIds[i]].typeIndex != i)
                revert InvalidTraits();
            amounts[i] = 1;
            unchecked {
                ++i;
            }
        }

        _safeBatchTransferFrom(
            _caller,
            address(artwork),
            _traitTokenIds,
            amounts,
            ""
        );
    }

    /** @inheritdoc ITraits*/
    function traitTypes()
        external
        view
        returns (
            string[] memory _traitTypeNames,
            string[] memory _traitTypeValues
        )
    {
        uint256 traitTypeCount = _traitTypes.length;
        _traitTypeNames = new string[](traitTypeCount);
        _traitTypeValues = new string[](traitTypeCount);

        for (uint256 i; i < traitTypeCount; ) {
            _traitTypeNames[i] = _traitTypes[i].name;
            _traitTypeValues[i] = _traitTypes[i].value;
            unchecked {
                ++i;
            }
        }
    }

    /** @inheritdoc ITraits*/
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
        )
    {
        if (_tokenId >= _traits.length) revert InvalidTokenId();

        _traitName = _traits[_tokenId].name;
        _traitValue = _traits[_tokenId].value;
        _traitTypeName = _traitTypes[_traits[_tokenId].typeIndex].name;
        _traitTypeValue = _traitTypes[_traits[_tokenId].typeIndex].value;
    }

    /** @inheritdoc ITraits*/
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
        )
    {
        uint256 traitCount = _traits.length;
        _traitTokenIds = new uint256[](traitCount);
        _traitNames = new string[](traitCount);
        _traitValues = new string[](traitCount);
        _traitTypeIndexes = new uint256[](traitCount);
        _traitTypeNames = new string[](traitCount);
        _traitTypeValues = new string[](traitCount);
        _traitTotalSupplys = new uint256[](traitCount);
        _traitMaxSupplys = new uint256[](traitCount);
        for (uint256 i; i < traitCount; ) {
            _traitTokenIds[i] = i;
            _traitNames[i] = _traits[i].name;
            _traitValues[i] = _traits[i].value;
            _traitTypeIndexes[i] = _traits[i].typeIndex;
            _traitTypeNames[i] = _traitTypes[_traits[i].typeIndex].name;
            _traitTypeValues[i] = _traitTypes[_traits[i].typeIndex].value;
            _traitTotalSupplys[i] = totalSupply(i);
            _traitMaxSupplys[i] = _traits[i].maxSupply;
            unchecked {
                ++i;
            }
        }
    }

    /** @inheritdoc ITraits*/
    function traitPriceStep() public view returns (uint256) {
        if (block.timestamp < auctionStartTime) revert AuctionNotLive();
        if (block.timestamp >= auctionEndTime) return auctionPriceSteps - 1;

        return
            (auctionPriceSteps * (block.timestamp - auctionStartTime)) /
            (auctionEndTime - auctionStartTime);
    }

    /** @inheritdoc ITraits*/
    function traitPrice() public view returns (uint256) {
        // Auction is active
        if (auctionExponential) {
            // Exponential curve auction
            return
                (((auctionStartPrice - auctionEndPrice) *
                    (auctionPriceSteps - traitPriceStep() - 1) ** 2) /
                    (auctionPriceSteps - 1) ** 2) + auctionEndPrice;
        }

        // Linear curve auction
        return
            auctionStartPrice -
            ((traitPriceStep() * (auctionStartPrice - auctionEndPrice)) /
                (auctionPriceSteps - 1));
    }

    /** @inheritdoc ITraits*/
    function maxSupply(
        uint256 _tokenId
    ) external view returns (uint256 _maxSupply) {
        _maxSupply = _traits[_tokenId].maxSupply;
    }

    /** @inheritdoc ITraits*/
    function uri(
        uint256 _tokenId
    ) public view override(ERC1155, ITraits) returns (string memory) {
        if (_tokenId >= _traits.length) revert InvalidTokenId();

        string memory baseURI = projectRegistry.baseURI();

        return
            bytes(baseURI).length != 0
                ? string(
                    abi.encodePacked(
                        baseURI,
                        address(this).toHexString(),
                        "/",
                        _tokenId.toString()
                    )
                )
                : "";
    }

    /** @inheritdoc ITraits*/
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ITraits, ERC1155, ERC2981) returns (bool) {
        return
            interfaceId == type(ITraits).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /** @inheritdoc ERC2981*/
    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) public view override returns (address, uint256) {
        return artwork.royaltyInfo(tokenId, salePrice);
    }

    /** @inheritdoc ERC1155*/
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

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
    function _createTraitsAndTypes(
        string[] memory _traitTypeNames,
        string[] memory _traitTypeValues,
        string[] memory _traitNames,
        string[] memory _traitValues,
        uint256[] memory _traitTypeIndexes,
        uint256[] memory _traitMaxSupplys
    ) private {
        if (
            _traitTypeNames.length == 0 ||
            _traitNames.length == 0 ||
            _traitTypeNames.length != _traitTypeValues.length ||
            _traitNames.length != _traitValues.length ||
            _traitNames.length != _traitTypeIndexes.length ||
            _traitNames.length != _traitMaxSupplys.length
        ) revert InvalidArrayLengths();

        // Push trait types to array
        for (uint256 i; i < _traitTypeNames.length; ) {
            _traitTypes.push(
                TraitType({
                    name: _traitTypeNames[i],
                    value: _traitTypeValues[i]
                })
            );
            unchecked {
                ++i;
            }
        }

        // Push traits to array
        for (uint256 i; i < _traitNames.length; ) {
            _traits.push(
                Trait({
                    name: _traitNames[i],
                    value: _traitValues[i],
                    typeIndex: _traitTypeIndexes[i],
                    maxSupply: _traitMaxSupplys[i]
                })
            );
            unchecked {
                ++i;
            }
        }
    }

    /**
     * Updates auction data
     *
     * @param _auctionStartTime timestamp the auction begins at
     * @param _auctionEndTime timestamp the auction ends at
     * @param _auctionStartPrice trait price the auction begins at
     * @param _auctionEndPrice trait price the auction ends at
     * @param _auctionPriceSteps number of different prices auction steps through
     * @param _auctionExponential true indicates auction curve is exponential, otherwise linear
     * @param _traitsSaleStartTime timestamp at which traits can be bought individually

     */
    function _updateAuction(
        uint256 _auctionStartTime,
        uint256 _auctionEndTime,
        uint256 _auctionStartPrice,
        uint256 _auctionEndPrice,
        uint256 _auctionPriceSteps,
        bool _auctionExponential,
        uint256 _traitsSaleStartTime
    ) private {
        if (
            _auctionEndTime < _auctionStartTime ||
            _auctionEndPrice > _auctionStartPrice ||
            _traitsSaleStartTime < _auctionStartTime ||
            _auctionStartTime < block.timestamp ||
            _auctionPriceSteps < 2
        ) revert InvalidAuction();

        auctionStartTime = _auctionStartTime;
        auctionEndTime = _auctionEndTime;
        auctionStartPrice = _auctionStartPrice;
        auctionEndPrice = _auctionEndPrice;
        auctionPriceSteps = _auctionPriceSteps;
        auctionExponential = _auctionExponential;
        traitsSaleStartTime = _traitsSaleStartTime;

        emit AuctionUpdated(
            _auctionStartTime,
            _auctionEndTime,
            _auctionStartPrice,
            _auctionEndPrice,
            _auctionPriceSteps,
            _auctionExponential,
            _traitsSaleStartTime
        );
    }
}
