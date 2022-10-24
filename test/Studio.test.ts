import {
  Canvas,
  Canvas__factory,
  Studio,
  Studio__factory,
  Element,
  Element__factory,
  MockWeth,
  MockWeth__factory,
} from "../typechain-types";
import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import time from "./helpers/time";

describe("Studio", function () {
  let canvas: Canvas;
  let element: Element;
  let studio: Studio;
  let mockWeth: MockWeth;

  // wallets
  let deployer: SignerWithAddress;
  let owner: SignerWithAddress;
  let artist: SignerWithAddress;
  let user: SignerWithAddress;

  // vars
  let currentTime;
  let auctionStartTime: number;
  let auctionEndTime: number;

  beforeEach(async function () {
    // get signers
    [deployer, owner, artist, user] = await ethers.getSigners();

    // Run deploy scripts
    // await deployments.fixture();

    // Get deployed contracts
    canvas = await new Canvas__factory(deployer).deploy();
    element = await new Element__factory(deployer).deploy(owner.address);
    studio = await new Studio__factory(deployer).deploy(
      owner.address,
      canvas.address,
      element.address,
      100,
      "https://intrinsic.art/"
    );
    mockWeth = await new MockWeth__factory(deployer).deploy();

    await canvas.initialize(owner.address);

    await canvas.connect(owner).addStudio(studio.address);

    await element.connect(owner).addStudio(studio.address);

    await studio.connect(owner).addWhitelistedArtists([artist.address]);

    await studio.connect(owner).addApprovedERC20(mockWeth.address);

    await studio.connect(artist).createProject(
      artist.address,
      100,
      "Test metadata",
      ["Hair Color", "Eye Color"],
      ["hairColor", "eyeColor"],
      [
        ["Blonde", "Brown", "Black"],
        ["Green", "Blue"],
      ],
      [
        ["blonde", "brown", "black"],
        ["green", "blue"],
      ],
      [
        [[30], [30], [30]],
        [[50], [50]],
      ],
      [studio.address]
    );

    await studio.connect(artist).updateScript(1, 0, "Test Script 1");
    await studio.connect(artist).updateScript(1, 1, "Test Script 2");

    await studio.connect(artist).lockProject(1);

    currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    auctionStartTime = currentTime + 110;
    auctionEndTime = currentTime + 210;

    await studio.connect(artist).updateMarkets(1, [
      {
        elementCategoryIndex: 0,
        elementIndex: 0,
        reserveElementBalance: 10,
        auctionElementBalance: 20,
        erc20: mockWeth.address,
        auctionStartTime: auctionStartTime,
        auctionEndTime: auctionEndTime,
        auctionStartPrice: ethers.utils.parseEther("1"),
        auctionEndPrice: ethers.utils.parseEther("0.1"),
      },
      {
        elementCategoryIndex: 0,
        elementIndex: 1,
        reserveElementBalance: 10,
        auctionElementBalance: 20,
        erc20: mockWeth.address,
        auctionStartTime: auctionStartTime,
        auctionEndTime: auctionEndTime,
        auctionStartPrice: ethers.utils.parseEther("1"),
        auctionEndPrice: ethers.utils.parseEther("0.1"),
      },
      {
        elementCategoryIndex: 0,
        elementIndex: 2,
        reserveElementBalance: 10,
        auctionElementBalance: 20,
        erc20: mockWeth.address,
        auctionStartTime: auctionStartTime,
        auctionEndTime: auctionEndTime,
        auctionStartPrice: ethers.utils.parseEther("1"),
        auctionEndPrice: ethers.utils.parseEther("0.1"),
      },
      {
        elementCategoryIndex: 1,
        elementIndex: 0,
        reserveElementBalance: 20,
        auctionElementBalance: 30,
        erc20: mockWeth.address,
        auctionStartTime: auctionStartTime,
        auctionEndTime: auctionEndTime,
        auctionStartPrice: ethers.utils.parseEther("1"),
        auctionEndPrice: ethers.utils.parseEther("0.1"),
      },
      {
        elementCategoryIndex: 1,
        elementIndex: 1,
        reserveElementBalance: 20,
        auctionElementBalance: 30,
        erc20: mockWeth.address,
        auctionStartTime: auctionStartTime,
        auctionEndTime: auctionEndTime,
        auctionStartPrice: ethers.utils.parseEther("1"),
        auctionEndPrice: ethers.utils.parseEther("0.1"),
      },
    ]);

    await mockWeth.mint(user.address, ethers.utils.parseEther("100"));

    await mockWeth
      .connect(user)
      .approve(studio.address, ethers.utils.parseEther("100"));

    await element.connect(user).setApprovalForAll(studio.address, true);
  });

  it("Initializes Studio contract", async () => {
    expect(await studio.element()).to.eq(element.address);
    expect(await studio.canvas()).to.eq(canvas.address);
  });

  it("Created the Studio project", async () => {
    expect(await studio.getProjectMetadata(1)).to.eq("Test metadata");
    expect(await studio.getProjectArtist(1)).to.eq(artist.address);
    expect(await studio.getProjectScriptCount(1)).to.eq(2);
    expect(await studio.getProjectScripts(1)).to.deep.eq([
      "Test Script 1",
      "Test Script 2",
    ]);
    expect(await studio.getProjectElementCategoryLabels(1)).to.deep.eq([
      "Hair Color",
      "Eye Color",
    ]);
    expect(await studio.getProjectElementCategoryValues(1)).to.deep.eq([
      "hairColor",
      "eyeColor",
    ]);
    expect(await studio.getProjectElementTokenIds(1)).to.deep.eq([
      [BigNumber.from("1"), BigNumber.from("2"), BigNumber.from("3")],
      [BigNumber.from("4"), BigNumber.from("5")],
    ]);
    expect(await studio.getProjectElementLabels(1)).to.deep.eq([
      ["Blonde", "Brown", "Black"],
      ["Green", "Blue"],
    ]);
    expect(await studio.getProjectElementValues(1)).to.deep.eq([
      ["blonde", "brown", "black"],
      ["green", "blue"],
    ]);
    expect(await studio.getProjectIsLocked(1)).to.eq(true);
  });

  it("Created the Canvas project", async () => {
    expect((await canvas.projects(1)).studio).to.eq(studio.address);
    expect((await canvas.projects(1)).supply).to.eq(0);
    expect((await canvas.projects(1)).maxSupply).to.eq(100);
  });

  it("Created the Elements", async () => {
    expect((await element.elements(1)).label).to.eq("Blonde");
    expect((await element.elements(1)).value).to.eq("blonde");

    expect((await element.elements(2)).label).to.eq("Brown");
    expect((await element.elements(2)).value).to.eq("brown");

    expect((await element.elements(3)).label).to.eq("Black");
    expect((await element.elements(3)).value).to.eq("black");

    expect((await element.elements(4)).label).to.eq("Green");
    expect((await element.elements(4)).value).to.eq("green");

    expect((await element.elements(5)).label).to.eq("Blue");
    expect((await element.elements(5)).value).to.eq("blue");
  });

  it("Created the Markets", async () => {
    expect((await studio.markets(1)).ammERC20Balance).to.eq(0);
    expect((await studio.markets(1)).auctionERC20Balance).to.eq(0);
    expect((await studio.markets(1)).ammElementBalance).to.eq(0);
    expect((await studio.markets(1)).reserveElementBalance).to.eq(10);
    expect((await studio.markets(1)).auctionElementBalance).to.eq(20);
    expect((await studio.markets(1)).reserveElementBalanceInitial).to.eq(10);
    expect((await studio.markets(1)).auctionElementBalanceInitial).to.eq(20);
    expect((await studio.markets(1)).erc20).to.eq(mockWeth.address);
    expect((await studio.markets(1)).auctionStartTime).to.eq(auctionStartTime);
    expect((await studio.markets(1)).auctionEndTime).to.eq(auctionEndTime);
    expect((await studio.markets(1)).auctionStartPrice).to.eq(
      ethers.utils.parseEther("1")
    );
    expect((await studio.markets(1)).auctionEndPrice).to.eq(
      ethers.utils.parseEther("0.1")
    );
    expect((await studio.markets(1)).artist).to.eq(artist.address);

    expect((await studio.markets(2)).ammERC20Balance).to.eq(0);
    expect((await studio.markets(2)).auctionERC20Balance).to.eq(0);
    expect((await studio.markets(2)).ammElementBalance).to.eq(0);
    expect((await studio.markets(2)).reserveElementBalance).to.eq(10);
    expect((await studio.markets(2)).auctionElementBalance).to.eq(20);
    expect((await studio.markets(2)).reserveElementBalanceInitial).to.eq(10);
    expect((await studio.markets(2)).auctionElementBalanceInitial).to.eq(20);
    expect((await studio.markets(2)).erc20).to.eq(mockWeth.address);
    expect((await studio.markets(2)).auctionStartTime).to.eq(auctionStartTime);
    expect((await studio.markets(2)).auctionEndTime).to.eq(auctionEndTime);
    expect((await studio.markets(2)).auctionStartPrice).to.eq(
      ethers.utils.parseEther("1")
    );
    expect((await studio.markets(2)).auctionEndPrice).to.eq(
      ethers.utils.parseEther("0.1")
    );
    expect((await studio.markets(2)).artist).to.eq(artist.address);

    expect((await studio.markets(3)).ammERC20Balance).to.eq(0);
    expect((await studio.markets(3)).auctionERC20Balance).to.eq(0);
    expect((await studio.markets(3)).ammElementBalance).to.eq(0);
    expect((await studio.markets(3)).reserveElementBalance).to.eq(10);
    expect((await studio.markets(3)).auctionElementBalance).to.eq(20);
    expect((await studio.markets(3)).reserveElementBalanceInitial).to.eq(10);
    expect((await studio.markets(3)).auctionElementBalanceInitial).to.eq(20);
    expect((await studio.markets(3)).erc20).to.eq(mockWeth.address);
    expect((await studio.markets(3)).auctionStartTime).to.eq(auctionStartTime);
    expect((await studio.markets(3)).auctionEndTime).to.eq(auctionEndTime);
    expect((await studio.markets(3)).auctionStartPrice).to.eq(
      ethers.utils.parseEther("1")
    );
    expect((await studio.markets(3)).auctionEndPrice).to.eq(
      ethers.utils.parseEther("0.1")
    );
    expect((await studio.markets(3)).artist).to.eq(artist.address);

    expect((await studio.markets(4)).ammERC20Balance).to.eq(0);
    expect((await studio.markets(4)).auctionERC20Balance).to.eq(0);
    expect((await studio.markets(4)).ammElementBalance).to.eq(0);
    expect((await studio.markets(4)).reserveElementBalance).to.eq(20);
    expect((await studio.markets(4)).auctionElementBalance).to.eq(30);
    expect((await studio.markets(4)).reserveElementBalanceInitial).to.eq(20);
    expect((await studio.markets(4)).auctionElementBalanceInitial).to.eq(30);
    expect((await studio.markets(4)).erc20).to.eq(mockWeth.address);
    expect((await studio.markets(4)).auctionStartTime).to.eq(auctionStartTime);
    expect((await studio.markets(4)).auctionEndTime).to.eq(auctionEndTime);
    expect((await studio.markets(4)).auctionStartPrice).to.eq(
      ethers.utils.parseEther("1")
    );
    expect((await studio.markets(4)).auctionEndPrice).to.eq(
      ethers.utils.parseEther("0.1")
    );
    expect((await studio.markets(4)).artist).to.eq(artist.address);

    expect((await studio.markets(5)).ammERC20Balance).to.eq(0);
    expect((await studio.markets(5)).auctionERC20Balance).to.eq(0);
    expect((await studio.markets(5)).ammElementBalance).to.eq(0);
    expect((await studio.markets(5)).reserveElementBalance).to.eq(20);
    expect((await studio.markets(5)).auctionElementBalance).to.eq(30);
    expect((await studio.markets(5)).reserveElementBalanceInitial).to.eq(20);
    expect((await studio.markets(5)).auctionElementBalanceInitial).to.eq(30);
    expect((await studio.markets(5)).erc20).to.eq(mockWeth.address);
    expect((await studio.markets(5)).auctionStartTime).to.eq(auctionStartTime);
    expect((await studio.markets(5)).auctionEndTime).to.eq(auctionEndTime);
    expect((await studio.markets(5)).auctionStartPrice).to.eq(
      ethers.utils.parseEther("1")
    );
    expect((await studio.markets(5)).auctionEndPrice).to.eq(
      ethers.utils.parseEther("0.1")
    );
    expect((await studio.markets(5)).artist).to.eq(artist.address);
  });

  it("A user can create a completed canvas", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(120));

    const userWethBalanceBefore = await mockWeth.balanceOf(user.address);

    expect(await studio.getIsCanvasWrapped(1000000)).to.eq(false);
    expect(await studio.userNonces(user.address)).to.eq(0);
    expect(await studio.getCanvasElementLabels(1000000)).to.deep.eq([]);
    expect(await studio.getCanvasElementValues(1000000)).to.deep.eq([]);
    expect(await element.balanceOf(studio.address, 1)).to.eq(30);
    expect(await element.balanceOf(studio.address, 4)).to.eq(50);

    expect((await studio.markets(1)).ammERC20Balance).to.eq(0);
    expect((await studio.markets(1)).auctionERC20Balance).to.eq(0);
    expect((await studio.markets(1)).ammElementBalance).to.eq(0);
    expect((await studio.markets(1)).reserveElementBalance).to.eq(10);
    expect((await studio.markets(1)).auctionElementBalance).to.eq(20);
    expect(await element.balanceOf(studio.address, 1)).to.eq(30);

    expect((await studio.markets(4)).ammERC20Balance).to.eq(0);
    expect((await studio.markets(4)).auctionERC20Balance).to.eq(0);
    expect((await studio.markets(4)).ammElementBalance).to.eq(0);
    expect((await studio.markets(4)).reserveElementBalance).to.eq(20);
    expect((await studio.markets(4)).auctionElementBalance).to.eq(30);
    expect(await element.balanceOf(studio.address, 4)).to.eq(50);

    await studio
      .connect(user)
      .buyElementsAndWrap(
        [1, 4],
        [1, 1],
        ethers.utils.parseEther("2"),
        1,
        [0, 0]
      );

    const element1Price = await studio.getElementAuctionPrice(1);
    const element4Price = await studio.getElementAuctionPrice(4);

    const userWethBalanceAfter = await mockWeth.balanceOf(user.address);

    expect(userWethBalanceBefore.sub(userWethBalanceAfter)).to.eq(
      element1Price.add(element4Price)
    );
    expect(await studio.getIsCanvasWrapped(1000000)).to.eq(true);
    expect(await studio.userNonces(user.address)).to.eq(1);
    expect(await studio.getCanvasElementLabels(1000000)).to.deep.eq([
      "Blonde",
      "Green",
    ]);
    expect(await studio.getCanvasElementValues(1000000)).to.deep.eq([
      "blonde",
      "green",
    ]);
    expect(await canvas.ownerOf(1000000)).to.eq(user.address);

    expect((await studio.markets(1)).ammERC20Balance).to.eq(0);
    expect((await studio.markets(1)).auctionERC20Balance).to.eq(element1Price);
    expect((await studio.markets(1)).ammElementBalance).to.eq(0);
    expect((await studio.markets(1)).reserveElementBalance).to.eq(10);
    expect((await studio.markets(1)).auctionElementBalance).to.eq(19);
    expect(await element.balanceOf(studio.address, 1)).to.eq(30);

    expect((await studio.markets(4)).ammERC20Balance).to.eq(0);
    expect((await studio.markets(4)).auctionERC20Balance).to.eq(element4Price);
    expect((await studio.markets(4)).ammElementBalance).to.eq(0);
    expect((await studio.markets(4)).reserveElementBalance).to.eq(20);
    expect((await studio.markets(4)).auctionElementBalance).to.eq(29);
    expect(await element.balanceOf(studio.address, 4)).to.eq(50);
    // Add test case for expected canvas hash
  });

  it("Initializes the AMM when the auction sells out", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(120));

    const userWethBalanceBefore = await mockWeth.balanceOf(user.address);

    expect((await studio.markets(1)).ammERC20Balance).to.eq(0);
    expect((await studio.markets(1)).auctionERC20Balance).to.eq(0);
    expect((await studio.markets(1)).ammElementBalance).to.eq(0);
    expect((await studio.markets(1)).reserveElementBalance).to.eq(10);
    expect((await studio.markets(1)).auctionElementBalance).to.eq(20);
    expect(await element.balanceOf(studio.address, 1)).to.eq(30);
    expect(await element.balanceOf(user.address, 1)).to.eq(0);

    // Buy all the Elements in the auction
    // await studio.buyElements([1], [20], ethers.utils.parseEther("20"));
    await studio.connect(user).buyElementFromAuction(1, 20);

    const element1Price = await studio.getElementAuctionPrice(1);

    const userWethBalanceAfter = await mockWeth.balanceOf(user.address);

    const auctionRevenue = userWethBalanceBefore.sub(userWethBalanceAfter);

    expect(userWethBalanceBefore.sub(userWethBalanceAfter)).to.eq(
      element1Price.mul(20)
    );

    expect((await studio.markets(1)).ammERC20Balance).to.eq(
      element1Price.mul(10)
    );
    const expectedPlatformRevenue = auctionRevenue
      .sub((await studio.markets(1)).ammERC20Balance)
      .mul(await studio.auctionPlatformFeeNumerator())
      .div(await studio.FEE_DENOMINATOR());
    expect(expectedPlatformRevenue).to.eq(
      await studio.platformRevenues(mockWeth.address)
    );
    expect(
      auctionRevenue
        .sub((await studio.markets(1)).ammERC20Balance)
        .sub(expectedPlatformRevenue)
    ).to.eq(
      await studio.artistClaimableRevenues(artist.address, mockWeth.address)
    );
    expect((await studio.markets(1)).auctionERC20Balance).to.eq(0);
    expect((await studio.markets(1)).ammElementBalance).to.eq(10);
    expect((await studio.markets(1)).reserveElementBalance).to.eq(0);
    expect((await studio.markets(1)).auctionElementBalance).to.eq(0);
    expect(await element.balanceOf(studio.address, 1)).to.eq(10);
    expect(await element.balanceOf(user.address, 1)).to.eq(20);

    await studio
      .connect(user)
      .buyElements([1], [1], ethers.utils.parseEther("20"));

    expect((await studio.markets(1)).auctionERC20Balance).to.eq(0);
    expect((await studio.markets(1)).ammElementBalance).to.eq(9);
    expect((await studio.markets(1)).reserveElementBalance).to.eq(0);
    expect((await studio.markets(1)).auctionElementBalance).to.eq(0);
    expect(await element.balanceOf(studio.address, 1)).to.eq(9);
    expect(await element.balanceOf(user.address, 1)).to.eq(21);
  });

  it("Can handle many wraps and unwraps", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(120));

    let canvasTokenId = 1000000;

    await studio
      .connect(user)
      .buyElementsAndWrap(
        [1, 4],
        [1, 1],
        ethers.utils.parseEther("2"),
        1,
        [0, 0]
      );

    expect(await canvas.ownerOf(canvasTokenId)).to.eq(user.address);

    await canvas.connect(user).approve(studio.address, canvasTokenId);

    await studio.connect(user).unwrap(canvasTokenId);

    expect(await canvas.ownerOf(canvasTokenId)).to.eq(studio.address);

    for (let i = 0; i < 99; i++) {
      canvasTokenId++;
      console.log(canvasTokenId);
      await studio.connect(user).wrap(1, [0, 0]);
      expect(await canvas.ownerOf(canvasTokenId)).to.eq(user.address);
      await canvas.connect(user).approve(studio.address, canvasTokenId);
      await studio.connect(user).unwrap(canvasTokenId);
      expect(await canvas.ownerOf(canvasTokenId)).to.eq(studio.address);
    }

    await studio.connect(user).wrap(1, [0, 0]);
    expect(await canvas.ownerOf(1000099)).to.eq(user.address);
    await canvas.connect(user).approve(studio.address, 1000099);
    await studio.connect(user).unwrap(1000099);
    expect(await canvas.ownerOf(1000099)).to.eq(studio.address);

    await studio.connect(user).wrap(1, [0, 0]);
    expect(await canvas.ownerOf(1000099)).to.eq(user.address);
    await canvas.connect(user).approve(studio.address, 1000099);
    await studio.connect(user).unwrap(1000099);
    expect(await canvas.ownerOf(1000099)).to.eq(studio.address);

    await studio.connect(user).wrap(1, [0, 0]);
    expect(await canvas.ownerOf(1000099)).to.eq(user.address);

    await studio
      .connect(user)
      .buyElementsAndWrap(
        [1, 4],
        [1, 1],
        ethers.utils.parseEther("2"),
        1,
        [0, 0]
      );

    expect(await canvas.ownerOf(1000099)).to.eq(user.address);
    expect(await canvas.ownerOf(1000098)).to.eq(user.address);

    await studio
      .connect(user)
      .buyElementsAndWrap(
        [1, 4],
        [1, 1],
        ethers.utils.parseEther("2"),
        1,
        [0, 0]
      );

    expect(await canvas.ownerOf(1000099)).to.eq(user.address);
    expect(await canvas.ownerOf(1000098)).to.eq(user.address);
    expect(await canvas.ownerOf(1000097)).to.eq(user.address);
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
