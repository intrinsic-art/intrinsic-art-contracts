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

describe("Element", function () {
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
    await amm.initialize(
      mockWeth.address,
      Config.AMM.totalFeeNumerator,
      Config.AMM.artistFeeNumerator
    );

    await mockWeth.mint(user.address, ethers.utils.parseEther("100"));
    mockWeth
      .connect(user)
      .approve(dutchAuction.address, ethers.utils.parseEther("100"));
    mockWeth.connect(user).approve(amm.address, ethers.utils.parseEther("100"));
  });

  it("Init Element", async () => {
    expect(await element.amm()).to.eq(amm.address);
  });
  it("Should have created elements", async () => {
    await addProject();
    expect(await element.tokenIdToFeature("1")).to.eq("features");
  });
  it("Should mint elements", async () => {
    await addProject();
    await network.provider.send("evm_increaseTime", [101]);
    await network.provider.send("evm_mine");
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
    expect(await element.balanceOf(user.address, 1)).to.eq("1");
  });
  it("Should Revert minting elements", async () => {
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
    await expect(element.mint(user.address, 1, 1)).to.be.revertedWith(
      "You are not the AMM contract"
    );
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
  it("Should burn/sell elements", async () => {
    await addProject();
    await network.provider.send("evm_increaseTime", [101]);
    await network.provider.send("evm_mine");
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
    expect(await element.balanceOf(user.address, 1)).to.eq("1");
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
    ).to.emit(element, "TransferSingle");
    expect(await element.balanceOf(user.address, 1)).to.eq("0");
  });
  it("Should Revert burning elements", async () => {
    await addProject();
    await network.provider.send("evm_increaseTime", [101]);
    await network.provider.send("evm_mine");
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
    await expect(element.burn(user.address, 1, 1)).to.be.revertedWith(
      "ERC1155: caller is not owner nor approved"
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
});
