// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interfaces/IAMM.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IERC1155MintBurn.sol";

contract AMM is IAMM, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable weth;
    uint256 public immutable totalFeeNumerator;
    uint256 public immutable artistFeeNumerator;
    uint256 constant DENOMINATOR = 1_000_000_000;
    uint256 public platformRevenue;

    // tokenID => BondingCurve
    mapping(address => mapping(uint256 => BondingCurve))
        public tokenIdToBondingCurve;
    mapping(address => uint256) public artistRevenues;

    constructor(
        uint256 _totalFeeNumerator,
        uint256 _artistFeeNumerator,
        address _wethAddress
    ) {
        weth = IERC20(_wethAddress);
        totalFeeNumerator = _totalFeeNumerator;
        artistFeeNumerator = _artistFeeNumerator;
    }

    function createBondingCurve(
        uint256 _tokenId,
        uint256 _constantA,
        uint256 _constantB,
        address _artistAddress,
        address _erc1155,
        uint256 _startTime
    ) external {
        require(
            _artistAddress != address(0),
            "Artist address cannot be address zero"
        );
        require(
            tokenIdToBondingCurve[msg.sender][_tokenId].artistAddress ==
                address(0),
            "Bonding curve already initialized"
        );

        tokenIdToBondingCurve[msg.sender][_tokenId] = BondingCurve(
            _constantA,
            _constantB,
            0,
            _artistAddress,
            _erc1155,
            _startTime
        );

        emit BondingCurveCreated(
            msg.sender,
            _tokenId,
            _constantA,
            _constantB,
            _artistAddress,
            _erc1155,
            _startTime
        );
    }

    function buyElements(
        address _bondingCurveCreator,
        uint256 _tokenId,
        uint256 _erc1155Quantity,
        uint256 _maxERC20ToSpend,
        address _recipient,
        address _spender
    ) external {
        (
            uint256 erc20TotalAmount,
            uint256 erc20TotalFee,
            uint256 erc20ArtistFee
        ) = getBuyERC20AmountWithFee(
                _bondingCurveCreator,
                _tokenId,
                _erc1155Quantity
            );
        require(
            block.timestamp >=
                tokenIdToBondingCurve[_bondingCurveCreator][_tokenId].startTime,
            "AMM has not started yet"
        );
        require(erc20TotalAmount <= _maxERC20ToSpend, "Slippage too high");

        platformRevenue += erc20TotalFee - erc20ArtistFee;
        artistRevenues[
            tokenIdToBondingCurve[_bondingCurveCreator][_tokenId].artistAddress
        ] += erc20ArtistFee;
        tokenIdToBondingCurve[_bondingCurveCreator][_tokenId].reserves +=
            erc20TotalAmount -
            erc20TotalFee;

        IERC1155MintBurn(
            tokenIdToBondingCurve[_bondingCurveCreator][_tokenId].erc1155
        ).mint(_recipient, _tokenId, _erc1155Quantity);

        // todo: consider adding parameter for spender address
        weth.safeTransferFrom(_spender, address(this), erc20TotalAmount);

        emit ElementsBought(
            _bondingCurveCreator,
            _tokenId,
            _erc1155Quantity,
            erc20TotalAmount,
            erc20TotalFee,
            erc20ArtistFee,
            _recipient
        );
    }

    function sellElements(
        address _bondingCurveCreator,
        uint256 _tokenId,
        uint256 _erc1155Quantity,
        uint256 _minERC20ToReceive,
        address _recipient,
        address _sender
    ) external {
        require(
            block.timestamp >=
                tokenIdToBondingCurve[_bondingCurveCreator][_tokenId].startTime,
            "AMM has not started yet"
        );
        uint256 erc20TotalAmount = getSellERC20Amount(
            _bondingCurveCreator,
            _tokenId,
            _erc1155Quantity
        );
        require(erc20TotalAmount >= _minERC20ToReceive, "Slippage too high");

        tokenIdToBondingCurve[_bondingCurveCreator][_tokenId]
            .reserves -= erc20TotalAmount;

        IERC1155MintBurn(
            tokenIdToBondingCurve[_bondingCurveCreator][_tokenId].erc1155
        ).burn(_sender, _tokenId, _erc1155Quantity);

        weth.safeTransfer(_recipient, erc20TotalAmount);

        emit ElementsSold(
            _bondingCurveCreator,
            _tokenId,
            _erc1155Quantity,
            erc20TotalAmount,
            _recipient
        );
    }

    function claimPlatformRevenue(address _recipient) external onlyOwner {
        uint256 _platformRevenue = platformRevenue;
        platformRevenue = 0;

        weth.transfer(_recipient, _platformRevenue);

        emit PlatformRevenueClaimed(_recipient, _platformRevenue);
    }

    function claimArtistRevenue(address _recipient) external {
        require(
            artistRevenues[msg.sender] > 0,
            "You do not have an available balance"
        );

        uint256 claimedRevenue = artistRevenues[msg.sender];
        artistRevenues[msg.sender] = 0;

        weth.safeTransfer(_recipient, claimedRevenue);

        emit ArtistRevenueClaimed(_recipient, claimedRevenue);
    }

    function getBuyERC20AmountWithFee(
        address _bondingCurveCreator,
        uint256 _tokenId,
        uint256 _erc1155Quantity
    )
        public
        view
        returns (
            uint256 erc20TotalAmount,
            uint256 erc20TotalFee,
            uint256 erc20ArtistFee
        )
    {
        require(
            block.timestamp >=
                tokenIdToBondingCurve[_bondingCurveCreator][_tokenId].startTime,
            "AMM has not started yet"
        );
        uint256 nominalERC20Amount = getBuyERC20Amount(
            _bondingCurveCreator,
            _tokenId,
            _erc1155Quantity
        );
        erc20TotalFee = (nominalERC20Amount * totalFeeNumerator) / DENOMINATOR;
        erc20ArtistFee =
            (nominalERC20Amount * artistFeeNumerator) /
            DENOMINATOR;

        erc20TotalAmount = nominalERC20Amount + erc20TotalFee;
    }

    function getBuyERC20Amount(
        address _bondingCurveCreator,
        uint256 _tokenId,
        uint256 _erc1155Quantity
    ) public view returns (uint256 erc20Amount) {
        require(
            block.timestamp >=
                tokenIdToBondingCurve[_bondingCurveCreator][_tokenId].startTime,
            "AMM has not started yet"
        );
        require(
            tokenIdToBondingCurve[_bondingCurveCreator][_tokenId]
                .artistAddress != address(0),
            "Bonding curve not initialized"
        );

        // reserves = (a * supply) + (b * supply)^2
        uint256 newElementSupply = IERC1155MintBurn(
            tokenIdToBondingCurve[_bondingCurveCreator][_tokenId].erc1155
        ).totalSupply(_tokenId) + _erc1155Quantity;

        erc20Amount =
            ((tokenIdToBondingCurve[_bondingCurveCreator][_tokenId].constantA *
                newElementSupply) +
                (tokenIdToBondingCurve[_bondingCurveCreator][_tokenId]
                    .constantB * newElementSupply) **
                    2) -
            tokenIdToBondingCurve[_bondingCurveCreator][_tokenId].reserves;
    }

    function getSellERC20Amount(
        address _bondingCurveCreator,
        uint256 _tokenId,
        uint256 _erc1155Quantity
    ) public view returns (uint256 erc20Amount) {
        require(
            block.timestamp >=
                tokenIdToBondingCurve[_bondingCurveCreator][_tokenId].startTime,
            "AMM has not started yet"
        );
        require(
            tokenIdToBondingCurve[_bondingCurveCreator][_tokenId]
                .artistAddress != address(0),
            "Bonding curve not initialized"
        );
        require(
            IERC1155MintBurn(
                tokenIdToBondingCurve[_bondingCurveCreator][_tokenId].erc1155
            ).totalSupply(_tokenId) >= _erc1155Quantity,
            "Quantity greater than total supply"
        );
        // reserves = (a * supply) + (b * supply)^2
        uint256 newElementSupply = IERC1155MintBurn(
            tokenIdToBondingCurve[_bondingCurveCreator][_tokenId].erc1155
        ).totalSupply(_tokenId) - _erc1155Quantity;

        erc20Amount =
            tokenIdToBondingCurve[_bondingCurveCreator][_tokenId].reserves -
            ((tokenIdToBondingCurve[_bondingCurveCreator][_tokenId].constantA *
                newElementSupply) +
                (tokenIdToBondingCurve[_bondingCurveCreator][_tokenId]
                    .constantB * newElementSupply) **
                    2);
    }
}
