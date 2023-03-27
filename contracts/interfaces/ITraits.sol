//SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface ITraits {
    event TraitsBought(
        address indexed recipient,
        uint256[] traitTokenIds,
        uint256[] traitQuantities
    );

    event PlatformRevenueClaimed(uint256 claimedRevenue);
    event ArtistRevenueClaimed(uint256 claimedRevenue);
    event PlatormRevenueClaimerUpdated(address indexed claimer);
    event ArtistRevenueClaimerUpdated(address indexed claimer);

    struct TraitType {
        string name;
        string value;
    }

    struct Trait {
        string name;
        string value;
        uint256 typeIndex;
        uint256 maxRevenue;
        uint256 totalRevenue;
    }

    function createTraitsAndTypes(
        string[] memory _traitTypeNames,
        string[] memory _traitTypeValues,
        string[] calldata _traitNames,
        string[] calldata _traitValues,
        uint256[] calldata _traitTypeIndexes,
        uint256[] calldata _traitMaxRevenues
    ) external;

    function scheduleAuction(
        uint256 _auctionStartTime,
        uint256 _auctionEndTime,
        uint256 _auctionStartPrice,
        uint256 _auctionEndPrice
    ) external;

    function updateURI(string memory _uri) external;

    function updatePlatformRevenueClaimer(address payable _claimer) external;

    function updateArtistRevenueClaimer(address payable _claimer) external;

    function buyTraits(
        address _recipient,
        uint256[] calldata _traitTokenIds,
        uint256[] calldata _traitAmounts
    ) external payable;

    function maxSupply(uint256 _tokenId) external view returns (uint256);

    function transferTraitsToCreateArtwork(
        address _caller,
        uint256[] calldata _traitTokenIds
    ) external;

    function transferTraitsToDecomposeArtwork(
        address _caller,
        uint256[] calldata _traitTokenIds
    ) external;

    function claimPlatformRevenue() external;

    function claimArtistRevenue() external;

    function traits()
        external
        view
        returns (
            uint256[] memory _traitTokenIds,
            string[] memory _traitNames,
            string[] memory _traitValues,
            uint256[] memory _traitTypeIndexes,
            string[] memory _traitTypeNames,
            string[] memory _traitTypeValues
        );

    function traitTypes()
        external
        view
        returns (
            string[] memory _traitTypeNames,
            string[] memory _traitTypeValues
        );

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

    function traitPrice() external view returns (uint256 _price);
}
