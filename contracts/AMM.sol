// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IERC1155MintBurn.sol";
import "./interfaces/IAMM.sol";

contract AMM is IAMM, Initializable {
    using SafeERC20 for IERC20;

    // todo: Change this interface
    IERC1155MintBurn public element;
    address public studio;
    uint256 public totalFeeNumerator;
    uint256 public artistFeeNumerator;
    uint256 constant FEE_DENOMINATOR = 1_000_000_000;
    uint256 public platformRevenue;

    // tokenID => BondingCurve
    mapping(uint256 => BondingCurve) public tokenIdToBondingCurve;
    mapping(address => uint256) public artistRevenues;

    modifier onlyStudio() {
        require(
            msg.sender == studio,
            "Only the Studio contract can call this function"
        );
        _;
    }

    function initialize(
        address _element,
        address _studio,
        uint256 _totalFeeNumerator,
        uint256 _artistFeeNumerator
    ) external initializer {
        element = IERC1155MintBurn(_element);
        studio = _studio;
        totalFeeNumerator = _totalFeeNumerator;
        artistFeeNumerator = _artistFeeNumerator;
    }

    function createBondingCurves(
        uint256[] calldata _tokenIds,
        uint256[] calldata _constantAs,
        uint256[] calldata _constantBs,
        address _artistAddress,
        address _erc20Token,
        uint256 _startTime
    ) external onlyStudio {
        require(
            _tokenIds.length == _constantAs.length &&
                _tokenIds.length == _constantBs.length,
            "Invalid array lengths"
        );
        for (uint256 i; i < _tokenIds.length; i++) {
            createBondingCurve(
                _tokenIds[i],
                _constantAs[i],
                _constantBs[i],
                _artistAddress,
                _erc20Token,
                _startTime
            );
        }
    }

    function createBondingCurve(
        uint256 _tokenId,
        uint256 _constantA,
        uint256 _constantB,
        address _artistAddress,
        address _erc20Token,
        uint256 _startTime
    ) public onlyStudio {
        require(
            _artistAddress != address(0),
            "Artist address cannot be address zero"
        );
        require(
            tokenIdToBondingCurve[_tokenId].artistAddress == address(0),
            "Bonding curve already initialized"
        );

        tokenIdToBondingCurve[_tokenId] = BondingCurve(
            _constantA,
            _constantB,
            0,
            _artistAddress,
            _erc20Token,
            _startTime
        );

        emit BondingCurveCreated(
            _tokenId,
            _constantA,
            _constantB,
            _artistAddress,
            _erc20Token,
            _startTime
        );
    }

    function buyElements(
        uint256 _tokenId,
        uint256 _erc1155Quantity,
        uint256 _maxERC20ToSpend,
        address _spender,
        address _recipient
    ) public onlyStudio {
        (
            uint256 erc20TotalAmount,
            uint256 erc20TotalFee,
            uint256 erc20ArtistFee
        ) = getBuyERC20AmountWithFee(_tokenId, _erc1155Quantity);

        require(erc20TotalAmount <= _maxERC20ToSpend, "Slippage too high");

        IERC20(tokenIdToBondingCurve[_tokenId].erc20Token).safeTransferFrom(
            _spender,
            address(this),
            erc20TotalAmount
        );
        // platformRevenue += erc20TotalFee - erc20ArtistFee;
        // artistRevenues[
        //     tokenIdToBondingCurve[_tokenId].artistAddress
        // ] += erc20ArtistFee;
        tokenIdToBondingCurve[_tokenId].reserves += (erc20TotalAmount -
            erc20TotalFee);

        element.mint(_recipient, _tokenId, _erc1155Quantity);

        // emit ElementsBought(
        //     _bondingCurveCreator,
        //     _tokenId,
        //     _erc1155Quantity,
        //     erc20TotalAmount,
        //     erc20TotalFee,
        //     erc20ArtistFee,
        //     _recipient
        // );
    }

    function batchBuyElements(
        uint256[] memory _tokenIds,
        uint256[] memory _erc1155Quantities,
        uint256[] memory _maxERC20sToSpend,
        address _spender,
        address _recipient
    ) external onlyStudio {
        require(
            _tokenIds.length == _erc1155Quantities.length &&
                _tokenIds.length == _maxERC20sToSpend.length,
            "Invalid array lengths"
        );

        for (uint256 i; i < _tokenIds.length; i++) {
            buyElements(
                _tokenIds[i],
                _erc1155Quantities[i],
                _maxERC20sToSpend[i],
                _spender,
                _recipient
            );
        }
    }

    function sellElements(
        uint256 _tokenId,
        uint256 _erc1155Quantity,
        uint256 _minERC20ToReceive,
        address _erc20Recipient
    ) public onlyStudio {
        require(
            block.timestamp >= tokenIdToBondingCurve[_tokenId].startTime,
            "AMM has not started yet"
        );
        uint256 erc20TotalAmount = getSellERC20Amount(
            _tokenId,
            _erc1155Quantity
        );
        require(erc20TotalAmount >= _minERC20ToReceive, "Slippage too high");

        tokenIdToBondingCurve[_tokenId].reserves -= erc20TotalAmount;

        element.burn(msg.sender, _tokenId, _erc1155Quantity);

        IERC20(tokenIdToBondingCurve[_tokenId].erc20Token).safeTransfer(
            _erc20Recipient,
            erc20TotalAmount
        );

        // emit ElementsSold(
        //     _bondingCurveCreator,
        //     _tokenId,
        //     _erc1155Quantity,
        //     erc20TotalAmount,
        //     _recipient
        // );
    }

    function batchSellElements(
        uint256[] memory _tokenIds,
        uint256[] memory _erc1155Quantities,
        uint256[] memory _minERC20sToReceive,
        address _erc20Recipient
    ) external onlyStudio {
        require(
            _tokenIds.length == _erc1155Quantities.length &&
                _tokenIds.length == _minERC20sToReceive.length,
            "Invalid array lengths"
        );

        for (uint256 i; i < _tokenIds.length; i++) {
            sellElements(
                _tokenIds[i],
                _erc1155Quantities[i],
                _minERC20sToReceive[i],
                _erc20Recipient
            );
        }
    }

    // function claimPlatformRevenue(address _recipient) external onlyOwner {
    //     uint256 _platformRevenue = platformRevenue;
    //     platformRevenue = 0;

    //     weth.transfer(_recipient, _platformRevenue);

    //     emit PlatformRevenueClaimed(_recipient, _platformRevenue);
    // }

    // function claimArtistRevenue(address _recipient) external {
    //     require(
    //         artistRevenues[msg.sender] > 0,
    //         "You do not have an available balance"
    //     );

    //     uint256 claimedRevenue = artistRevenues[msg.sender];
    //     artistRevenues[msg.sender] = 0;

    //     weth.safeTransfer(_recipient, claimedRevenue);

    //     emit ArtistRevenueClaimed(_recipient, claimedRevenue);
    // }

    function getBuyERC20AmountWithFee(
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
        uint256 nominalERC20Amount = getBuyERC20Amount(
            _tokenId,
            _erc1155Quantity
        );
        erc20TotalFee =
            (nominalERC20Amount * totalFeeNumerator) /
            FEE_DENOMINATOR;
        erc20ArtistFee =
            (nominalERC20Amount * artistFeeNumerator) /
            FEE_DENOMINATOR;
        erc20TotalAmount = nominalERC20Amount + erc20TotalFee;
    }

    function getBuyERC20Amount(uint256 _tokenId, uint256 _erc1155Quantity)
        public
        view
        returns (uint256 erc20Amount)
    {
        require(
            block.timestamp >= tokenIdToBondingCurve[_tokenId].startTime,
            "AMM has not started yet"
        );
        require(
            tokenIdToBondingCurve[_tokenId].artistAddress != address(0),
            "Bonding curve not initialized"
        );

        // reserves = (a * supply) + (b * supply)^2
        uint256 newElementSupply = element.totalSupply(_tokenId) +
            _erc1155Quantity;

        erc20Amount =
            ((tokenIdToBondingCurve[_tokenId].constantA * newElementSupply) +
                (tokenIdToBondingCurve[_tokenId].constantB *
                    newElementSupply) **
                    2) -
            tokenIdToBondingCurve[_tokenId].reserves;
    }

    function getSellERC20Amount(uint256 _tokenId, uint256 _erc1155Quantity)
        public
        view
        returns (uint256 erc20Amount)
    {
        require(
            block.timestamp >= tokenIdToBondingCurve[_tokenId].startTime,
            "AMM has not started yet"
        );
        require(
            tokenIdToBondingCurve[_tokenId].artistAddress != address(0),
            "Bonding curve not initialized"
        );
        require(
            element.totalSupply(_tokenId) >= _erc1155Quantity,
            "Quantity greater than total supply"
        );
        // reserves = (a * supply) + (b * supply)^2
        uint256 newElementSupply = element.totalSupply(_tokenId) -
            _erc1155Quantity;

        erc20Amount =
            tokenIdToBondingCurve[_tokenId].reserves -
            ((tokenIdToBondingCurve[_tokenId].constantA * newElementSupply) +
                (tokenIdToBondingCurve[_tokenId].constantB *
                    newElementSupply) **
                    2);
    }
}
