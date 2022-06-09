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
    uint256 artistRevenue;
  }

  event AuctionAdded(
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
    uint256 indexed projectId,
    uint256 quantity,
    uint256 canvasesTotalPrice
  );

  event ArtistClaimedRevenue(
    uint256 indexed projectId,
    address indexed recipient,
    uint256 claimedRevenue
  );

  function addAuction(
    uint256 _projectId,
    uint256 _startTokenId,
    uint256 _endTokenId,
    uint256 _startTime,
    uint256 _endTime,
    uint256 _startPrice,
    uint256 _endPrice,
    address _artistAddress
  ) external;

  function buyCanvases(uint256 _projectId, uint256 _quantity) external;

  function artistClaimRevenue(uint256 _projectId, address _recipient) external;

  function getCanvasPrice(uint256 _projectId)
    external
    view
    returns (uint256 canvasPrice);
}
