//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IAMM {
  struct BondingCurve {
    uint256 constantA;
    uint256 constantB;
    uint256 reserves;
    address artistAddress;
    address erc1155;
  }

  event BondingCurveCreated(
    address indexed bondingCurveCreator,
    uint256 indexed tokenId,
    uint256 constantA,
    uint256 constantB,
    address indexed artistAddress,
    address erc1155
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

  event ArtistRevenueClaimed(address indexed recipient, uint256 revenueClaimed);

  function createBondingCurve(
    uint256 _tokenId,
    uint256 _constantA,
    uint256 _constantB,
    address _artistAddress,
    address _erc1155
  ) external;

  function buyElements(
    address _bondingCurveCreator,
    uint256 _tokenId,
    uint256 _erc1155Quantity,
    uint256 _maxERC20ToSpend,
    address _recipient,
    address _spender
  ) external;

  function sellElements(
    address _bondingCurveCreator,
    uint256 _tokenId,
    uint256 _erc1155Quantity,
    uint256 _minERC20ToReceive,
    address _recipient,
    address _sender
  ) external;

  function claimPlatformRevenue(address _recipient) external;

  function claimArtistRevenue(address _recipient) external;

  function getBuyERC20AmountWithFee(address _bondingCurveCreator, uint256 _tokenId, uint256 _erc1155Quantity)
    external
    view
    returns (
      uint256 erc20TotalAmount,
      uint256 erc20TotalFee,
      uint256 erc20ArtistFee
    );

  function getBuyERC20Amount(address _bondingCurveCreator, uint256 _tokenId, uint256 _erc1155Quantity)
    external
    view
    returns (uint256 erc20Amount);

  function getSellERC20Amount(address _bondingCurveCreator, uint256 _tokenId, uint256 _erc1155Quantity)
    external
    view
    returns (uint256 erc20Amount);
}
