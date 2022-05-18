//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IAMM {
  struct BondingCurve {
    uint256 constantA;
    uint256 constantB;
    uint256 reserves;
    uint256 artistRevenue;
    address artistAddress;
  }

  event BondingCurveCreated(
    uint256 indexed tokenId,
    uint256 constantA,
    uint256 constantB,
    address indexed artistAddress
  );

  event ElementsBought(
    uint256 indexed tokenId,
    uint256 erc1155Quantity,
    uint256 erc20TotalSpent,
    uint256 erc20TotalFee,
    uint256 erc20ArtistFee,
    address indexed recipient
  );

  event ElementsSold(
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
    address _artistAddress
  ) external;

  function buyElements(
    uint256 _tokenId,
    uint256 _erc1155Quantity,
    uint256 _maxERC20ToSpend,
    address _recipient
  ) external;

  function sellElements(
    uint256 _tokenId,
    uint256 _erc1155Quantity,
    uint256 _minERC20ToReceive,
    address _recipient
  ) external;

  function claimPlatformRevenue(address _recipient) external;

  function claimArtistRevenue(uint256 _projectId, address _recipient) external;

  function getBuyERC20AmountWithFee(uint256 _tokenId, uint256 _erc1155Quantity)
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
