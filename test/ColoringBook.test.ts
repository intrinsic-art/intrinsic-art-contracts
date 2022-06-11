import {
  AMM,
  Canvas,
  ColoringBook,
  DutchAuction,
  Element,
  MockWeth,
  MockWeth__factory,
} from "../typechain-types";
import { expect } from "chai";
import { ethers, deployments } from "hardhat";

describe.only("Coloring Book", function () {
  let coloringBook: ColoringBook;
  let canvas: Canvas;
  let element: Element;
  let dutchAuction: DutchAuction;
  let amm: AMM;
  let mockWeth: MockWeth;

  // wallets
  let deployer: any;

  // vars
  let timestamp: any;

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
    const CreateAMM = {
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
      deployer.address,
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
    [deployer] = await ethers.getSigners();
    await deployments.fixture();

    // Get deployed MockNFT contract
    coloringBook = await ethers.getContract("ColoringBook");
    canvas = await ethers.getContract("Canvas");
    element = await ethers.getContract("Element");
    dutchAuction = await ethers.getContract("DutchAuction");
    amm = await ethers.getContract("AMM");
    mockWeth = await new MockWeth__factory(deployer).deploy();

    await coloringBook.initialize(
      element.address,
      amm.address,
      dutchAuction.address,
      canvas.address,
      mockWeth.address
    );
  });

  it("Init ColoringBook", async () => {
    expect(await coloringBook.element()).to.eq(element.address);
    expect(await coloringBook.canvas()).to.eq(canvas.address);
    expect(await coloringBook.dutchAuction()).to.eq(dutchAuction.address);
    expect(await coloringBook.amm()).to.eq(amm.address);
    expect(await coloringBook.weth()).to.eq(mockWeth.address);
  });
  it("Adding A project init project", async () => {
    await addProject();
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
  it("Init Features / Categories", async () => {
    await addProject();
    expect(await element.tokenIdToFeature(1)).to.eq("features");
    expect(await coloringBook.projectIdToFeatureIdToCategory(0, 1)).to.eq(
      "featureCategories"
    );
    expect(
      await coloringBook.findProjectCategoryAndFeatureStrings(0)
    ).to.deep.equal([["featureCategories"], [["features"]]]);
  });
  it("AMM Initialized", async () => {
    await addProject();
    expect(await amm.tokenIdToBondingCurve(coloringBook.address, 1)).to.deep.eq(
      [
        ethers.BigNumber.from("1"),
        ethers.BigNumber.from("1"),
        ethers.BigNumber.from("0"),
        deployer.address,
        element.address,
        ethers.BigNumber.from(`${timestamp + 100}`),
      ]
    );
  });
});
