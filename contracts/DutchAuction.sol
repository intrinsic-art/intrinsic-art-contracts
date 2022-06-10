// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IDutchAuction.sol";
import "./interfaces/IERC721Mint.sol";

contract DutchAuction is IDutchAuction {
    using SafeERC20 for IERC20;

    mapping(address => mapping(uint256 => Auction)) public projectIdToAuction;
    mapping(address => mapping(address => uint256)) public currencyToBalances;

    function addAuction(uint256 _projectId, Auction memory _auction) external {
        require(
            projectIdToAuction[msg.sender][_projectId].currency != address(0),
            "Dutch Auction already initialized"
        );
        require(
            _auction.startPrice >= _auction.endPrice,
            "Start price must be greater than or equal end price"
        );
        require(
            _auction.endTime >= _auction.startTime,
            "End time must be after start time"
        );
        require(
            _auction.endTokenId >= _auction.startTokenId,
            "End Token ID must be greater than or equal to Start Token ID"
        );

        projectIdToAuction[msg.sender][_projectId] = Auction(
            _auction.startTokenId,
            _auction.endTokenId,
            _auction.startTime,
            _auction.endTime,
            _auction.startPrice,
            _auction.endPrice,
            _auction.artistAddress,
            _auction.erc721,
            _auction.currency
        );

        emit AuctionAdded(
            msg.sender,
            _projectId,
            _auction.startTokenId,
            _auction.endTokenId,
            _auction.startTime,
            _auction.endTime,
            _auction.startPrice,
            _auction.endPrice,
            _auction.artistAddress
        );
    }

    function buyCanvases(
        address _auctionCreator,
        uint256 _projectId,
        uint256 _quantity
    ) external {
        require(
            block.timestamp >=
                projectIdToAuction[_auctionCreator][_projectId].startTime,
            "Auction has not started yet"
        );
        uint256 canvasesTotalPrice = getCanvasPrice(
            _auctionCreator,
            _projectId
        ) * _quantity;

        IERC20(projectIdToAuction[_auctionCreator][_projectId].currency)
            .safeTransferFrom(msg.sender, address(this), canvasesTotalPrice);

        for (uint256 i; i < _quantity; i++) {
            IERC721Mint(projectIdToAuction[_auctionCreator][_projectId].erc721)
                .safeMint(msg.sender, _projectId);
        }

        currencyToBalances[
            projectIdToAuction[_auctionCreator][_projectId].artistAddress
        ][
            projectIdToAuction[_auctionCreator][_projectId].currency
        ] += canvasesTotalPrice;

        emit CanvasesBought(
            _auctionCreator,
            _projectId,
            projectIdToAuction[_auctionCreator][_projectId].artistAddress,
            projectIdToAuction[_auctionCreator][_projectId].currency,
            _quantity,
            canvasesTotalPrice
        );
    }

    function artistClaimRevenue(address _recipient, address _currency)
        external
    {
        require(
            currencyToBalances[msg.sender][_currency] > 0,
            "You do not have an available balance in this currency"
        );
        uint256 _claimedRevenue = currencyToBalances[msg.sender][_currency];

        currencyToBalances[msg.sender][_currency] = 0;

        IERC20(_currency).safeTransfer(_recipient, _claimedRevenue);

        emit ArtistClaimedRevenue(_recipient, _currency, _claimedRevenue);
    }

    function getCanvasPrice(address _auctionCreator, uint256 _projectId)
        public
        view
        returns (uint256 canvasPrice)
    {
        if (
            block.timestamp <
            projectIdToAuction[_auctionCreator][_projectId].startTime
        ) {
            // Auction hasn't started yet
            canvasPrice = projectIdToAuction[_auctionCreator][_projectId]
                .startPrice;
        } else if (
            block.timestamp >
            projectIdToAuction[_auctionCreator][_projectId].endTime
        ) {
            // Auction has ended
            canvasPrice = projectIdToAuction[_auctionCreator][_projectId]
                .endPrice;
        } else {
            // Auction is active
            canvasPrice =
                projectIdToAuction[_auctionCreator][_projectId].startPrice -
                (
                    (((block.timestamp -
                        projectIdToAuction[_auctionCreator][_projectId]
                            .startTime) *
                        (projectIdToAuction[_auctionCreator][_projectId]
                            .startPrice -
                            projectIdToAuction[_auctionCreator][_projectId]
                                .endPrice)) /
                        (projectIdToAuction[_auctionCreator][_projectId]
                            .endTime -
                            projectIdToAuction[_auctionCreator][_projectId]
                                .startTime))
                );
        }
    }
}
