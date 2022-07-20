//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IAMM {
    struct BondingCurve {
        uint256 constantA;
        uint256 constantB;
        uint256 reserves;
        address artistAddress;
        address erc20Token;
        uint256 startTime;
    }

    event BondingCurveCreated(
        uint256 indexed tokenId,
        uint256 constantA,
        uint256 constantB,
        address indexed artistAddress,
        address erc20Token,
        uint256 startTime
    );

    event ElementsBought(
        address indexed bondingCurveCreator,
        uint256 indexed tokenId,
        uint256 erc1155Quantity,
        uint256 erc20TotalSpent,
        uint256 erc20TotalFee,
        uint256 erc20ArtistFee,
        address indexed recipient
    );

    event ElementsSold(
        address indexed bondingCurveCreator,
        uint256 indexed tokenId,
        uint256 erc1155Quantity,
        uint256 erc20Received,
        address indexed recipient
    );

    event PlatformRevenueClaimed(
        address indexed recipient,
        uint256 revenueClaimed
    );

    event ArtistRevenueClaimed(
        address indexed recipient,
        uint256 revenueClaimed
    );

    function initialize(
        address _element,
        address _studio,
        uint256 _totalFeeNumerator,
        uint256 _artistFeeNumerator
    ) external;

    function createBondingCurves(
        uint256[] calldata _tokenIds,
        uint256[] calldata _constantAs,
        uint256[] calldata _constantBs,
        address _artistAddress,
        address _erc20Token,
        uint256 _startTime
    ) external;

    function createBondingCurve(
        uint256 _tokenId,
        uint256 _constantA,
        uint256 _constantB,
        address _artistAddress,
        address _erc20Token,
        uint256 _startTime
    ) external;

    function buyElements(
        uint256 _tokenId,
        uint256 _erc1155Quantity,
        uint256 _maxERC20ToSpend,
        address _spender,
        address _recipient
    ) external;

    function batchBuyElements(
        uint256[] memory _tokenIds,
        uint256[] memory _erc1155Quantities,
        uint256[] memory _maxERC20sToSpend,
        address _spender,
        address _recipient
    ) external;

    function sellElements(
        uint256 _tokenId,
        uint256 _erc1155Quantity,
        uint256 _minERC20ToReceive,
        address _erc20Recipient
    ) external;

    function batchSellElements(
        uint256[] memory _tokenIds,
        uint256[] memory _erc1155Quantities,
        uint256[] memory _minERC20sToReceive,
        address _erc20Recipient
    ) external;

    function getBuyERC20AmountWithFee(
        uint256 _tokenId,
        uint256 _erc1155Quantity
    )
        external
        view
        returns (
            uint256 erc20TotalAmount,
            uint256 erc20TotalFee,
            uint256 erc20ArtistFee
        );

    function getBuyERC20Amount(uint256 _tokenId, uint256 _erc1155Quantity)
        external
        view
        returns (uint256 erc20Amount);
    

    function getSellERC20Amount(uint256 _tokenId, uint256 _erc1155Quantity)
        external
        view
        returns (uint256 erc20Amount);
}
