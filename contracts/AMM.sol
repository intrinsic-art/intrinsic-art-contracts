import "./interfaces/IMockElement.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AMM is Ownable {
  using SafeERC20 for IERC20;

  struct BondingCurve {
    uint256 constantA;
    uint256 constantB;
    uint256 reserves;
    uint256 artistRevenue;
    address artistAddress;
  }

  //todo: Should fee numerators be constants?

  IERC20 public weth;
  IMockElement public mockElement;
  uint256 public totalFeeNumerator;
  uint256 public artistFeeNumerator;
  uint256 constant DENOMINATOR = 1_000_000_000;
  uint256 public platformRevenue;

  // tokenID => BondingCurve
  mapping(uint256 => BondingCurve) tokenIdToBondingCurve;

  // Todo: Add events

  constructor(
    uint256 _totalFeeNumerator,
    uint256 _artistFeeNumerator,
    address _wethAddress,
    address _elementsAddress
  ) {
    weth = IERC20(_wethAddress);
    totalFeeNumerator = _totalFeeNumerator;
    artistFeeNumerator = _artistFeeNumerator;
    mockElement = IMockElement(_elementsAddress);
  }

  function createBondingCurve(uint256 _tokenId, uint256 _constantA, uint256 _constantB, address _artistAddress) external onlyOwner {
    require(_artistAddress != address(0), "Artist address cannot be address zero");
    require(tokenIdToBondingCurve[_tokenId].artistAddress == address(0), "Bonding curve already initialized");

    tokenIdToBondingCurve[_tokenId].constantA = _constantA;
    tokenIdToBondingCurve[_tokenId].constantB = _constantB;
    tokenIdToBondingCurve[_tokenId].artistAddress = _artistAddress;

    // todo: emit event
  }

  function buy(
    uint256 _tokenId,
    uint256 _erc1155Quantity,
    uint256 _maxERC20ToSpend,
    address _recipient
  ) external {
    (
      uint256 erc20TotalAmount,
      uint256 erc20TotalFee,
      uint256 erc20ArtistFee
    ) = getBuyERC20AmountWithFee(_tokenId, _erc1155Quantity);
    require(erc20TotalAmount <= _maxERC20ToSpend, "Slippage too high");

    platformRevenue += erc20TotalFee - erc20ArtistFee;
    tokenIdToBondingCurve[_tokenId].artistRevenue += erc20ArtistFee;
    tokenIdToBondingCurve[_tokenId].reserves +=
      erc20TotalAmount -
      erc20TotalFee;

    mockElement.mint(_recipient, _tokenId, _erc1155Quantity, bytes(""));

    // todo: consider adding parameter for spender address
    weth.safeTransferFrom(msg.sender, address(this), erc20TotalAmount);

    // todo: Emit event
  }

  function sell(
    uint256 _tokenId,
    uint256 _erc1155Quantity,
    uint256 _minERC20ToReceive,
    address _recipient
  ) external {
    uint256 erc20TotalAmount = getSellERC20Amount(_tokenId, _erc1155Quantity);
    require(erc20TotalAmount >= _minERC20ToReceive, "Slippage too high");

    tokenIdToBondingCurve[_tokenId].reserves -= erc20TotalAmount;

    mockElement.burn(msg.sender, _tokenId, _erc1155Quantity);

    // todo: consider adding parameter for spender address
    weth.safeTransfer(_recipient, erc20TotalAmount);

    // todo: Emit event
  }

  function claimPlatformRevenue(address _recipient) external onlyOwner {
    weth.transfer(_recipient, platformRevenue);

    platformRevenue = 0;

    // todo: emit event
  }

  function artistClaimRevenue(uint256 _projectId, address _recipient) external {
    require(msg.sender == tokenIdToBondingCurve[_projectId].artistAddress, "Only artist can claim revenue");

    tokenIdToBondingCurve[_projectId].artistRevenue = 0;

    weth.safeTransfer(_recipient, tokenIdToBondingCurve[_projectId].artistRevenue);

    // todo: Emit event
  }

  // todo: Move artist fee to revenue splitter contract
  function getBuyERC20AmountWithFee(uint256 _tokenId, uint256 _erc1155Quantity)
    public
    view
    returns (
      uint256 erc20TotalAmount,
      uint256 erc20TotalFee,
      uint256 erc20ArtistFee
    )
  {
    uint256 nominalERC20Amount = getBuyERC20Amount(_tokenId, _erc1155Quantity);
    erc20TotalFee = (nominalERC20Amount * totalFeeNumerator) / DENOMINATOR;
    erc20ArtistFee = (nominalERC20Amount * artistFeeNumerator) / DENOMINATOR;

    erc20TotalAmount = nominalERC20Amount + erc20TotalFee;
  }

  function getBuyERC20Amount(uint256 _tokenId, uint256 _erc1155Quantity)
    public
    view
    returns (uint256 erc20Amount)
  {
    require(tokenIdToBondingCurve[_tokenId].artistAddress != address(0), "Bonding curve not initialized");

    // reserves = (a * supply) + (b * supply)^2
    uint256 newElementSupply = mockElement.totalSupply(_tokenId) +
      _erc1155Quantity;

    erc20Amount =
      ((tokenIdToBondingCurve[_tokenId].constantA * newElementSupply) +
        (tokenIdToBondingCurve[_tokenId].constantB * newElementSupply)**2) -
      tokenIdToBondingCurve[_tokenId].reserves;
  }

  function getSellERC20Amount(uint256 _tokenId, uint256 _erc1155Quantity)
    public
    view
    returns (uint256 erc20Amount)
  {
    require(tokenIdToBondingCurve[_tokenId].artistAddress != address(0), "Bonding curve not initialized");
    require(
      mockElement.totalSupply(_tokenId) >= _erc1155Quantity,
      "Quantity greater than total supply"
    );
    // reserves = (a * supply) + (b * supply)^2
    uint256 newElementSupply = mockElement.totalSupply(_tokenId) -
      _erc1155Quantity;

    erc20Amount =
      tokenIdToBondingCurve[_tokenId].reserves -
      ((tokenIdToBondingCurve[_tokenId].constantA * newElementSupply) +
        (tokenIdToBondingCurve[_tokenId].constantB * newElementSupply)**2);
  }
}
