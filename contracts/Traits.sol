// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

import {ITraits} from "./interfaces/ITraits.sol";
import {IArtwork} from "./interfaces/IArtwork.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC1155, IERC165} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {PaymentSplitter} from "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * Implements ERC-1155 standard for trait tokens,
 * and provides Dutch Auction functionality for initial trait sales
 */
contract Traits is
    ITraits,
    ERC2981,
    ERC1155,
    ERC1155Supply,
    Ownable,
    PaymentSplitter
{
    using Strings for uint256;
    using Strings for address;

    IArtwork public artwork;
    address public royaltySplitter;
    string public constant VERSION = "1.0.0";
    uint256 public auctionStartTime;
    uint256 public auctionEndTime;
    uint256 public auctionStartPrice;
    uint256 public auctionEndPrice;
    TraitType[] private _traitTypes;
    Trait[] private _traits;

    constructor(
        uint96 _royaltyFeeNumerator,
        string memory _uri,
        address _artwork,
        address _owner,
        address[] memory _primarySalesPayees,
        uint256[] memory _primarySalesShares,
        address[] memory _royaltyPayees,
        uint256[] memory _royaltyShares
    ) ERC1155(_uri) PaymentSplitter(_primarySalesPayees, _primarySalesShares) {
        artwork = IArtwork(_artwork);
        _transferOwnership(_owner);
        address _royaltySplitter = address(
            new PaymentSplitter(_royaltyPayees, _royaltyShares)
        );
        _setDefaultRoyalty(_royaltySplitter, _royaltyFeeNumerator);
        royaltySplitter = _royaltySplitter;
    }

    /** @inheritdoc ITraits*/
    function createTraitsAndTypes(
        string[] memory _traitTypeNames,
        string[] memory _traitTypeValues,
        string[] calldata _traitNames,
        string[] calldata _traitValues,
        uint256[] calldata _traitTypeIndexes,
        uint256[] calldata _traitMaxSupplys
    ) external onlyOwner {
        if (artwork.locked()) revert Locked();
        if (_traits.length != 0 || _traitTypes.length != 0)
            revert TraitsAlreadyCreated();
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

    /** @inheritdoc ITraits*/
    function scheduleAuction(
        uint256 _auctionStartTime,
        uint256 _auctionEndTime,
        uint256 _auctionStartPrice,
        uint256 _auctionEndPrice
    ) external onlyOwner {
        if (!artwork.locked()) revert NotLocked();
        if (
            _auctionEndTime < _auctionStartTime ||
            _auctionEndPrice > _auctionStartPrice
        ) revert InvalidAuction();

        auctionStartTime = _auctionStartTime;
        auctionEndTime = _auctionEndTime;
        auctionStartPrice = _auctionStartPrice;
        auctionEndPrice = _auctionEndPrice;
    }

    /** @inheritdoc ITraits*/
    function updateURI(string memory _uri) external onlyOwner {
        _setURI(_uri);
    }

    /** @inheritdoc ITraits*/
    function buyTraits(
        address _recipient,
        uint256[] calldata _traitTokenIds,
        uint256[] calldata _traitAmounts
    ) external payable {
        if (_traitTokenIds.length != _traitAmounts.length)
            revert InvalidArrayLengths();

        uint256 _traitCount;
        uint256 _traitPrice = traitPrice();

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

        if (msg.value < _traitCount * _traitPrice) revert InvalidEthAmount();

        _mintBatch(_recipient, _traitTokenIds, _traitAmounts, "");

        emit TraitsBought(_recipient, _traitTokenIds, _traitAmounts);
    }

    /** @inheritdoc ITraits*/
    function transferTraitsToCreateArtwork(
        address _caller,
        uint256[] calldata _traitTokenIds
    ) external {
        if (msg.sender != address(artwork)) revert OnlyArtwork();
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
        for (uint256 i = 0; i < traitCount; ) {
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
    function traitPrice() public view returns (uint256 _price) {
        if (block.timestamp < auctionStartTime) revert AuctionNotLive();
        if (block.timestamp > auctionEndTime) {
            // Auction has ended
            _price = auctionEndPrice;
        } else {
            // Auction is active
            _price =
                auctionStartPrice -
                (
                    (((block.timestamp - auctionStartTime) *
                        (auctionStartPrice - auctionEndPrice)) /
                        (auctionEndTime - auctionStartTime))
                );
        }
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

        return
            string(
                abi.encodePacked(
                    super.uri(_tokenId),
                    address(this).toHexString(),
                    "/",
                    _tokenId.toString()
                )
            );
    }

    /** @inheritdoc ITraits*/
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ITraits, ERC1155, ERC2981) returns (bool) {
        return
            interfaceId == type(ITraits).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
