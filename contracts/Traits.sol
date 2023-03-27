// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {ITraits} from "./interfaces/ITraits.sol";
import {IStudio} from "./interfaces/IStudio.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract Traits is ITraits, ERC1155, ERC1155Supply, Ownable {
    IStudio public studio;
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

    error OnlyStudio();
    error Locked();
    error InvalidArrayLengths();
    error NotLocked();
    error InvalidAuction();
    error OnlyClaimer();
    error MintedOut();
    error InvalidEthAmount();
    error InvalidTraits();
    error NoRevenue();
    error AuctionNotLive();

    modifier onlyStudio() {
        if (msg.sender != address(studio)) revert OnlyStudio();
        _;
    }

    constructor(
        address _studio,
        string memory _uri,
        address _owner,
        address payable _platformRevenueClaimer,
        address payable _artistRevenueClaimer
    ) ERC1155(_uri) {
        studio = IStudio(_studio);
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
        if (studio.locked()) revert Locked();
        if (
            _traitTypeNames.length == 0 ||
            _traitNames.length == 0 ||
            _traitTypeNames.length != _traitTypeValues.length ||
            _traitNames.length != _traitValues.length ||
            _traitNames.length != _traitTypeIndexes.length ||
            _traitNames.length != _traitMaxRevenues.length
        ) revert InvalidArrayLengths();

        // Push trait types to array
        for (uint256 i; i < _traitTypeNames.length; i++) {
            _traitTypes.push(
                TraitType({
                    name: _traitTypeNames[i],
                    value: _traitTypeValues[i]
                })
            );
        }

        // Push traits to array
        for (uint256 i; i < _traitNames.length; i++) {
            _traits.push(
                Trait({
                    name: _traitNames[i],
                    value: _traitValues[i],
                    typeIndex: _traitTypeIndexes[i],
                    maxRevenue: _traitMaxRevenues[i],
                    totalRevenue: 0
                })
            );
        }
    }

    function scheduleAuction(
        uint256 _auctionStartTime,
        uint256 _auctionEndTime,
        uint256 _auctionStartPrice,
        uint256 _auctionEndPrice
    ) external onlyOwner {
        if (!studio.locked()) revert NotLocked();
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

        for (uint256 i; i < _traitAmounts.length; i++) {
            _traitCount += _traitAmounts[i];

            uint256 newTraitRevenue = _traits[_traitTokenIds[i]].totalRevenue +
                (_traitPrice * _traitAmounts[i]);

            if (newTraitRevenue > _traits[_traitTokenIds[i]].maxRevenue)
                revert MintedOut();

            _traits[_traitTokenIds[i]].totalRevenue = newTraitRevenue;
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

    function maxSupply(uint256 _tokenId) public view returns (uint256) {
        return
            totalSupply(_tokenId) +
            ((_traits[_tokenId].maxRevenue - _traits[_tokenId].totalRevenue) /
                auctionEndPrice);
    }

    function transferTraitsToCreateArtwork(
        address _caller,
        uint256[] calldata _traitTokenIds
    ) external onlyStudio {
        if (_traitTokenIds.length != _traitTypes.length)
            revert InvalidArrayLengths();

        uint256[] memory amounts = new uint256[](_traitTokenIds.length);
        for (uint256 i; i < _traitTokenIds.length; i++) {
            if (_traits[_traitTokenIds[i]].typeIndex != i)
                revert InvalidTraits();
            amounts[i] = 1;
        }

        _safeBatchTransferFrom(
            _caller,
            address(studio),
            _traitTokenIds,
            amounts,
            ""
        );
    }

    function transferTraitsToDecomposeArtwork(
        address _caller,
        uint256[] calldata _traitTokenIds
    ) external onlyStudio {
        if (_traitTokenIds.length != _traitTypes.length)
            revert InvalidArrayLengths();

        uint256[] memory amounts = new uint256[](_traitTokenIds.length);
        for (uint256 i; i < _traitTokenIds.length; i++) {
            // todo: Is this check necessary?
            if (_traits[_traitTokenIds[i]].typeIndex != i)
                revert InvalidTraits();
            amounts[i] = 1;
        }

        _safeBatchTransferFrom(
            address(studio),
            _caller,
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

        for (uint256 i = 0; i < traitCount; i++) {
            _traitTokenIds[i] = i;
            _traitNames[i] = _traits[i].name;
            _traitValues[i] = _traits[i].value;
            _traitTypeIndexes[i] = _traits[i].typeIndex;
            _traitTypeNames[i] = _traitTypes[_traits[i].typeIndex].name;
            _traitTypeValues[i] = _traitTypes[_traits[i].typeIndex].value;
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

        for (uint256 i; i < traitTypeCount; i++) {
            _traitTypeNames[i] = _traitTypes[i].name;
            _traitTypeValues[i] = _traitTypes[i].value;
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
}
