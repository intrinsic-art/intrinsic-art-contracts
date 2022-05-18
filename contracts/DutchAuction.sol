// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interfaces/IMockCanvas.sol";
import "./interfaces/IDutchAuction.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DutchAuction is IDutchAuction, Ownable {
  using SafeERC20 for IERC20;

  IERC20 public weth;
  IMockCanvas public canvas;

  mapping(uint256 => Auction) projectIdToAuction;

  // Todo: Add events

  constructor(address wethAddress, address canvasAddress) {
    weth = IERC20(wethAddress);
    canvas = IMockCanvas(canvasAddress);
  }

  function addAuction(
    uint256 _projectId,
    uint256 _startTokenId,
    uint256 _endTokenId,
    uint256 _startTime,
    uint256 _endTime,
    uint256 _startPrice,
    uint256 _endPrice,
    address _artistAddress
  ) external onlyOwner {
    require(
      _startPrice >= _endPrice,
      "Start price must be greater than or equal end price"
    );
    require(_endTime >= _startTime, "End time must be after start time");
    require(
      _endTokenId >= _startTokenId,
      "End Token ID must be greater than or equal to Start Token ID"
    );
    require(
      _startTokenId >= 1,
      "Start token ID must be greater than or equal to 1"
    );

    projectIdToAuction[_projectId].startTokenId = _startTokenId;
    projectIdToAuction[_projectId].endTokenId = _endTokenId;
    projectIdToAuction[_projectId].startTime = _startTime;
    projectIdToAuction[_projectId].endTime = _endTime;
    projectIdToAuction[_projectId].startPrice = _startPrice;
    projectIdToAuction[_projectId].endPrice = _endPrice;
    projectIdToAuction[_projectId].artistAddress = _artistAddress;

    emit AuctionAdded(
      _projectId,
      _startTokenId,
      _endTokenId,
      _startTime,
      _endTime,
      _startPrice,
      _endPrice,
      _artistAddress
    );
  }

  function buyCanvases(uint256 _projectId, uint256 _quantity) external {
    require(
      block.timestamp >= projectIdToAuction[_projectId].startTime,
      "Auction has not started yet"
    );
    // require max invocations not hit yet

    uint256 canvasesTotalPrice = getCanvasPrice(_projectId) * _quantity;

    projectIdToAuction[_projectId].artistRevenue += canvasesTotalPrice;

    for (uint256 i; i < _quantity; i++) {
      canvas.safeMint(msg.sender, _projectId);
    }

    weth.safeTransferFrom(msg.sender, address(this), canvasesTotalPrice);

    emit CanvasesBought(_projectId, _quantity, canvasesTotalPrice);
  }

  function artistClaimRevenue(uint256 _projectId, address _recipient) external {
    require(
      msg.sender == projectIdToAuction[_projectId].artistAddress,
      "Only artist can claim revenue"
    );

    uint256 _claimedRevenue = projectIdToAuction[_projectId].artistRevenue;

    projectIdToAuction[_projectId].artistRevenue = 0;

    weth.safeTransfer(_recipient, _claimedRevenue);

    emit ArtistClaimedRevenue(_projectId, _recipient, _claimedRevenue);
  }

  function getCanvasPrice(uint256 _projectId)
    public
    view
    returns (uint256 canvasPrice)
  {
    if (block.timestamp < projectIdToAuction[_projectId].startTime) {
      // Auction hasn't started yet
      canvasPrice = projectIdToAuction[_projectId].startPrice;
    } else if (block.timestamp > projectIdToAuction[_projectId].endTime) {
      // Auction has ended
      canvasPrice = projectIdToAuction[_projectId].endPrice;
    } else {
      // Auction is active
      canvasPrice =
        projectIdToAuction[_projectId].startPrice -
        (
          (((block.timestamp - projectIdToAuction[_projectId].startTime) *
            (projectIdToAuction[_projectId].startPrice -
              projectIdToAuction[_projectId].endPrice)) /
            (projectIdToAuction[_projectId].endTime -
              projectIdToAuction[_projectId].startTime))
        );
    }
  }
}
