//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IDutchAuction {
    struct Auction {
        uint256 startTokenId;
        uint256 endTokenId;
        uint256 startTime;
        uint256 endTime;
        uint256 startPrice;
        uint256 endPrice;
        address artistAddress;
        address erc721;
        address currency;
    }

    event AuctionAdded(
        address indexed auctionCreator,
        uint256 indexed projectId,
        uint256 startTokenId,
        uint256 endTokenId,
        uint256 startTime,
        uint256 endTime,
        uint256 startPrice,
        uint256 endPrice,
        address indexed artistAddress
    );

    event CanvasesBought(
        address indexed auctionCreator,
        uint256 indexed projectId,
        address indexed artistAddress,
        address currency,
        uint256 quantity,
        uint256 canvasesTotalPrice
    );

    event ArtistRevenueClaimed(
        address indexed recipient,
        address indexed currency,
        uint256 claimedRevenue
    );

    function addAuction(uint256 _projectId, Auction memory _auction) external;

    function buyCanvases(
        address _auctionCreator,
        uint256 _projectId,
        uint256 _quantity
    ) external;

    function claimArtistRevenue(address _recipient, address _currency) external;

    function projectIdToAuction(address, uint256)
        external
        returns (
            uint256 startTokenId,
            uint256 endTokenId,
            uint256 startTime,
            uint256 endTime,
            uint256 startPrice,
            uint256 endPrice,
            address artistAddres,
            address erc721,
            address currency
        );

    function getCanvasPrice(address _auctionCreator, uint256 _projectId)
        external
        view
        returns (uint256 canvasPrice);
}
