// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "./Projects.sol";
import "./interfaces/IMarketplace.sol";

abstract contract Marketplace is IMarketplace, Projects, ERC1155Holder {
    using SafeERC20 for IERC20;

    uint256 public constant auctionPlatformFeeNumerator = 100_000_000;
    uint256 public constant FEE_DENOMINATOR = 1_000_000_000;
    uint256 public auctionStartDelay;

    mapping(address => mapping(address => uint256))
        public artistClaimableRevenues; // Artist address => ERC-20 address => Amount
    mapping(address => uint256) public platformClaimableRevenues; // ERC-20 address => Revenue amount

    function buyElements(
        uint256 _projectId,
        uint256[] calldata _elementCategoryIndexes,
        uint256[] calldata _elementIndexes,
        uint256[] calldata _elementQuantities
    ) public {
        require(
            _elementCategoryIndexes.length == _elementIndexes.length,
            "M01"
        );
        require(
            _elementCategoryIndexes.length == _elementQuantities.length,
            "M01"
        );

        uint256 totalQuantity;

        for (uint256 i; i < _elementCategoryIndexes.length; i++) {
            uint256 elementTokenId = projects[_projectId].elementTokenIds[
                _elementCategoryIndexes[i]
            ][_elementIndexes[i]];
            require(
                element.balanceOf(address(this), elementTokenId) >=
                    _elementQuantities[i],
                "M02"
            );

            totalQuantity += _elementQuantities[i];
            element.safeTransferFrom(
                address(this),
                msg.sender,
                elementTokenId,
                _elementQuantities[i],
                ""
            );
        }

        uint256 erc20Amount = totalQuantity *
            getProjectElementAuctionPrice(_projectId);

        address auctionERC20 = projects[_projectId].auctionERC20;

        IERC20(auctionERC20).transferFrom(
            msg.sender,
            address(this),
            erc20Amount
        );

        uint256 platformRevenue = (erc20Amount * auctionPlatformFeeNumerator) /
            FEE_DENOMINATOR;
        platformClaimableRevenues[auctionERC20] += platformRevenue;
        artistClaimableRevenues[projects[_projectId].artistAddress][
            auctionERC20
        ] += erc20Amount - platformRevenue;

        emit ElementBought(
            msg.sender,
            _projectId,
            _elementCategoryIndexes,
            _elementIndexes,
            _elementQuantities
        );
    }

    function scheduleAuction(
        uint256 _projectId,
        address _auctionERC20,
        uint256 _auctionStartTime,
        uint256 _auctionEndTime,
        uint256 _auctionStartPrice,
        uint256 _auctionEndPrice
    ) external onlyAdmin {
        require(projects[_projectId].locked, "M03");
        require(
            _auctionStartTime >= block.timestamp + auctionStartDelay,
            "M03"
        );
        require(_auctionEndTime >= _auctionStartTime, "M05");
        require(_auctionEndPrice <= _auctionStartPrice, "M06");

        projects[_projectId].auctionERC20 = _auctionERC20;
        projects[_projectId].auctionStartTime = _auctionStartTime;
        projects[_projectId].auctionEndTime = _auctionEndTime;
        projects[_projectId].auctionStartPrice = _auctionStartPrice;
        projects[_projectId].auctionEndPrice = _auctionEndPrice;

        emit AuctionScheduled(
            _projectId,
            _auctionERC20,
            _auctionStartTime,
            _auctionEndTime,
            _auctionStartPrice,
            _auctionEndPrice
        );
    }

    function updateAuctionStartDelay(uint256 _auctionStartDelay)
        external
        onlyOwner
    {
        auctionStartDelay = _auctionStartDelay;

        emit AuctionStartDelayUpdated(_auctionStartDelay);
    }

    function claimPlatformRevenue(address _token) external onlyOwner {
        uint256 claimedRevenue = platformClaimableRevenues[_token];
        require(claimedRevenue > 0, "M07");

        platformClaimableRevenues[_token] = 0;

        IERC20(_token).safeTransfer(msg.sender, claimedRevenue);

        emit PlatformRevenueClaimed(msg.sender, _token, claimedRevenue);
    }

    function claimArtistRevenue(address _token) external {
        uint256 claimedRevenue = artistClaimableRevenues[msg.sender][_token];
        require(claimedRevenue > 0, "M07");

        artistClaimableRevenues[msg.sender][_token] = 0;

        IERC20(_token).safeTransfer(msg.sender, claimedRevenue);

        emit ArtistRevenueClaimed(msg.sender, _token, claimedRevenue);
    }

    function getProjectElementAuctionPrice(uint256 _projectId)
        public
        view
        returns (uint256 _price)
    {
        require(
            block.timestamp >= projects[_projectId].auctionStartTime,
            "Auction hasn't started yet"
        );
        if (block.timestamp > projects[_projectId].auctionEndTime) {
            // Auction has ended
            _price = projects[_projectId].auctionEndPrice;
        } else {
            // Auction is active
            _price =
                projects[_projectId].auctionStartPrice -
                (
                    (((block.timestamp -
                        projects[_projectId].auctionStartTime) *
                        (projects[_projectId].auctionStartPrice -
                            projects[_projectId].auctionEndPrice)) /
                        (projects[_projectId].auctionEndTime -
                            projects[_projectId].auctionStartTime))
                );
        }
    }
}
