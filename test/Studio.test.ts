import {
  AMM,
  Canvas,
  Studio,
  DutchAuction,
  Element,
  MockWeth,
} from "../typechain-types";
import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import time from "./helpers/time";

describe("Studio", function () {
  let canvas: Canvas;
  let element: Element;
  let dutchAuction: DutchAuction;
  let amm: AMM;
  let studio: Studio;
  let mockWeth: MockWeth;

  // wallets
  let artist: SignerWithAddress;
  let user: SignerWithAddress;

  // vars
  let timestamp;
  let dutchAuctionStartTime: number;
  let dutchAuctionEndTime: number;
  let ammStartTime: number;

  beforeEach(async function () {
    // get signers
    [artist, user] = await ethers.getSigners();

    // Run deploy scripts
    await deployments.fixture();

    // Get deployed contracts
    canvas = await ethers.getContract("Canvas");
    element = await ethers.getContract("Element");
    dutchAuction = await ethers.getContract("DutchAuction");
    amm = await ethers.getContract("AMM");
    studio = await ethers.getContract("Studio");
    mockWeth = mockWeth = await ethers.getContract("MockWeth");

    const createProjectData = {
      name: "Test Name",
      description: "Test Description",
      artistAddress: artist.address,
      artistName: "Test Artist Name",
      website: "Test Website",
      license: "Test License",
      baseURI: "Test Base URI",
      scriptJSON: "Test Script JSON",
      // scripts: ["Test Script 1", "Test Script 2"],
      scriptCount: 2,
      maxInvocations: 100,
      featureCategoryLabels: ["Hair Color", "Eye Color"],
      featureLabels: [
        ["Blonde", "Brown", "Black"],
        ["Green", "Blue"],
      ],
    };

    timestamp = (await ethers.provider.getBlock("latest")).timestamp;
    dutchAuctionStartTime = timestamp + 100;
    dutchAuctionEndTime = timestamp + 200;
    ammStartTime = timestamp + 150;

    const createAuction = {
      startTime: dutchAuctionStartTime,
      endTime: dutchAuctionEndTime,
      startPrice: ethers.utils.parseEther("1"),
      endPrice: ethers.utils.parseEther("0.1"),
      artistAddress: artist.address,
      erc20Token: mockWeth.address,
    };

    const createAMM = {
      startTime: ammStartTime,
      erc20Token: mockWeth.address,
      constantA: [
        [1000, 2000, 3000],
        [4000, 5000],
      ],
      constantB: [
        [6000, 7000, 8000],
        [9000, 10000],
      ],
    };

    await studio.createProject(createProjectData, createAuction, createAMM);

    await studio.updateScript(1, 0, "Test Script 1");
    await studio.updateScript(1, 1, "Test Script 2");

    await mockWeth.mint(user.address, ethers.utils.parseEther("100"));

    await mockWeth
      .connect(user)
      .approve(dutchAuction.address, ethers.utils.parseEther("100"));

    await mockWeth
      .connect(user)
      .approve(amm.address, ethers.utils.parseEther("100"));

    await element.connect(user).setApprovalForAll(studio.address, true);
  });

  it("Initializes Studio contract", async () => {
    expect(await studio.element()).to.eq(element.address);
    expect(await studio.canvas()).to.eq(canvas.address);
    expect(await studio.dutchAuction()).to.eq(dutchAuction.address);
    expect(await studio.amm()).to.eq(amm.address);
  });

  it("Created the Studio project", async () => {
    expect((await studio.projects(1)).name).to.eq("Test Name");
    expect((await studio.projects(1)).description).to.eq("Test Description");
    expect((await studio.projects(1)).artistAddress).to.eq(artist.address);
    expect((await studio.projects(1)).artistName).to.eq("Test Artist Name");
    expect((await studio.projects(1)).website).to.eq("Test Website");
    expect((await studio.projects(1)).license).to.eq("Test License");
    expect((await studio.projects(1)).baseURI).to.eq("Test Base URI");
    expect((await studio.projects(1)).scriptJSON).to.eq("Test Script JSON");
    expect(await studio.getProjectScripts(1)).to.deep.eq([
      "Test Script 1",
      "Test Script 2",
    ]);
    expect(await studio.getProjectFeatureCategoryLabels(1)).to.deep.eq([
      "Hair Color",
      "Eye Color",
    ]);
    expect(await studio.getProjectFeatureTokenIds(1)).to.deep.eq([
      [BigNumber.from("1"), BigNumber.from("2"), BigNumber.from("3")],
      [BigNumber.from("4"), BigNumber.from("5")],
    ]);
  });

  it("Created the Canvas project", async () => {
    expect((await canvas.projects(1)).studio).to.eq(studio.address);
    expect((await canvas.projects(1)).minter).to.eq(dutchAuction.address);
    expect((await canvas.projects(1)).invocations).to.eq(0);
    expect((await canvas.projects(1)).maxInvocations).to.eq(100);
  });

  it("Created the Elements", async () => {
    expect((await element.features(1)).label).to.eq("Blonde");
    expect((await element.features(1)).minter).to.eq(amm.address);

    expect((await element.features(2)).label).to.eq("Brown");
    expect((await element.features(2)).minter).to.eq(amm.address);

    expect((await element.features(3)).label).to.eq("Black");
    expect((await element.features(3)).minter).to.eq(amm.address);

    expect((await element.features(4)).label).to.eq("Green");
    expect((await element.features(4)).minter).to.eq(amm.address);

    expect((await element.features(5)).label).to.eq("Blue");
    expect((await element.features(5)).minter).to.eq(amm.address);
  });

  it("Created the Dutch Auction", async () => {
    expect(await dutchAuction.canvas()).to.eq(canvas.address);
    expect(await dutchAuction.studio()).to.eq(studio.address);

    expect((await dutchAuction.projectIdToAuction(1)).startTime).to.eq(
      dutchAuctionStartTime
    );
    expect((await dutchAuction.projectIdToAuction(1)).endTime).to.eq(
      dutchAuctionEndTime
    );
    expect((await dutchAuction.projectIdToAuction(1)).startPrice).to.eq(
      ethers.utils.parseEther("1")
    );
    expect((await dutchAuction.projectIdToAuction(1)).endPrice).to.eq(
      ethers.utils.parseEther("0.1")
    );
    expect((await dutchAuction.projectIdToAuction(1)).artistAddress).to.eq(
      artist.address
    );
    expect((await dutchAuction.projectIdToAuction(1)).erc20Token).to.eq(
      mockWeth.address
    );
  });

  it("Created the AMM Bonding Curves", async () => {
    expect((await amm.tokenIdToBondingCurve(1)).constantA).to.eq(1000);
    expect((await amm.tokenIdToBondingCurve(1)).constantB).to.eq(6000);
    expect((await amm.tokenIdToBondingCurve(1)).reserves).to.eq(0);
    expect((await amm.tokenIdToBondingCurve(1)).artistAddress).to.eq(
      artist.address
    );
    expect((await amm.tokenIdToBondingCurve(1)).erc20Token).to.eq(
      mockWeth.address
    );
    expect((await amm.tokenIdToBondingCurve(1)).startTime).to.eq(ammStartTime);

    expect((await amm.tokenIdToBondingCurve(2)).constantA).to.eq(2000);
    expect((await amm.tokenIdToBondingCurve(2)).constantB).to.eq(7000);
    expect((await amm.tokenIdToBondingCurve(2)).reserves).to.eq(0);
    expect((await amm.tokenIdToBondingCurve(2)).artistAddress).to.eq(
      artist.address
    );
    expect((await amm.tokenIdToBondingCurve(2)).erc20Token).to.eq(
      mockWeth.address
    );
    expect((await amm.tokenIdToBondingCurve(2)).startTime).to.eq(ammStartTime);

    expect((await amm.tokenIdToBondingCurve(3)).constantA).to.eq(3000);
    expect((await amm.tokenIdToBondingCurve(3)).constantB).to.eq(8000);
    expect((await amm.tokenIdToBondingCurve(3)).reserves).to.eq(0);
    expect((await amm.tokenIdToBondingCurve(3)).artistAddress).to.eq(
      artist.address
    );
    expect((await amm.tokenIdToBondingCurve(3)).erc20Token).to.eq(
      mockWeth.address
    );
    expect((await amm.tokenIdToBondingCurve(3)).startTime).to.eq(ammStartTime);

    expect((await amm.tokenIdToBondingCurve(4)).constantA).to.eq(4000);
    expect((await amm.tokenIdToBondingCurve(4)).constantB).to.eq(9000);
    expect((await amm.tokenIdToBondingCurve(4)).reserves).to.eq(0);
    expect((await amm.tokenIdToBondingCurve(4)).artistAddress).to.eq(
      artist.address
    );
    expect((await amm.tokenIdToBondingCurve(4)).erc20Token).to.eq(
      mockWeth.address
    );
    expect((await amm.tokenIdToBondingCurve(4)).startTime).to.eq(ammStartTime);

    expect((await amm.tokenIdToBondingCurve(5)).constantA).to.eq(5000);
    expect((await amm.tokenIdToBondingCurve(5)).constantB).to.eq(10000);
    expect((await amm.tokenIdToBondingCurve(5)).reserves).to.eq(0);
    expect((await amm.tokenIdToBondingCurve(5)).artistAddress).to.eq(
      artist.address
    );
    expect((await amm.tokenIdToBondingCurve(5)).erc20Token).to.eq(
      mockWeth.address
    );
    expect((await amm.tokenIdToBondingCurve(5)).startTime).to.eq(ammStartTime);
  });

  it("A user can buy a canvas", async () => {
    // Move forward in time so auction and AMMs are active
    await time.increase(time.duration.seconds(160));

    const userWethBalanceBefore = await mockWeth.balanceOf(user.address);

    await studio.connect(user).buyCanvases(1, 1);

    const canvasPrice = await dutchAuction.getCanvasPrice(1);

    const userWethBalanceAfter = await mockWeth.balanceOf(user.address);

    expect(userWethBalanceBefore.sub(userWethBalanceAfter)).to.eq(canvasPrice);
    expect(await canvas.ownerOf(1000000)).to.eq(user.address);
  });

  it("A user can buy a canvas, elements, and wrap them", async () => {
    // Move forward in time so auction and AMMs are active
    await time.increase(time.duration.seconds(160));

    const element1Price = (await amm.getBuyERC20AmountWithFee(1, 1))
      .erc20TotalAmount;
    const element4Price = (await amm.getBuyERC20AmountWithFee(4, 1))
      .erc20TotalAmount;

    const userWethBalanceBefore = await mockWeth.balanceOf(user.address);

    expect((await studio.canvases(1000000)).wrapped).to.eq(false);
    expect(await studio.getUserNonce(user.address)).to.eq(0);
    expect(await studio.getCanvasWrappedTokenIds(1000000)).to.deep.eq([]);

    await studio
      .connect(user)
      .buyCanvasAndElementsAndWrap(
        1,
        [1, 4],
        [1, 1],
        [ethers.utils.parseEther("1"), ethers.utils.parseEther("1")],
        [0, 0]
      );

    const canvasPrice = await dutchAuction.getCanvasPrice(1);

    const userWethBalanceAfter = await mockWeth.balanceOf(user.address);

    expect(userWethBalanceBefore.sub(userWethBalanceAfter)).to.eq(
      canvasPrice.add(element1Price).add(element4Price)
    );
    expect((await studio.canvases(1000000)).wrapped).to.eq(true);
    expect(await studio.getUserNonce(user.address)).to.eq(1);
    expect(await studio.getCanvasWrappedTokenIds(1000000)).to.deep.eq([
      BigNumber.from("1"),
      BigNumber.from("4"),
    ]);
    // Add test case for expected canvas hash
  });

  it("Gets the project ID from the canvas ID", async () => {
    expect(await studio.getProjectIdFromCanvasId(1000000)).to.eq(1);
    expect(await studio.getProjectIdFromCanvasId(1000001)).to.eq(1);
    expect(await studio.getProjectIdFromCanvasId(1999999)).to.eq(1);

    expect(await studio.getProjectIdFromCanvasId(2000000)).to.eq(2);
    expect(await studio.getProjectIdFromCanvasId(2000001)).to.eq(2);
    expect(await studio.getProjectIdFromCanvasId(2999999)).to.eq(2);

    expect(await studio.getProjectIdFromCanvasId(3000000)).to.eq(3);
    expect(await studio.getProjectIdFromCanvasId(3000001)).to.eq(3);
    expect(await studio.getProjectIdFromCanvasId(3999999)).to.eq(3);
  });
});
