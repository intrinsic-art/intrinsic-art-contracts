import {
  AMM,
  Canvas,
  ColoringBook,
  DutchAuction,
  Element,
  MockWeth,
} from "../typechain-types";
import { expect } from "chai";
import { ethers, deployments, network } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import Config from "../helpers/Config";
import { BigNumber } from "ethers";

describe.only("AMM", function () {
  let coloringBook: ColoringBook;
  let canvas: Canvas;
  let element: Element;
  let dutchAuction: DutchAuction;
  let amm: AMM;
  let mockWeth: MockWeth;

  // wallets
  let deployer: SignerWithAddress;
  let user: SignerWithAddress;
  let artist: SignerWithAddress;

  // vars
  let timestamp: number;
  let CreateAMM: {
    constantA: number[];
    constantB: number[];
  };

  async function addProject() {
    const CreateProject = {
      artist: artist.address,
      maxInvocations: 100,
      projectName: "Name",
      artistName: "Artist",
      description: "Description",
    };
    const CreateMetaData = {
      website: "Website",
      license: "License",
      projectBaseURI: "ProjectBaseURI",
    };
    const CreateScripts = {
      scripts: ["scripts"],
      scriptIndex: [0],
      scriptJSON: "scriptJSON",
    };
    const CreateFeaturesAndCategories = {
      featureCategories: ["featureCategories"],
      features: [["features"]],
    };
    timestamp = (await ethers.provider.getBlock("latest")).timestamp;
    const CreateAuction = {
      startTime: timestamp + 100,
      endTime: timestamp + 1000,
      startPrice: ethers.utils.parseEther("1"),
      endPrice: ethers.utils.parseEther(".1"),
      erc721: canvas.address,
      currency: mockWeth.address,
    };
    CreateAMM = {
      constantA: [10],
      constantB: [10],
    };
    await coloringBook.addProject(
      CreateProject,
      CreateMetaData,
      CreateScripts,
      CreateAuction,
      CreateFeaturesAndCategories,
      CreateAMM
    );
  }

  beforeEach(async function () {
    // Run deploy scripts
    [deployer, user, artist] = await ethers.getSigners();
    await deployments.fixture();

    // Get deployed MockNFT contract
    coloringBook = await ethers.getContract("ColoringBook");
    canvas = await ethers.getContract("Canvas");
    element = await ethers.getContract("Element");
    dutchAuction = await ethers.getContract("DutchAuction");
    amm = await ethers.getContract("AMM");
    mockWeth = await ethers.getContract("MockWeth");

    await coloringBook.initialize(
      element.address,
      amm.address,
      dutchAuction.address,
      canvas.address,
      mockWeth.address
    );

    await mockWeth.mint(user.address, ethers.utils.parseEther("100"));
    mockWeth
      .connect(user)
      .approve(dutchAuction.address, ethers.utils.parseEther("100"));
    mockWeth.connect(user).approve(amm.address, ethers.utils.parseEther("100"));
  });

  it("Constructor sets AMM vars", async () => {
    expect(await amm.weth()).to.eq(mockWeth.address);
    expect(await amm.totalFeeNumerator()).to.eq(Config.AMM.totalFeeNumerator);
    expect(await amm.artistFeeNumerator()).to.eq(Config.AMM.artistFeeNumerator);
  });
  it("Bonding curve initialized", async () => {
    await addProject();
    expect(await amm.tokenIdToBondingCurve(coloringBook.address, 1)).to.deep.eq(
      [
        ethers.BigNumber.from("10"),
        ethers.BigNumber.from("10"),
        ethers.BigNumber.from("0"),
        artist.address,
        element.address,
        ethers.BigNumber.from(`${timestamp + 100}`),
      ]
    );
  });
  it("Batch buy/sell elements", async () => {
    await addProject();
    await element.connect(user).setApprovalForAll(amm.address, true);
    await network.provider.send("evm_increaseTime", [101]);
    await network.provider.send("evm_mine");
    await amm
      .connect(user)
      .batchBuySell(
        coloringBook.address,
        [0, 1],
        [1, 1],
        [1, 1],
        [ethers.utils.parseEther("100"), "1"],
        user.address,
        user.address
      );
    expect(await element.balanceOf(user.address, 1)).to.eq("0");
  });
  it("Buying elements updates reserves and revenues", async () => {
    await addProject();
    await network.provider.send("evm_increaseTime", [101]);
    await network.provider.send("evm_mine");
    const buyStruct: [BigNumber, BigNumber, BigNumber] & {
      erc20TotalAmount: BigNumber;
      erc20TotalFee: BigNumber;
      erc20ArtistFee: BigNumber;
    } = await amm.getBuyERC20AmountWithFee(coloringBook.address, 1, 1);
    await expect(
      amm
        .connect(user)
        .buyElements(
          coloringBook.address,
          1,
          1,
          ethers.utils.parseEther("100"),
          user.address,
          user.address
        )
    )
      .to.emit(amm, "ElementsBought")
      .withArgs(
        coloringBook.address,
        1,
        1,
        buyStruct.erc20TotalAmount,
        buyStruct.erc20TotalFee,
        buyStruct.erc20ArtistFee,
        user.address
      );
    expect(await element.balanceOf(user.address, 1)).to.eq("1");
    expect(await amm.artistRevenues(artist.address)).to.eq(
      buyStruct.erc20ArtistFee
    );
    expect(await amm.platformRevenue()).to.eq(
      buyStruct.erc20TotalFee.toNumber() - buyStruct.erc20ArtistFee.toNumber()
    );
    expect(
      await (
        await amm.tokenIdToBondingCurve(coloringBook.address, 1)
      ).reserves
    ).to.eq(
      buyStruct.erc20TotalAmount.toNumber() - buyStruct.erc20TotalFee.toNumber()
    );
  });
  it("Revert purchase if bonding curve has not started or slippage too high", async () => {
    await addProject();
    await expect(
      amm
        .connect(user)
        .buyElements(
          coloringBook.address,
          1,
          1,
          ethers.utils.parseEther("100"),
          user.address,
          user.address
        )
    ).to.be.revertedWith("AMM has not started yet");
    await network.provider.send("evm_increaseTime", [101]);
    await network.provider.send("evm_mine");
    await expect(
      amm
        .connect(user)
        .buyElements(
          coloringBook.address,
          1,
          1,
          "1",
          user.address,
          user.address
        )
    ).to.be.revertedWith("Slippage too high");
    expect(await element.balanceOf(user.address, 1)).to.eq("0");
  });
  it("Selling elements emits event and sets users balances", async () => {
    await addProject();
    await network.provider.send("evm_increaseTime", [101]);
    await network.provider.send("evm_mine");
    await amm
      .connect(user)
      .buyElements(
        coloringBook.address,
        1,
        1,
        ethers.utils.parseEther("100"),
        user.address,
        user.address
      );
    expect(await element.balanceOf(user.address, 1)).to.eq("1");
    const sellStruct = await amm.getSellERC20Amount(coloringBook.address, 1, 1);
    // user must approve AMM to sell / Canvas to wrap
    await element.connect(user).setApprovalForAll(amm.address, true);
    await expect(
      amm
        .connect(user)
        .sellElements(
          coloringBook.address,
          1,
          1,
          "1",
          user.address,
          user.address
        )
    )
      .to.emit(amm, "ElementsSold")
      .withArgs(coloringBook.address, 1, 1, sellStruct, user.address);
    expect(await element.balanceOf(user.address, 1)).to.eq("0");

    expect(
      await (
        await amm.tokenIdToBondingCurve(coloringBook.address, 1)
      ).reserves
    ).to.eq(0);
  });
  it("Revert selling is slippage to high", async () => {
    await addProject();
    await network.provider.send("evm_increaseTime", [101]);
    await network.provider.send("evm_mine");
    await amm
      .connect(user)
      .buyElements(
        coloringBook.address,
        1,
        1,
        ethers.utils.parseEther("100"),
        user.address,
        user.address
      );
    await element.connect(user).setApprovalForAll(amm.address, true);
    await expect(
      amm
        .connect(user)
        .sellElements(
          coloringBook.address,
          1,
          1,
          ethers.utils.parseEther("100"),
          user.address,
          user.address
        )
    ).to.be.revertedWith("Slippage too high");
    expect(await element.balanceOf(user.address, 1)).to.eq("1");
  });
  it("Owner can claim platform revenue", async () => {
    await addProject();
    await network.provider.send("evm_increaseTime", [101]);
    await network.provider.send("evm_mine");
    await amm
      .connect(user)
      .buyElements(
        coloringBook.address,
        1,
        1,
        ethers.utils.parseEther("100"),
        user.address,
        user.address
      );
    const platformBalance = await amm.platformRevenue();
    await expect(amm.claimPlatformRevenue(deployer.address)).to.emit(
      amm,
      "PlatformRevenueClaimed"
    );
    expect(await mockWeth.balanceOf(deployer.address)).to.eq(platformBalance);
  });
  it("Artist can claim revenue", async () => {
    await addProject();
    await network.provider.send("evm_increaseTime", [101]);
    await network.provider.send("evm_mine");
    await amm
      .connect(user)
      .buyElements(
        coloringBook.address,
        1,
        1,
        ethers.utils.parseEther("100"),
        user.address,
        user.address
      );
    const artistBalance = await amm.artistRevenues(artist.address);
    await expect(
      amm.connect(artist).claimArtistRevenue(artist.address)
    ).to.emit(amm, "ArtistRevenueClaimed");
    expect(await mockWeth.balanceOf(artist.address)).to.eq(artistBalance);
  });
});
