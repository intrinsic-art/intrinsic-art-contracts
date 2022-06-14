import {
  Canvas,
  ColoringBook,
  DutchAuction,
  Element,
  MockWeth,
  MockWeth__factory,
} from "../typechain-types";
import { expect } from "chai";
import { ethers, deployments } from "hardhat";

describe("Canvas", function () {
  let coloringBook: ColoringBook;
  let canvas: Canvas;
  let element: Element;
  let dutchAuction: DutchAuction;
  let mockWeth: MockWeth;

  // wallets
  let deployer;

  beforeEach(async function () {
    // Run deploy scripts
    [deployer] = await ethers.getSigners();
    await deployments.fixture();

    // Get deployed MockNFT contract
    coloringBook = await ethers.getContract("ColoringBook");
    canvas = await ethers.getContract("Canvas");
    element = await ethers.getContract("Element");
    dutchAuction = await ethers.getContract("DutchAuction");
    mockWeth = await new MockWeth__factory(deployer).deploy();

    await canvas.initialize(
      element.address,
      dutchAuction.address,
      coloringBook.address
    );
  });

  it("Init Canvas", async () => {
    expect(await canvas.element()).to.eq(element.address);
    expect(await canvas.coloringBook()).to.eq(coloringBook.address);
    expect(await canvas.dutchAuction()).to.eq(dutchAuction.address);
  });
});
