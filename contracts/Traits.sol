// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ITraits.sol";
import "./interfaces/IStudio.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract Traits is ITraits, ERC1155, ERC1155Supply, Ownable {
    uint256 public constant auctionPlatformFeeNumerator = 100_000;
    uint256 public constant FEE_DENOMINATOR = 1_000_000;
    uint256 public artistClaimableRevenues;
    uint256 public platformClaimableRevenues;
    IStudio public studio;
    uint256 public auctionStartTime;
    uint256 public auctionEndTime;
    uint256 public auctionStartPrice;
    uint256 public auctionEndPrice;
    address payable public platformRevenueClaimer;
    address payable public artistRevenueClaimer;
    string public constant version = "1.0.0";
    TraitType[] private _traitTypes;
    Trait[] private _traits;

    modifier onlyStudio() {
        require(
            msg.sender == address(studio),
            "T01"
        );
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
        require(!studio.locked(), "T02");
        require(_traitTypeNames.length != 0, "T03");
        require(_traitNames.length != 0, "T04");
        require(_traitTypeNames.length == _traitTypeValues.length, "T05");
        require(
            _traitNames.length == _traitValues.length &&
                _traitNames.length == _traitTypeIndexes.length &&
                _traitNames.length == _traitMaxRevenues.length,
            "T06"
        );

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
        require(studio.locked(), "T07");
        require(_auctionEndTime >= _auctionStartTime, "T08");
        require(_auctionEndPrice <= _auctionStartPrice, "T09");

        auctionStartTime = _auctionStartTime;
        auctionEndTime = _auctionEndTime;
        auctionStartPrice = _auctionStartPrice;
        auctionEndPrice = _auctionEndPrice;
    }

    function updateURI(string memory _uri) external onlyOwner {
        _setURI(_uri);
    }

    function updatePlatformRevenueClaimer(address payable _claimer) external onlyOwner {
      platformRevenueClaimer = _claimer;
    }

    function updateArtistRevenueClaimer(address payable _claimer) external {
      require(msg.sender == artistRevenueClaimer, "T10");

      artistRevenueClaimer = _claimer;
    }

    function buyTraits(
        address _recipient,
        uint256[] calldata _traitTokenIds,
        uint256[] calldata _traitAmounts
    ) public payable {
        require(_traitTokenIds.length == _traitAmounts.length, "T11");

        uint256 _traitCount;
        uint256 _traitPrice = traitPrice();

        for (uint256 i; i < _traitAmounts.length; i++) {
            _traitCount += _traitAmounts[i];

            uint256 newTraitRevenue = _traits[_traitTokenIds[i]].totalRevenue +
                (_traitPrice * _traitAmounts[i]);

            require(
                newTraitRevenue <= _traits[_traitTokenIds[i]].maxRevenue,
                "T12"
            );

            _traits[_traitTokenIds[i]].totalRevenue = newTraitRevenue;
        }

        uint256 ethCost = _traitCount * _traitPrice;

        require(msg.value >= ethCost, "T13");

        uint256 platformRevenue = (msg.value * auctionPlatformFeeNumerator) /
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
        require(
            _traitTokenIds.length == _traitTypes.length,
            "T14"
        );

        uint256[] memory amounts = new uint256[](_traitTokenIds.length);
        for (uint256 i; i < _traitTokenIds.length; i++) {
            require(
                _traits[_traitTokenIds[i]].typeIndex == i,
                "T15"
            );
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
        require(
            _traitTokenIds.length == _traitTypes.length,
            "T16"
        );

        uint256[] memory amounts = new uint256[](_traitTokenIds.length);
        for (uint256 i; i < _traitTokenIds.length; i++) {
            require(
                _traits[_traitTokenIds[i]].typeIndex == i,
                "T17"
            );
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
        require(msg.sender == platformRevenueClaimer, "T18");
        uint256 claimedRevenue = platformClaimableRevenues;
        require(claimedRevenue > 0, "T19");

        platformClaimableRevenues = 0;

        emit PlatformRevenueClaimed(claimedRevenue);

        platformRevenueClaimer.transfer(claimedRevenue);
    }

    function claimArtistRevenue() external {
        require(msg.sender == artistRevenueClaimer, "T20");
        uint256 claimedRevenue = artistClaimableRevenues;
        require(claimedRevenue > 0, "T21");

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

        for(uint256 i; i < traitTypeCount; i++) {
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
        require(
            block.timestamp >= auctionStartTime,
            "T22"
        );

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
