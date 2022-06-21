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

describe("DutchAuction", function () {
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
    await canvas.initialize(
      element.address,
      dutchAuction.address,
      coloringBook.address
    );

    await mockWeth.mint(user.address, ethers.utils.parseEther("100"));
    mockWeth
      .connect(user)
      .approve(dutchAuction.address, ethers.utils.parseEther("100"));
    mockWeth.connect(user).approve(amm.address, ethers.utils.parseEther("100"));
  });

  it("Dutch Auction Initialized", async () => {
    await addProject();
    expect(
      await dutchAuction.projectIdToAuction(coloringBook.address, 0)
    ).to.deep.eq([
      ethers.BigNumber.from("0"),
      ethers.BigNumber.from("100"),
      ethers.BigNumber.from(`${timestamp + 100}`),
      ethers.BigNumber.from(`${timestamp + 1000}`),
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther(".1"),
      artist.address,
      canvas.address,
      mockWeth.address,
    ]);
  });
  it("Buying a canvas from dutch auction should emit event and update state", async () => {
    await addProject();
    await network.provider.send("evm_increaseTime", [101]);
    await network.provider.send("evm_mine");
    await expect(
      dutchAuction.connect(user).buyCanvases(coloringBook.address, 0, 1)
    )
      .to.emit(dutchAuction, "CanvasesBought")
      .withArgs(
        coloringBook.address,
        0,
        artist.address,
        mockWeth.address,
        1,
        await dutchAuction.getCanvasPrice(coloringBook.address, 0)
      );
    expect(
      await dutchAuction.currencyToBalances(artist.address, mockWeth.address)
    ).lt(ethers.utils.parseEther("100"));
    expect(await mockWeth.balanceOf(user.address)).lt(
      ethers.utils.parseEther("100")
    );
  });
  it("Artist can claim revenue", async () => {
    await addProject();
    await network.provider.send("evm_increaseTime", [101]);
    await network.provider.send("evm_mine");
    await dutchAuction.connect(user).buyCanvases(coloringBook.address, 0, 1);
    const artistBalance = await dutchAuction.currencyToBalances(
      artist.address,
      mockWeth.address
    );
    await expect(
      dutchAuction
        .connect(artist)
        .claimArtistRevenue(artist.address, mockWeth.address)
    ).to.emit(dutchAuction, "ArtistRevenueClaimed");
    expect(await mockWeth.balanceOf(artist.address)).to.eq(artistBalance);
  });
});
