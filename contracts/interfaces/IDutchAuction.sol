//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IDutchAuction {
    struct Auction {
        uint256 startTime;
        uint256 endTime;
        uint256 startPrice;
        uint256 endPrice;
        address artistAddress;
        address erc20Token;
    }

    event AuctionAdded(
        address indexed auctionCreator,
        uint256 indexed projectId,
        uint256 startTime,
        uint256 endTime,
        uint256 startPrice,
        uint256 endPrice,
        address indexed artistAddress
    );

    event CanvasesBought(
        uint256 indexed projectId,
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
        uint256 _projectId,
        uint256 _quantity,
        address _spender,
        address _recipient
    ) external returns (uint256[] memory canvasIds);

    function projectIdToAuction(uint256)
        external
        returns (
            uint256 startTime,
            uint256 endTime,
            uint256 startPrice,
            uint256 endPrice,
            address artistAddress,
            address erc20Token
        );

    function getCanvasPrice(uint256 _projectId)
        external
        view
        returns (uint256 canvasPrice);
}
