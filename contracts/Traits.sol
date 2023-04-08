// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {ITraits} from "./interfaces/ITraits.sol";
import {IArtwork} from "./interfaces/IArtwork.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract Traits is ITraits, ERC1155, ERC1155Supply, Ownable {
    IArtwork public artwork;
    address payable public platformRevenueClaimer;
    address payable public artistRevenueClaimer;
    string public constant VERSION = "1.0.0";
    uint256 public constant AUCTION_PLATFORM_FEE_NUMERATOR = 100_000;
    uint256 public constant FEE_DENOMINATOR = 1_000_000;
    uint256 public artistClaimableRevenues;
    uint256 public platformClaimableRevenues;
    uint256 public auctionStartTime;
    uint256 public auctionEndTime;
    uint256 public auctionStartPrice;
    uint256 public auctionEndPrice;
    TraitType[] private _traitTypes;
    Trait[] private _traits;

    modifier onlyArtwork() {
        if (msg.sender != address(artwork)) revert OnlyArtwork();
        _;
    }

    constructor(
        address _artwork,
        string memory _uri,
        address _owner,
        address payable _platformRevenueClaimer,
        address payable _artistRevenueClaimer
    ) ERC1155(_uri) {
        artwork = IArtwork(_artwork);
        _transferOwnership(_owner);
        platformRevenueClaimer = _platformRevenueClaimer;
        artistRevenueClaimer = _artistRevenueClaimer;
    }

    function createTraitsAndTypes(
        string[] memory _traitTypeNames,
        string[] memory _traitTypeValues,
        string[] calldata _traitNames,
        string[] calldata _traitValues,
        uint256[] calldata _traitTypeIndexes,
        uint256[] calldata _traitMaxRevenues
    ) external onlyOwner {
        if (artwork.locked()) revert Locked();
        if (
            _traitTypeNames.length == 0 ||
            _traitNames.length == 0 ||
            _traitTypeNames.length != _traitTypeValues.length ||
            _traitNames.length != _traitValues.length ||
            _traitNames.length != _traitTypeIndexes.length ||
            _traitNames.length != _traitMaxRevenues.length
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
                    maxRevenue: _traitMaxRevenues[i],
                    totalRevenue: 0
                })
            );

            unchecked {
                ++i;
            }
        }
    }

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

    function updateURI(string memory _uri) external onlyOwner {
        _setURI(_uri);
    }

    function updatePlatformRevenueClaimer(
        address payable _claimer
    ) external onlyOwner {
        platformRevenueClaimer = _claimer;
    }

    function updateArtistRevenueClaimer(address payable _claimer) external {
        if (msg.sender != artistRevenueClaimer) revert OnlyClaimer();

        artistRevenueClaimer = _claimer;
    }

    function buyTraits(
        address _recipient,
        uint256[] calldata _traitTokenIds,
        uint256[] calldata _traitAmounts
    ) public payable {
        if (_traitTokenIds.length != _traitAmounts.length)
            revert InvalidArrayLengths();

        uint256 _traitCount;
        uint256 _traitPrice = traitPrice();

        for (uint256 i; i < _traitAmounts.length; ) {
            _traitCount += _traitAmounts[i];

            uint256 newTraitRevenue = _traits[_traitTokenIds[i]].totalRevenue +
                (_traitPrice * _traitAmounts[i]);

            if (
                newTraitRevenue >
                _traits[_traitTokenIds[i]].maxRevenue + _traitPrice
            ) revert SoldOut();

            _traits[_traitTokenIds[i]].totalRevenue = newTraitRevenue;

            unchecked {
                ++i;
            }
        }

        uint256 ethCost = _traitCount * _traitPrice;

        if (msg.value < ethCost) revert InvalidEthAmount();

        uint256 platformRevenue = (msg.value * AUCTION_PLATFORM_FEE_NUMERATOR) /
            FEE_DENOMINATOR;
        platformClaimableRevenues += platformRevenue;
        artistClaimableRevenues += msg.value - platformRevenue;

        emit TraitsBought(_recipient, _traitTokenIds, _traitAmounts);

        _mintBatch(_recipient, _traitTokenIds, _traitAmounts, "");
    }

    function transferTraitsToCreateArtwork(
        address _caller,
        uint256[] calldata _traitTokenIds
    ) external onlyArtwork {
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

    function claimPlatformRevenue() external {
        if (msg.sender != platformRevenueClaimer) revert OnlyClaimer();
        uint256 claimedRevenue = platformClaimableRevenues;
        if (claimedRevenue == 0) revert NoRevenue();

        platformClaimableRevenues = 0;

        emit PlatformRevenueClaimed(claimedRevenue);

        platformRevenueClaimer.transfer(claimedRevenue);
    }

    function claimArtistRevenue() external {
        if (msg.sender != artistRevenueClaimer) revert OnlyClaimer();
        uint256 claimedRevenue = artistClaimableRevenues;
        if (claimedRevenue == 0) revert NoRevenue();

        artistClaimableRevenues = 0;

        emit ArtistRevenueClaimed(claimedRevenue);

        artistRevenueClaimer.transfer(claimedRevenue);
    }

    function maxSupply(
        uint256 _tokenId
    ) public view returns (uint256 _maxSupply) {
        if (_traits[_tokenId].maxRevenue >= _traits[_tokenId].totalRevenue) {
            _maxSupply =
                totalSupply(_tokenId) +
                ((_traits[_tokenId].maxRevenue -
                    _traits[_tokenId].totalRevenue) / auctionEndPrice) +
                1;
        } else {
            _maxSupply = totalSupply(_tokenId);
        }
    }

    function traits()
        public
        view
        returns (
            uint256[] memory _traitTokenIds,
            string[] memory _traitNames,
            string[] memory _traitValues,
            uint256[] memory _traitTypeIndexes,
            string[] memory _traitTypeNames,
            string[] memory _traitTypeValues
        )
    {
        uint256 traitCount = _traits.length;

        _traitTokenIds = new uint256[](traitCount);
        _traitNames = new string[](traitCount);
        _traitValues = new string[](traitCount);
        _traitTypeIndexes = new uint256[](traitCount);
        _traitTypeNames = new string[](traitCount);
        _traitTypeValues = new string[](traitCount);

        for (uint256 i = 0; i < traitCount; ) {
            _traitTokenIds[i] = i;
            _traitNames[i] = _traits[i].name;
            _traitValues[i] = _traits[i].value;
            _traitTypeIndexes[i] = _traits[i].typeIndex;
            _traitTypeNames[i] = _traitTypes[_traits[i].typeIndex].name;
            _traitTypeValues[i] = _traitTypes[_traits[i].typeIndex].value;

            unchecked {
                ++i;
            }
        }
    }

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

    function trait(
        uint256 _tokenId
    )
        public
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

    function traitTotalRevenue(
        uint256 _tokenId
    ) public view returns (uint256 _totalRevenue) {
        _totalRevenue = _traits[_tokenId].totalRevenue;
    }

    function traitMaxRevenue(
        uint256 _tokenId
    ) public view returns (uint256 _maxRevenue) {
        _maxRevenue = _traits[_tokenId].maxRevenue;
    }

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
}
