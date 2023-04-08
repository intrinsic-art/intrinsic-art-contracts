import {
  Artwork,
  Artwork__factory,
  Traits,
  Traits__factory,
} from "../typechain-types";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import time from "./helpers/time";

describe("Artwork and Traits", function () {
  let traits: Traits;
  let artwork: Artwork;

  let deployer: SignerWithAddress;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  let currentTime;
  let auctionStartTime: number;
  let auctionEndTime: number;
  let auctionStartPrice: BigNumber;
  let auctionEndPrice: BigNumber;

  beforeEach(async function () {
    [deployer, owner, user] = await ethers.getSigners();

    artwork = await new Artwork__factory(deployer).deploy(
      "Intrinsic.art Disentanglement",
      "INSC",
      "https://artwork.intrinsic.art/",
      "testJSON",
      owner.address,
      owner.address
    );

    traits = await new Traits__factory(deployer).deploy(
      artwork.address,
      "https://trait.intrinsic.art/",
      owner.address,
      owner.address,
      owner.address
    );

    await artwork.connect(owner).setTraits(traits.address);

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

    await artwork.connect(owner).updateScript(0, "Test Script 1");
    await artwork.connect(owner).updateScript(1, "Test Script 2");

    await artwork.connect(owner).lockProject();

    currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    auctionStartTime = currentTime + 110;
    auctionEndTime = currentTime + 210;
    auctionStartPrice = ethers.utils.parseEther("1");
    auctionEndPrice = ethers.utils.parseEther("0.1");

    await traits
      .connect(owner)
      .scheduleAuction(
        auctionStartTime,
        auctionEndTime,
        auctionStartPrice,
        auctionEndPrice
      );
  });

  it("Initializes contracts", async () => {
    expect(await artwork.traits()).to.eq(traits.address);
    expect(await traits.artwork()).to.eq(artwork.address);
  });

  it("Created the Artwork project", async () => {
    expect(await artwork.artistAddress()).to.eq(owner.address);
    expect(await artwork.baseURI()).to.eq("https://artwork.intrinsic.art/");
    expect(await artwork.projectScriptCount()).to.eq(2);
    expect(await artwork.projectScripts()).to.deep.eq([
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

    expect(await artwork.locked()).to.eq(true);
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

  it("A user can create artwork and decompose it", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(120));

    expect(await ethers.provider.getBalance(artwork.address)).to.eq(0);
    expect(await ethers.provider.getBalance(traits.address)).to.eq(0);

    const ethAmount = (await traits.traitPrice()).mul(2);

    await expect(artwork.ownerOf(1)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    expect(await artwork.userNonce(user.address)).to.eq(0);
    await expect(artwork.artwork(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );

    await artwork.connect(user).buyTraitsCreateArtwork([0, 3], [1, 1], [0, 3], {
      value: ethAmount,
    });

    expect(await ethers.provider.getBalance(artwork.address)).to.eq(0);
    expect(await ethers.provider.getBalance(traits.address)).to.eq(ethAmount);

    expect(await artwork.ownerOf(0)).to.eq(user.address);

    expect(await artwork.artwork(0)).to.deep.eq([
      [BigNumber.from("0"), BigNumber.from("3")],
      ["Blonde", "Green"],
      ["blonde", "green"],
      ["Hair Color", "Eye Color"],
      ["hairColor", "eyeColor"],
      "0xa57c28cefdb44291321f44505cfad29df639071ba328a85cc9fd12c73a056bd8",
    ]);

    expect(await artwork.userNonce(user.address)).to.eq(1);

    expect(await traits.balanceOf(user.address, 0)).to.eq(0);
    expect(await traits.balanceOf(user.address, 3)).to.eq(0);

    await artwork.connect(user).decomposeArtwork(0);

    await expect(artwork.artwork(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    expect(await traits.balanceOf(user.address, 0)).to.eq(1);
    expect(await traits.balanceOf(user.address, 3)).to.eq(1);
  });

  it("A user can buy traits and create artwork in separate transactions", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(120));

    expect(await ethers.provider.getBalance(artwork.address)).to.eq(0);
    expect(await ethers.provider.getBalance(traits.address)).to.eq(0);

    const ethAmount = (await traits.traitPrice()).mul(4);

    await expect(artwork.ownerOf(1)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    expect(await artwork.userNonce(user.address)).to.eq(0);
    await expect(artwork.artwork(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );

    expect(await traits.balanceOf(user.address, 0)).to.eq(0);
    expect(await traits.balanceOf(user.address, 1)).to.eq(0);
    expect(await traits.balanceOf(user.address, 2)).to.eq(0);
    expect(await traits.balanceOf(user.address, 3)).to.eq(0);
    expect(await traits.balanceOf(user.address, 4)).to.eq(0);

    await traits.connect(user).buyTraits(user.address, [1, 4], [2, 2], {
      value: ethAmount,
    });

    expect(await traits.balanceOf(user.address, 0)).to.eq(0);
    expect(await traits.balanceOf(user.address, 1)).to.eq(2);
    expect(await traits.balanceOf(user.address, 2)).to.eq(0);
    expect(await traits.balanceOf(user.address, 3)).to.eq(0);
    expect(await traits.balanceOf(user.address, 4)).to.eq(2);

    await artwork.connect(user).createArtwork([1, 4]);

    expect(await traits.balanceOf(user.address, 0)).to.eq(0);
    expect(await traits.balanceOf(user.address, 1)).to.eq(1);
    expect(await traits.balanceOf(user.address, 2)).to.eq(0);
    expect(await traits.balanceOf(user.address, 3)).to.eq(0);
    expect(await traits.balanceOf(user.address, 4)).to.eq(1);

    expect(await ethers.provider.getBalance(artwork.address)).to.eq(0);
    expect(await ethers.provider.getBalance(traits.address)).to.eq(ethAmount);

    expect(await artwork.ownerOf(0)).to.eq(user.address);

    expect(await artwork.artwork(0)).to.deep.eq([
      [BigNumber.from("1"), BigNumber.from("4")],
      ["Brown", "Blue"],
      ["brown", "blue"],
      ["Hair Color", "Eye Color"],
      ["hairColor", "eyeColor"],
      "0x84e74d12c087f7c7f01aeb4fca32ebb6fe2d4d1abe6653a6bca5ba987652e1e4",
    ]);

    expect(await artwork.userNonce(user.address)).to.eq(1);

    expect(await traits.balanceOf(user.address, 0)).to.eq(0);
    expect(await traits.balanceOf(user.address, 3)).to.eq(0);

    await artwork.connect(user).decomposeArtwork(0);

    await expect(artwork.artwork(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    expect(await traits.balanceOf(user.address, 0)).to.eq(0);
    expect(await traits.balanceOf(user.address, 1)).to.eq(2);
    expect(await traits.balanceOf(user.address, 2)).to.eq(0);
    expect(await traits.balanceOf(user.address, 3)).to.eq(0);
    expect(await traits.balanceOf(user.address, 4)).to.eq(2);
  });

  it("Trait prices during the auction update correctly", async () => {
    // Auction time is 100 seconds

    await time.increaseTo(auctionStartTime - 1);

    await expect(traits.traitPrice()).to.be.revertedWith("AuctionNotLive()");

    await time.increaseTo(auctionStartTime);

    expect(await traits.traitPrice()).to.eq(auctionStartPrice);

    // Increase time to halfway through auction
    await time.increase(time.duration.seconds(50));

    expect(await traits.traitPrice()).to.eq(
      auctionStartPrice.add(auctionEndPrice).div(2)
    );

    // Increase time to end of auction
    await time.increase(time.duration.seconds(50));

    expect(await traits.traitPrice()).to.eq(auctionEndPrice);
  });

  it("Trait total supply and max supply update correctly", async () => {
    // Trait max revenues is 10 ETH
    // Start Price is 1 ETH
    // End Price is 0.1 ETH

    const maxRevenue = ethers.utils.parseEther("10");

    // Go to start of auction period
    await time.increaseTo(auctionStartTime);

    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("1"));

    // User has 0 of trait 0
    expect(await traits.balanceOf(user.address, 0)).to.eq(0);

    // Trait 0 has 0 ETH of total revenue
    expect(await traits.traitTotalRevenue(0)).to.eq(0);

    // Max supply should be (10 / 0.1) + 1 = 101
    expect(await traits.maxSupply(0)).to.eq(101);

    // Buy x1 of trait 0 with 1 ETH
    await traits.connect(user).buyTraits(user.address, [0], [1], {
      value: ethers.utils.parseEther("1"),
    });

    const ethSpent1 = await traits.traitPrice();

    // User has 1 of trait 0
    expect(await traits.balanceOf(user.address, 0)).to.eq(1);

    // Trait 0 has 1 ETH of total revenue
    expect(await traits.traitTotalRevenue(0)).to.eq(ethSpent1);

    // Max supply = ( 9 / 0.1 ) + 2 = 92
    expect(await traits.maxSupply(0)).to.eq(
      maxRevenue.sub(ethSpent1).div(auctionEndPrice).add(2)
    );

    // Increase time to end of auction
    await time.increaseTo(auctionEndTime + 1);

    await expect(
      traits.connect(user).buyTraits(user.address, [0], [92], {
        value: ethers.utils.parseEther("9.2"),
      })
    ).to.be.revertedWith("SoldOut()");

    expect(await traits.maxSupply(0)).to.eq(BigNumber.from("92"));

    await traits.connect(user).buyTraits(user.address, [0], [91], {
      value: ethers.utils.parseEther("9.1"),
    });

    // User has 92 of trait 0
    expect(await traits.balanceOf(user.address, 0)).to.eq(92);

    expect(await traits.traitTotalRevenue(0)).to.eq(
      ethSpent1.add(ethers.utils.parseEther("9.1"))
    );

    expect(await traits.maxSupply(0)).to.eq(92);

    await expect(
      traits.connect(user).buyTraits(user.address, [0], [1], {
        value: ethers.utils.parseEther("0.1"),
      })
    ).to.be.revertedWith("SoldOut()");
  });
});
