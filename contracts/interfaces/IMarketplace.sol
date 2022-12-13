//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMarketplace {
    event AuctionScheduled(
        uint256 indexed projectId,
        address auctionERC20,
        uint256 auctionStartTime,
        uint256 auctionEndTime,
        uint256 auctionStartPrice,
        uint256 auctionEndPrice
    );
    event AuctionStartDelayUpdated(uint256 auctionStartDelay);
    event ElementBought(
        address indexed buyer,
        uint256 _projectId,
        uint256[] elementCategoryIndexes,
        uint256[] elementIndexes,
        uint256[] elementQuantities
    );
    event PlatformRevenueClaimed(
        address indexed claimer,
        address indexed token,
        uint256 claimedRevenue
    );
    event ArtistRevenueClaimed(
        address indexed artist,
        address indexed token,
        uint256 claimedRevenue
    );
}
