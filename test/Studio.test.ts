import {
  Studio,
  Studio__factory,
  Traits,
  Traits__factory,
} from "../typechain-types";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import time from "./helpers/time";

describe("Studio", function () {
  let traits: Traits;
  let studio: Studio;

  // wallets
  let deployer: SignerWithAddress;
  let owner: SignerWithAddress;
  let admin: SignerWithAddress;
  let artist: SignerWithAddress;
  let user: SignerWithAddress;

  // vars
  let currentTime;
  let auctionStartTime: number;
  let auctionEndTime: number;

  beforeEach(async function () {
    // get signers
    [deployer, owner, admin, artist, user] = await ethers.getSigners();

    // Run deploy scripts
    // await deployments.fixture();

    // Get deployed contracts
    studio = await new Studio__factory(deployer).deploy();

    traits = await new Traits__factory(deployer).deploy();

    await studio.initialize(
      "Intrinsic.art Disentanglement",
      "INSC",
      traits.address,
      owner.address,
      [owner.address, admin.address]
    );

    await traits.initialize(studio.address, "testURI");

    await studio
      .connect(admin)
      .createProject("TestUri", artist.address, 100, "Test metadata");

    await studio
      .connect(admin)
      .createTraits(
        ["Hair Color", "Eye Color"],
        ["hairColor", "eyeColor"],
        ["Blonde", "Brown", "Black", "Green", "Blue"],
        ["blonde", "brown", "black", "green", "blue"],
        [0, 0, 0, 1, 1],
        [30, 30, 30, 50, 50]
      );

    await studio.connect(admin).updateScript(0, "Test Script 1");
    await studio.connect(admin).updateScript(1, "Test Script 2");

    await studio.connect(admin).lockProject();

    currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    auctionStartTime = currentTime + 110;
    auctionEndTime = currentTime + 210;

    await studio
      .connect(admin)
      .scheduleAuction(
        auctionStartTime,
        auctionEndTime,
        ethers.utils.parseEther("1"),
        ethers.utils.parseEther("0.1")
      );
  });

  it("Initializes Studio contract", async () => {
    expect(await studio.traits()).to.eq(traits.address);
  });

  it("Created the Studio project", async () => {
    expect(await studio.getProjectMetadata()).to.eq("Test metadata");
    expect(await studio.getProjectArtist()).to.eq(artist.address);
    expect(await studio.getProjectScriptCount()).to.eq(2);
    expect(await studio.getProjectScripts()).to.deep.eq([
      "Test Script 1",
      "Test Script 2",
    ]);

    expect(await studio.getTraits()).to.deep.eq([
      [
        BigNumber.from("1"),
        BigNumber.from("2"),
        BigNumber.from("3"),
        BigNumber.from("4"),
        BigNumber.from("5"),
      ],
      ["Blonde", "Brown", "Black", "Green", "Blue"],
      ["blonde", "brown", "black", "green", "blue"],
      [
        BigNumber.from("0"),
        BigNumber.from("0"),
        BigNumber.from("0"),
        BigNumber.from("1"),
        BigNumber.from("1"),
      ],
      ["Hair Color", "Hair Color", "Hair Color", "Eye Color", "Eye Color"],
      ["hairColor", "hairColor", "hairColor", "eyeColor", "eyeColor"],
    ]);

    expect(await studio.getProjectIsLocked()).to.eq(true);
  });

  it("Created the Traits", async () => {
    expect(await traits.getTraitName(1)).to.eq("Blonde");
    expect(await traits.getTraitValue(1)).to.eq("blonde");

    expect(await traits.getTraitName(2)).to.eq("Brown");
    expect(await traits.getTraitValue(2)).to.eq("brown");

    expect(await traits.getTraitName(3)).to.eq("Black");
    expect(await traits.getTraitValue(3)).to.eq("black");

    expect(await traits.getTraitName(4)).to.eq("Green");
    expect(await traits.getTraitValue(4)).to.eq("green");

    expect(await traits.getTraitName(5)).to.eq("Blue");
    expect(await traits.getTraitValue(5)).to.eq("blue");
  });

  it("A user can create artwork", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(120));

    const studioEthBalanceBefore = await ethers.provider.getBalance(
      studio.address
    );

    const ethAmount = (await studio.getTraitAuctionPrice()).mul(2);

    await expect(studio.ownerOf(1)).to.be.revertedWith(
      "ERC721: owner query for nonexistent token"
    );
    expect(await studio.userNonces(user.address)).to.eq(0);
    expect(await studio.getArtworkTraits(1)).to.deep.eq([[], [], []]);

    // uint256[] calldata _traitTokenIdsToBuy,
    // uint256[] calldata _traitQuantitiesToBuy,
    // uint256[] calldata _traitTokenIdsToCreateArtwork

    await studio.connect(user).buyTraitsCreateArtwork([1, 4], [1, 1], [1, 4], {
      value: ethAmount,
    });

    const studioEthBalanceAfter = await ethers.provider.getBalance(
      studio.address
    );

    expect(studioEthBalanceBefore.add(ethAmount)).to.eq(studioEthBalanceAfter);

    expect(await studio.ownerOf(1)).to.eq(user.address);

    expect(await studio.getArtworkTraits(1)).to.deep.eq([
      [BigNumber.from("1"), BigNumber.from("4")],
      ["Blonde", "Green"],
      ["blonde", "green"],
    ]);

    expect(await studio.userNonces(user.address)).to.eq(1);
    // Add test case for expected canvas hash
  });

  // it("Can handle many wraps and unwraps", async () => {
  //   // Move forward in time so auction is active
  //   await time.increase(time.duration.seconds(120));

  //   let canvasTokenId = 1000000;

  //   await studio
  //     .connect(user)
  //     .buyElementsAndWrap(
  //       [1, 4],
  //       [1, 1],
  //       ethers.utils.parseEther("2"),
  //       1,
  //       [0, 0]
  //     );

  //   expect(await canvas.ownerOf(canvasTokenId)).to.eq(user.address);

  //   await canvas.connect(user).approve(studio.address, canvasTokenId);

  //   await studio.connect(user).unwrap(canvasTokenId);

  //   expect(await canvas.ownerOf(canvasTokenId)).to.eq(studio.address);

  //   for (let i = 0; i < 99; i++) {
  //     canvasTokenId++;
  //     await studio.connect(user).wrap(1, [0, 0]);
  //     expect(await canvas.ownerOf(canvasTokenId)).to.eq(user.address);
  //     await canvas.connect(user).approve(studio.address, canvasTokenId);
  //     await studio.connect(user).unwrap(canvasTokenId);
  //     expect(await canvas.ownerOf(canvasTokenId)).to.eq(studio.address);
  //   }

  //   await studio.connect(user).wrap(1, [0, 0]);
  //   expect(await canvas.ownerOf(1000099)).to.eq(user.address);
  //   await canvas.connect(user).approve(studio.address, 1000099);
  //   await studio.connect(user).unwrap(1000099);
  //   expect(await canvas.ownerOf(1000099)).to.eq(studio.address);

  //   await studio.connect(user).wrap(1, [0, 0]);
  //   expect(await canvas.ownerOf(1000099)).to.eq(user.address);
  //   await canvas.connect(user).approve(studio.address, 1000099);
  //   await studio.connect(user).unwrap(1000099);
  //   expect(await canvas.ownerOf(1000099)).to.eq(studio.address);

  //   await studio.connect(user).wrap(1, [0, 0]);
  //   expect(await canvas.ownerOf(1000099)).to.eq(user.address);

  //   await studio
  //     .connect(user)
  //     .buyElementsAndWrap(
  //       [1, 4],
  //       [1, 1],
  //       ethers.utils.parseEther("2"),
  //       1,
  //       [0, 0]
  //     );

  //   expect(await canvas.ownerOf(1000099)).to.eq(user.address);
  //   expect(await canvas.ownerOf(1000098)).to.eq(user.address);

  //   await studio
  //     .connect(user)
  //     .buyElementsAndWrap(
  //       [1, 4],
  //       [1, 1],
  //       ethers.utils.parseEther("2"),
  //       1,
  //       [0, 0]
  //     );

  //   expect(await canvas.ownerOf(1000099)).to.eq(user.address);
  //   expect(await canvas.ownerOf(1000098)).to.eq(user.address);
  //   expect(await canvas.ownerOf(1000097)).to.eq(user.address);
  // });

  // it("Gets the project ID from the canvas ID", async () => {
  //   expect(await studio.getProjectIdFromCanvasId(1000000)).to.eq(1);
  //   expect(await studio.getProjectIdFromCanvasId(1000001)).to.eq(1);
  //   expect(await studio.getProjectIdFromCanvasId(1999999)).to.eq(1);

  //   expect(await studio.getProjectIdFromCanvasId(2000000)).to.eq(2);
  //   expect(await studio.getProjectIdFromCanvasId(2000001)).to.eq(2);
  //   expect(await studio.getProjectIdFromCanvasId(2999999)).to.eq(2);

  //   expect(await studio.getProjectIdFromCanvasId(3000000)).to.eq(3);
  //   expect(await studio.getProjectIdFromCanvasId(3000001)).to.eq(3);
  //   expect(await studio.getProjectIdFromCanvasId(3999999)).to.eq(3);
  // });
});
