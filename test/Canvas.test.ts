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

describe("Canvas", function () {
  let coloringBook: ColoringBook;
  let canvas: Canvas;
  let element: Element;
  let dutchAuction: DutchAuction;
  let amm: AMM;
  let mockWeth: MockWeth;

  // wallets
  let deployer: SignerWithAddress;
  let user: SignerWithAddress;

  // vars
  let timestamp: number;
  let CreateAMM: {
    constantA: number[];
    constantB: number[];
  };

  async function addProject() {
    const CreateProject = {
      artist: deployer.address,
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
      constantA: [1],
      constantB: [1],
    };
    await coloringBook.addProject(
      CreateProject,
      CreateMetaData,
      CreateScripts,
      CreateAuction,
      CreateFeaturesAndCategories,
      CreateAMM
    );

    expect(await coloringBook.projects(0)).to.deep.eq([
      CreateProject.artist,
      ethers.BigNumber.from("100"),
      "Name",
      "Artist",
      "Description",
      "Website",
      "License",
      "ProjectBaseURI",
      ethers.BigNumber.from("1"),
      "scriptJSON",
    ]);
  }

  beforeEach(async function () {
    // Run deploy scripts
    [deployer, user] = await ethers.getSigners();
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

  it("Init Canvas", async () => {
    expect(await canvas.element()).to.eq(element.address);
    expect(await canvas.coloringBook()).to.eq(coloringBook.address);
    expect(await canvas.dutchAuction()).to.eq(dutchAuction.address);
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
      deployer.address,
      canvas.address,
      mockWeth.address,
    ]);
  });
  it("Revert for minting without dutchAuction", async () => {
    await addProject();
    await expect(canvas.safeMint(user.address, 0)).to.be.revertedWith(
      "Please use the Dutch Auction contract to mint a canvas"
    );
  });
  it("Revert for when auction has not started", async () => {
    await addProject();
    await expect(
      dutchAuction.buyCanvases(coloringBook.address, 0, 1)
    ).to.be.revertedWith("Auction has not started yet");
  });
  it("Canvas should emit event", async () => {
    await addProject();
    await network.provider.send("evm_increaseTime", [101]);
    await network.provider.send("evm_mine");
    await expect(
      dutchAuction.connect(user).buyCanvases(coloringBook.address, 0, 1)
    ).to.emit(canvas, "MintedToken");
    expect(await mockWeth.balanceOf(user.address)).lt(
      ethers.utils.parseEther("100")
    );
  });
  it("Created Canvas should update state", async () => {
    await addProject();
    await network.provider.send("evm_increaseTime", [101]);
    await network.provider.send("evm_mine");
    await expect(
      dutchAuction.connect(user).buyCanvases(coloringBook.address, 0, 1)
    ).to.emit(dutchAuction, "CanvasesBought");
    expect(await mockWeth.balanceOf(user.address)).lt(
      ethers.utils.parseEther("100")
    );

    const hash = await canvas.tokenIdTohash(1);
    expect(await canvas.projectToInvocations(0)).to.eq("1");
    expect(await canvas.projectIdToTokenIds(0, 0)).to.eq("1");
    expect(await canvas.hashToTokenId(hash)).to.eq("1");
  });
  it("Should be able to wrap elements into a canvas", async () => {
    await addProject();
    await network.provider.send("evm_increaseTime", [101]);
    await network.provider.send("evm_mine");
    await expect(
      dutchAuction.connect(user).buyCanvases(coloringBook.address, 0, 1)
    ).to.emit(dutchAuction, "CanvasesBought");
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
    ).to.emit(element, "TransferSingle");
    await element.connect(user).setApprovalForAll(canvas.address, true);
    await expect(canvas.connect(user).wrap(user.address, [1], [1], 1)).to.emit(
      canvas,
      "WrappedTokens"
    );
    expect(await canvas.canvasIdToFeatureToBalances("1", "1")).to.eq("1");
    expect(
      await element.tokenIdToFeature(await canvas.canvasIdToFeatures("1", "0"))
    ).to.eq("features");
    expect(await canvas.canvasIdToFeatureArrayIndex("1", "1")).to.eq("0");
    expect(
      await canvas.canvasIdToCategoryToFeatureId("1", "featureCategories")
    ).to.eq("1");
    expect(await canvas.findIdToCategory("0", "1")).to.eq("featureCategories");
    expect(await element.balanceOf(canvas.address, 1)).to.eq("1");
    expect(await element.balanceOf(user.address, 1)).to.eq("0");
  });
  it("Revert wrap if not canvas owner", async () => {
    await addProject();
    await network.provider.send("evm_increaseTime", [101]);
    await network.provider.send("evm_mine");
    await expect(
      dutchAuction.connect(user).buyCanvases(coloringBook.address, 0, 1)
    ).to.emit(dutchAuction, "CanvasesBought");
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
    ).to.emit(element, "TransferSingle");
    await element.connect(user).setApprovalForAll(canvas.address, true);
    await expect(canvas.wrap(user.address, [1], [1], 1)).to.revertedWith(
      "You are not the owner of this Canvas"
    );
  });
  it("Should be able to unwrap elements from a canvas", async () => {
    await addProject();
    await network.provider.send("evm_increaseTime", [101]);
    await network.provider.send("evm_mine");
    await expect(
      dutchAuction.connect(user).buyCanvases(coloringBook.address, 0, 1)
    ).to.emit(dutchAuction, "CanvasesBought");
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
    ).to.emit(element, "TransferSingle");
    await element.connect(user).setApprovalForAll(canvas.address, true);
    await expect(canvas.connect(user).wrap(user.address, [1], [1], 1)).to.emit(
      canvas,
      "WrappedTokens"
    );
    await expect(
      canvas.connect(user).unWrap(user.address, [1], [1], 1)
    ).to.emit(canvas, "UnWrappedTokens");
    expect(await canvas.canvasIdToFeatureToBalances("1", "1")).to.eq("0");
    expect(await element.balanceOf(canvas.address, 1)).to.eq("0");
    expect(await element.balanceOf(user.address, 1)).to.eq("1");
  });
  it("Revert unWrap if not canvas owner", async () => {
    await addProject();
    await network.provider.send("evm_increaseTime", [101]);
    await network.provider.send("evm_mine");
    await expect(
      dutchAuction.connect(user).buyCanvases(coloringBook.address, 0, 1)
    ).to.emit(dutchAuction, "CanvasesBought");
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
    ).to.emit(element, "TransferSingle");
    await element.connect(user).setApprovalForAll(canvas.address, true);
    await expect(canvas.connect(user).wrap(user.address, [1], [1], 1)).to.emit(
      canvas,
      "WrappedTokens"
    );
    await expect(canvas.unWrap(user.address, [1], [1], 1)).to.revertedWith(
      "You are not the owner of this Canvas"
    );
    expect(await element.balanceOf(canvas.address, 1)).to.eq("1");
    expect(await element.balanceOf(deployer.address, 1)).to.eq("0");
  });
});
