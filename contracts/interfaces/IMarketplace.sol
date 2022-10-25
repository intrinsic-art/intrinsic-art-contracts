//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMarketplace {
    event MarketUpdated(uint256 indexed projectId, uint256 indexed elementTokenId);
    event ApprovedERC20Added(address indexed erc20);
    event ApprovedERC20Removed(address indexed erc20);
    event AuctionStartDelayUpdated(uint256 auctionStartDelay);
    event ElementBoughtFromAuction(address indexed buyer, uint256 indexed tokenId, uint256 quantity);
    event PlatformRevenueClaimed(address indexed claimer, address indexed token, uint256 claimedRevenue);
    event ArtistRevenueClaimed(address indexed artist, address indexed token, uint256 claimedRevenue);
    event AMMInitialized(uint256 indexed tokenId);
    event ElementBoughtFromAMM(address indexed buyer, uint256 indexed tokenId, uint256 indexed quantity, uint256 erc20Spent, uint256 newERC20Balance, uint256 newElementBalance);
    event ElementSoldToAMM(address indexed seller, uint256 indexed tokenId, uint256 indexed quantity, uint256 erc20Received, uint256 newERC20Balance, uint256 newElementBalance);

    struct CreateMarketData {
        uint256 elementCategoryIndex;
        uint256 elementIndex;
        uint256 reserveElementBalance;
        uint256 auctionElementBalance;
        address erc20;
        uint256 auctionStartTime;
        uint256 auctionEndTime;
        uint256 auctionStartPrice;
        uint256 auctionEndPrice;
    }

    struct Market {
        uint256 ammERC20Balance; // This is zero until the AMM has been initialized
        uint256 auctionERC20Balance;
        uint256 ammElementBalance;
        uint256 reserveElementBalance; // Elements set aside to go to AMM
        uint256 auctionElementBalance;
        uint256 reserveElementBalanceInitial; // Elements set aside to go to AMM
        uint256 auctionElementBalanceInitial;
        address erc20;
        uint256 auctionStartTime;
        uint256 auctionEndTime;
        uint256 auctionStartPrice;
        uint256 auctionEndPrice;
        address artist;
    }
}