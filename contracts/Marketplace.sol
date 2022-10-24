// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "./Projects.sol";
import "./interfaces/IMarketplace.sol";

abstract contract Marketplace is IMarketplace, Projects, ERC1155Holder {
    using SafeERC20 for IERC20;

    uint256 constant public ammPlatformFeeNumerator = 25_000_000;
    uint256 constant public ammArtistFeeNumerator = 75_000_000;
    uint256 constant public auctionPlatformFeeNumerator = 100_000_000;
    uint256 constant public FEE_DENOMINATOR = 1_000_000_000;
    uint256 public auctionStartDelay;

    mapping(address => mapping(address => uint256))
        public artistClaimableRevenues; // Artist address => ERC-20 address => Amount
    mapping(address => uint256) public platformRevenues; // ERC-20 address => Revenue amount
    mapping(uint256 => Market) public markets;
    mapping(address => bool) public approvedERC20s;

    function updateMarkets(
        uint256 _projectId,
        CreateMarketData[] calldata _marketData
    ) external {
        for (uint256 i; i < _marketData.length; i++) {
            updateMarket(
                _projectId,
                msg.sender,
                _marketData[i].elementCategoryIndex,
                _marketData[i].elementIndex,
                _marketData[i].reserveElementBalance,
                _marketData[i].auctionElementBalance,
                _marketData[i].erc20,
                _marketData[i].auctionStartTime,
                _marketData[i].auctionEndTime,
                _marketData[i].auctionStartPrice,
                _marketData[i].auctionEndPrice
            );
        }
    }

    function updateMarket(
        uint256 _projectId,
        address _artist,
        uint256 _elementCategoryIndex,
        uint256 _elementIndex,
        uint256 _reserveElementBalance,
        uint256 _auctionElementBalance,
        address _erc20,
        uint256 _auctionStartTime,
        uint256 _auctionEndTime,
        uint256 _auctionStartPrice,
        uint256 _auctionEndPrice
    ) public {
        require(projects[_projectId].artistAddress == msg.sender, "M01");
        require(projects[_projectId].locked, "M02");
        require(_auctionStartTime >= block.timestamp + auctionStartDelay, "M03");
        require(_auctionEndTime >= _auctionStartTime, "M04");
        require(_auctionEndPrice <= _auctionStartPrice, "M05");
        uint256 elementTokenId = projects[_projectId].elementTokenIds[
            _elementCategoryIndex
        ][_elementIndex];
        require(elementTokenId > 0, "M06");
        require(approvedERC20s[_erc20], "M07");
        require(
            element.balanceOf(address(this), elementTokenId) >=
                _reserveElementBalance + _auctionElementBalance,
            "M08"
        );

        markets[elementTokenId].artist = _artist;
        markets[elementTokenId].reserveElementBalance = _reserveElementBalance;
        markets[elementTokenId]
            .reserveElementBalanceInitial = _reserveElementBalance;
        markets[elementTokenId].auctionElementBalance = _auctionElementBalance;
        markets[elementTokenId]
            .auctionElementBalanceInitial = _auctionElementBalance;
        markets[elementTokenId].erc20 = _erc20;
        markets[elementTokenId].auctionStartTime = _auctionStartTime;
        markets[elementTokenId].auctionEndTime = _auctionEndTime;
        markets[elementTokenId].auctionStartPrice = _auctionStartPrice;
        markets[elementTokenId].auctionEndPrice = _auctionEndPrice;

        emit MarketUpdated(_projectId, elementTokenId);
    }

    function addApprovedERC20(address _erc20) external onlyOwner {
        approvedERC20s[_erc20] = true;

        emit ApprovedERC20Added(_erc20);
    }

    function removeApprovedERC20(address _erc20) external onlyOwner {
        approvedERC20s[_erc20] = false;

        emit ApprovedERC20Removed(_erc20);
    }

    function updateAuctionStartDelay(uint256 _auctionStartDelay)
        external
        onlyOwner
    {
        auctionStartDelay = _auctionStartDelay;

        emit AuctionStartDelayUpdated(_auctionStartDelay);
    }

    function buyElements(
        uint256[] calldata _tokenIds,
        uint256[] calldata _quantities,
        uint256 _maxERC20ToSpend
    ) public returns (uint256 _erc20Spent) {
        require(_tokenIds.length == _quantities.length, "M09");

        for (uint256 i; i < _tokenIds.length; i++) {
            if (markets[_tokenIds[i]].auctionElementBalance == 0) {
                // Buy from AMM
                _erc20Spent += _buyElementFromAMM(_tokenIds[i], _quantities[i]);
            } else if (
                markets[_tokenIds[i]].auctionElementBalance >= _quantities[i]
            ) {
                // Buy all from auction
                _erc20Spent += buyElementFromAuction(
                    _tokenIds[i],
                    _quantities[i]
                );
            } else {
                // Buy from auction until its depleted, and the rest from AMM
                uint256 auctionAmount = markets[_tokenIds[i]]
                    .auctionElementBalance;
                _erc20Spent += buyElementFromAuction(
                    _tokenIds[i],
                    auctionAmount
                );

                _erc20Spent += _buyElementFromAMM(
                    _tokenIds[i],
                    _quantities[i] - auctionAmount
                );
            }
        }

        require(_erc20Spent <= _maxERC20ToSpend, "M10");
    }

    function sellElements(
        uint256[] calldata _tokenIds,
        uint256[] calldata _quantities,
        uint256 _minERC20ToReceive
    ) public returns (uint256 _erc20Received) {
        require(_tokenIds.length == _quantities.length, "M09");

        for (uint256 i; i < _tokenIds.length; i++) {
            _erc20Received += _sellElementToAMM(_tokenIds[i], _quantities[i]);
        }

        require(_erc20Received >= _minERC20ToReceive, "M11");
    }

    function buyElementFromAuction(uint256 _tokenId, uint256 _quantity)
        public
        returns (uint256 _erc20Spent)
    {
        require(_quantity > 0, "M12");
        require(
            markets[_tokenId].auctionStartTime > 0,
            "M13"
        );
        require(
            block.timestamp >= markets[_tokenId].auctionStartTime,
            "M14"
        );
        require(
            markets[_tokenId].auctionElementBalance >= _quantity,
            "M15"
        );

        address erc20Token = markets[_tokenId].erc20;

        uint256 elementPrice = getElementAuctionPrice(_tokenId);

        _erc20Spent = elementPrice * _quantity;

        markets[_tokenId].auctionElementBalance -= _quantity;

        if (markets[_tokenId].ammERC20Balance == 0) {
            // AMM has not been initialized yet
            markets[_tokenId].auctionERC20Balance += _erc20Spent;

            if (
                markets[_tokenId].auctionElementBalance == 0 ||
                block.timestamp > markets[_tokenId].auctionEndTime
            ) {
                // Need to initialize AMM
                _initializeAMM(_tokenId);
            }
        } else {
            // AMM has been initialized
            uint256 elementQuantityToAMM = markets[_tokenId]
                .reserveElementBalance -
                ((markets[_tokenId].auctionElementBalance *
                    markets[_tokenId].reserveElementBalanceInitial) /
                    markets[_tokenId].auctionElementBalanceInitial);
            uint256 erc20Revenue;
            if (elementQuantityToAMM > 0) {
                uint256 erc20QuantityToAMM = elementQuantityToAMM *
                    elementPrice;

                // Transfer Elements into AMM
                markets[_tokenId].reserveElementBalance -= elementQuantityToAMM;
                markets[_tokenId].ammElementBalance += elementQuantityToAMM;

                // Transfer ERC20 into AMM
                markets[_tokenId].ammERC20Balance += erc20QuantityToAMM;
                erc20Revenue = _erc20Spent - erc20QuantityToAMM;
            } else {
                erc20Revenue = _erc20Spent;
            }

            // Separate remaining revenue between artist and platform
            uint256 platformRevenue = (erc20Revenue *
                auctionPlatformFeeNumerator) / FEE_DENOMINATOR;
            artistClaimableRevenues[markets[_tokenId].artist][erc20Token] +=
                erc20Revenue -
                platformRevenue;
            platformRevenues[erc20Token] += platformRevenue;
        }

        IERC20(erc20Token).safeTransferFrom(
            msg.sender,
            address(this),
            _erc20Spent
        );
        element.safeTransferFrom(
            address(this),
            msg.sender,
            _tokenId,
            _quantity,
            ""
        );

        emit ElementBoughtFromAuction(msg.sender, _tokenId, _quantity);
    }

    function buyElementFromAMM(
        uint256 _tokenId,
        uint256 _quantity,
        uint256 _maxERC20ToSpend
    ) public returns (uint256 _erc20Spent) {
        _erc20Spent = _buyElementFromAMM(_tokenId, _quantity);
        require(_erc20Spent <= _maxERC20ToSpend, "M10");
    }

    function sellElementToAMM(
        uint256 _tokenId,
        uint256 _quantity,
        uint256 _minERC20ToReceive
    ) external returns (uint256 _erc20Received) {
        _erc20Received = _sellElementToAMM(_tokenId, _quantity);
        require(_erc20Received >= _minERC20ToReceive, "M11");
    }

    function claimPlatformTokenRevenue(address _token) public onlyOwner {
        uint256 claimedRevenue = platformRevenues[_token];
        require(claimedRevenue > 0, "M16");
        
        platformRevenues[_token] = 0;

        IERC20(_token).safeTransfer(msg.sender, claimedRevenue);

        emit PlatformRevenueClaimed(msg.sender, _token, claimedRevenue);
    }

    function claimArtistRevenue(address _token) public {
        uint256 claimedRevenue = artistClaimableRevenues[msg.sender][_token];
        require(claimedRevenue > 0, "M16");

        artistClaimableRevenues[msg.sender][_token] = 0;

        IERC20(_token).safeTransfer(msg.sender, claimedRevenue);

        emit ArtistRevenueClaimed(msg.sender, _token, claimedRevenue);
    }

    function _initializeAMM(uint256 _tokenId) internal {
        uint256 elementQuantityToAMM = markets[_tokenId].reserveElementBalance -
            ((markets[_tokenId].auctionElementBalance *
                markets[_tokenId].reserveElementBalanceInitial) /
                markets[_tokenId].auctionElementBalanceInitial);

        uint256 elementPrice = getElementAuctionPrice(_tokenId);

        uint256 erc20ToAMM = elementQuantityToAMM * elementPrice;

        // Transfer Elements into AMM
        markets[_tokenId].reserveElementBalance -= elementQuantityToAMM;
        markets[_tokenId].ammElementBalance += elementQuantityToAMM;

        // Transfer ERC20 into AMM
        markets[_tokenId].ammERC20Balance += erc20ToAMM;
        uint256 remainingAuctionRevenue = markets[_tokenId]
            .auctionERC20Balance - erc20ToAMM;
        markets[_tokenId].auctionERC20Balance = 0;

        uint256 platformRevenue = (remainingAuctionRevenue *
            auctionPlatformFeeNumerator) / FEE_DENOMINATOR;

        address erc20Token = markets[_tokenId].erc20;

        // Add in platform and artist revenue
        platformRevenues[erc20Token] += platformRevenue;
        artistClaimableRevenues[markets[_tokenId].artist][erc20Token] +=
            remainingAuctionRevenue -
            platformRevenue;

        emit AMMInitialized(_tokenId);
    }

    function _buyElementFromAMM(uint256 _tokenId, uint256 _quantity)
        internal
        returns (uint256 _erc20Spent)
    {
        // Check that the AMM has been initialized
        require(
            markets[_tokenId].ammERC20Balance > 0,
            "M17"
        );
        uint256 erc20ArtistFee;
        uint256 erc20PlatformFee;
        (
            _erc20Spent,
            erc20ArtistFee,
            erc20PlatformFee
        ) = getElementAMMBuyCostWithFee(_tokenId, _quantity);

        address erc20 = markets[_tokenId].erc20;

        platformRevenues[erc20] += erc20PlatformFee;
        artistClaimableRevenues[markets[_tokenId].artist][
            erc20
        ] += erc20ArtistFee;
        markets[_tokenId].ammERC20Balance +=
            _erc20Spent -
            erc20ArtistFee -
            erc20PlatformFee;
        markets[_tokenId].ammElementBalance -= _quantity;

        element.safeTransferFrom(
            address(this),
            msg.sender,
            _tokenId,
            _quantity,
            ""
        );
        IERC20(erc20).safeTransferFrom(msg.sender, address(this), _erc20Spent);

        emit ElementBoughtFromAMM(msg.sender, _tokenId, _quantity, _erc20Spent, markets[_tokenId].ammERC20Balance, markets[_tokenId].ammElementBalance);
    }

    function _sellElementToAMM(uint256 _tokenId, uint256 _quantity)
        internal
        returns (uint256 _erc20Received)
    {
        // Check that AMM has been initialized
        require(
            markets[_tokenId].ammERC20Balance > 0,
            "M17"
        );

        _erc20Received = getElementAMMSellCost(_tokenId, _quantity);

        address erc20 = markets[_tokenId].erc20;

        markets[_tokenId].ammERC20Balance -= _erc20Received;
        markets[_tokenId].ammElementBalance += _quantity;

        element.safeTransferFrom(
            msg.sender,
            address(this),
            _tokenId,
            _quantity,
            ""
        );
        IERC20(erc20).safeTransfer(msg.sender, _erc20Received);

        emit ElementSoldToAMM(msg.sender, _tokenId, _quantity, _erc20Received, markets[_tokenId].ammERC20Balance, markets[_tokenId].ammElementBalance);
    }

    function getElementAMMBuyCostWithFee(uint256 _tokenId, uint256 _quantity)
        public
        view
        returns (
            uint256 _erc20CostWithFee,
            uint256 _erc20ArtistFee,
            uint256 _erc20PlatformFee
        )
    {
        uint256 _erc20Cost = getElementAMMBuyCost(_tokenId, _quantity);
        _erc20ArtistFee =
            (_erc20Cost * ammArtistFeeNumerator) /
            FEE_DENOMINATOR;
        _erc20PlatformFee =
            (_erc20Cost * ammPlatformFeeNumerator) /
            FEE_DENOMINATOR;
        _erc20CostWithFee = _erc20Cost + _erc20ArtistFee + _erc20PlatformFee;
    }

    function getElementAMMBuyCost(uint256 _tokenId, uint256 _quantity)
        public
        view
        returns (uint256 _erc20Cost)
    {
        uint256 erc20Balance = markets[_tokenId].ammERC20Balance;
        uint256 elementBalance = markets[_tokenId].ammElementBalance;

        _erc20Cost =
            ((elementBalance * erc20Balance) / (elementBalance - _quantity)) -
            erc20Balance;
    }

    function getElementAMMSellCost(uint256 _tokenId, uint256 _quantity)
        public
        view
        returns (uint256 _erc20Received)
    {
        uint256 erc20Balance = markets[_tokenId].ammERC20Balance;
        uint256 elementBalance = markets[_tokenId].ammElementBalance;

        _erc20Received =
            erc20Balance -
            ((elementBalance * erc20Balance) / (elementBalance + _quantity));
    }

    function getElementAuctionPrice(uint256 _tokenId)
        public
        view
        returns (uint256 _price)
    {
        if (block.timestamp < markets[_tokenId].auctionStartTime) {
            // Auction hasn't started yet
            _price = markets[_tokenId].auctionStartPrice;
        } else if (block.timestamp > markets[_tokenId].auctionEndTime) {
            // Auction has ended
            _price = markets[_tokenId].auctionEndPrice;
        } else {
            // Auction is active
            _price =
                markets[_tokenId].auctionStartPrice -
                (
                    (((block.timestamp - markets[_tokenId].auctionStartTime) *
                        (markets[_tokenId].auctionStartPrice -
                            markets[_tokenId].auctionEndPrice)) /
                        (markets[_tokenId].auctionEndTime -
                            markets[_tokenId].auctionStartTime))
                );
        }
    }
}
