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

  let deployer: SignerWithAddress;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  let currentTime;
  let auctionStartTime: number;
  let auctionEndTime: number;

  beforeEach(async function () {
    [deployer, owner, user] = await ethers.getSigners();

    studio = await new Studio__factory(deployer).deploy(
      "Intrinsic.art Disentanglement",
      "INSC",
      "https://artwork.intrinsic.art/",
      "testJSON",
      owner.address,
      owner.address
    );

    traits = await new Traits__factory(deployer).deploy(
      studio.address,
      "https://trait.intrinsic.art/",
      owner.address,
      owner.address,
      owner.address
    );

    await studio.connect(owner).setTraits(traits.address);

    await traits
      .connect(owner)
      .createTraitsAndTypes(
        ["Hair Color", "Eye Color"],
        ["hairColor", "eyeColor"],
        ["Blonde", "Brown", "Black", "Green", "Blue"],
        ["blonde", "brown", "black", "green", "blue"],
        [0, 0, 0, 1, 1],
        [
          ethers.utils.parseEther("10"),
          ethers.utils.parseEther("10"),
          ethers.utils.parseEther("10"),
          ethers.utils.parseEther("10"),
          ethers.utils.parseEther("10"),
        ]
      );

    await studio.connect(owner).updateScript(0, "Test Script 1");
    await studio.connect(owner).updateScript(1, "Test Script 2");

    await studio.connect(owner).lockProject();

    currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    auctionStartTime = currentTime + 110;
    auctionEndTime = currentTime + 210;

    await traits
      .connect(owner)
      .scheduleAuction(
        auctionStartTime,
        auctionEndTime,
        ethers.utils.parseEther("1"),
        ethers.utils.parseEther("0.1")
      );
  });

  it("Initializes contracts", async () => {
    expect(await studio.traits()).to.eq(traits.address);
    expect(await traits.studio()).to.eq(studio.address);
  });

  it("Created the Studio project", async () => {
    expect(await studio.artistAddress()).to.eq(owner.address);
    expect(await studio.baseURI()).to.eq("https://artwork.intrinsic.art/");
    expect(await studio.projectScriptCount()).to.eq(2);
    expect(await studio.projectScripts()).to.deep.eq([
      "Test Script 1",
      "Test Script 2",
    ]);

    expect(await traits.traits()).to.deep.eq([
      [
        BigNumber.from("0"),
        BigNumber.from("1"),
        BigNumber.from("2"),
        BigNumber.from("3"),
        BigNumber.from("4"),
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

    expect(await traits.traitTypes()).to.deep.eq([
      ["Hair Color", "Eye Color"],
      ["hairColor", "eyeColor"],
    ]);

    expect(await studio.locked()).to.eq(true);
  });

  it("Created the Traits", async () => {
    expect((await traits.trait(0))._traitName).to.eq("Blonde");
    expect((await traits.trait(0))._traitValue).to.eq("blonde");

    expect((await traits.trait(1))._traitName).to.eq("Brown");
    expect((await traits.trait(1))._traitValue).to.eq("brown");

    expect((await traits.trait(2))._traitName).to.eq("Black");
    expect((await traits.trait(2))._traitValue).to.eq("black");

    expect((await traits.trait(3))._traitName).to.eq("Green");
    expect((await traits.trait(3))._traitValue).to.eq("green");

    expect((await traits.trait(4))._traitName).to.eq("Blue");
    expect((await traits.trait(4))._traitValue).to.eq("blue");
  });

  it.only("A user can create artwork", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(120));

    expect(await ethers.provider.getBalance(studio.address)).to.eq(0);
    expect(await ethers.provider.getBalance(traits.address)).to.eq(0);

    const ethAmount = (await traits.traitPrice()).mul(2);

    await expect(studio.ownerOf(1)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    expect(await studio.userNonce(user.address)).to.eq(0);
    await expect(studio.artwork(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );

    await studio.connect(user).buyTraitsCreateArtwork([0, 3], [1, 1], [0, 3], {
      value: ethAmount,
    });

    expect(await ethers.provider.getBalance(studio.address)).to.eq(0);
    expect(await ethers.provider.getBalance(traits.address)).to.eq(ethAmount);

    expect(await studio.ownerOf(0)).to.eq(user.address);

    expect(await studio.artwork(0)).to.deep.eq([
      [BigNumber.from("0"), BigNumber.from("3")],
      ["Blonde", "Green"],
      ["blonde", "green"],
      ["Hair Color", "Eye Color"],
      ["hairColor", "eyeColor"],
      "0x1f9022ec10ae66f52f8498c2c7cb4b7a2024054b0c121c48b508e71689cdd886",
    ]);

    expect(await studio.userNonce(user.address)).to.eq(1);

    expect(await traits.balanceOf(user.address, 0)).to.eq(0);
    expect(await traits.balanceOf(user.address, 3)).to.eq(0);

    await studio.connect(user).decomposeArtwork(0);

    await expect(studio.artwork(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    expect(await traits.balanceOf(user.address, 0)).to.eq(1);
    expect(await traits.balanceOf(user.address, 3)).to.eq(1);
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
