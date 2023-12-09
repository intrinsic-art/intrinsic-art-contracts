import {
  Artwork,
  Artwork__factory,
  Traits,
  Traits__factory,
  PaymentSplitter,
  ProjectRegistry,
  ProjectRegistry__factory,
  MockStringStorage,
  MockStringStorage__factory,
} from "../typechain-types";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import time from "./helpers/time";
import { artworkHash } from "./helpers/utilities";

describe("Artwork and Traits", function () {
  let projectRegistry: ProjectRegistry;
  let stringStorage: MockStringStorage;
  let artwork: Artwork;
  let traits: Traits;
  let royaltySplitter: PaymentSplitter;

  let deployer: SignerWithAddress;
  let artist: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let whitelistedUser1: SignerWithAddress;
  let whitelistedUser2: SignerWithAddress;
  let artistRevenueClaimer: SignerWithAddress;
  let platformRevenueClaimer: SignerWithAddress;
  let projectRegistryOwner: SignerWithAddress;
  let projectRegistryAdmin: SignerWithAddress;

  let currentTime;
  let auctionStartTime: number;
  let auctionEndTime: number;
  let auctionStartPrice: BigNumber;
  let auctionEndPrice: BigNumber;
  let auctionPriceSteps: number;
  let traitsSaleStartTime: number;
  let whitelistStartTime: number;
  let auctionDuration: number;

  const abiCoder = ethers.utils.defaultAbiCoder;

  beforeEach(async function () {
    [
      deployer,
      artist,
      whitelistedUser1,
      whitelistedUser2,
      user1,
      user2,
      artistRevenueClaimer,
      platformRevenueClaimer,
      projectRegistryOwner,
      projectRegistryAdmin,
    ] = await ethers.getSigners();

    projectRegistry = await new ProjectRegistry__factory(deployer).deploy(
      projectRegistryOwner.address,
      [projectRegistryAdmin.address],
      "https://intrinsic.art/"
    );

    stringStorage = await new MockStringStorage__factory(deployer).deploy();

    // "https://artwork.intrinsic.art/",

    artwork = await new Artwork__factory(deployer).deploy(
      "Intrinsic.art Disentanglement",
      "INSC",
      artist.address,
      projectRegistry.address,
      1000,
      [artistRevenueClaimer.address, platformRevenueClaimer.address],
      [90, 10],
      { stringStorageSlot: 0, stringStorageAddress: stringStorage.address },
      { stringStorageSlot: 1, stringStorageAddress: stringStorage.address }
    );

    traits = await new Traits__factory(deployer).deploy(
      "Intrinsic.art Traits",
      "INSC",
      projectRegistry.address,
      {
        traitTypeNames: ["Hair Color", "Eye Color"],
        traitTypeValues: ["hairColor", "eyeColor"],
        traitNames: ["Blonde", "Brown", "Black", "Green", "Blue"],
        traitValues: ["blonde", "brown", "black", "green", "blue"],
        traitTypeIndexes: [0, 0, 0, 1, 1],
        traitMaxSupplys: [10, 20, 30, 40, 50],
      },
      [artistRevenueClaimer.address, platformRevenueClaimer.address],
      [90, 10],
      [whitelistedUser1.address, whitelistedUser2.address],
      [1, 1]
    );

    royaltySplitter = await ethers.getContractAt(
      "PaymentSplitter",
      (
        await artwork.royaltyInfo(0, 1000)
      )[0]
    );

    auctionDuration = 100;
    currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    auctionStartTime = currentTime + 110;
    auctionEndTime = auctionStartTime + auctionDuration;
    auctionStartPrice = ethers.utils.parseEther("1");
    auctionEndPrice = ethers.utils.parseEther("0.1");
    auctionPriceSteps = 4;
    traitsSaleStartTime = currentTime + 300;
    whitelistStartTime = currentTime + 110;

    const encodedArtworkData = abiCoder.encode(["address"], [traits.address]);
    const encodedTraitsData = abiCoder.encode(
      [
        "address",
        "bool",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
      ],
      [
        artwork.address,
        false,
        auctionStartTime,
        auctionEndTime,
        auctionStartPrice,
        auctionEndPrice,
        auctionPriceSteps,
        traitsSaleStartTime,
        whitelistStartTime,
      ]
    );

    await projectRegistry
      .connect(projectRegistryAdmin)
      .registerProject(
        artwork.address,
        encodedArtworkData,
        traits.address,
        encodedTraitsData
      );
  });

  it("Initializes the Artwork contract", async () => {
    expect(await artwork.traits()).to.eq(traits.address);
    expect(await artwork.name()).to.eq("Intrinsic.art Disentanglement");
    expect(await artwork.symbol()).to.eq("INSC");
    expect(await artwork.script()).to.deep.eq("Test Script");
    expect(await artwork.metadataJSON()).to.eq("Test JSON");
    expect(await artwork.projectRegistry()).to.eq(projectRegistry.address);
    expect(await artwork.royaltyInfo(0, 1000)).to.deep.eq([
      royaltySplitter.address,
      BigNumber.from(100),
    ]);
    expect(await artwork.royaltyInfo(5, 3000)).to.deep.eq([
      royaltySplitter.address,
      BigNumber.from(300),
    ]);
    expect(await artwork.nextTokenId()).to.eq(0);
    expect(await artwork.VERSION()).to.eq("1.0");
    expect(await artwork.supportsInterface("0x80ac58cd")).to.eq(true);
    expect(await artwork.tokenURI(0)).to.eq(
      `https://intrinsic.art/${artwork.address.toLowerCase()}/0`
    );
  });

  it("Initializes the Traits contract", async () => {
    expect(await traits.artwork()).to.eq(artwork.address);
    expect(await traits.VERSION()).to.eq("1.0.0");
    expect(await traits.auctionStartTime()).to.eq(auctionStartTime);
    expect(await traits.auctionEndTime()).to.eq(auctionEndTime);
    expect(await traits.auctionStartPrice()).to.eq(auctionStartPrice);
    expect(await traits.auctionEndPrice()).to.eq(auctionEndPrice);
    expect(await traits.uri(0)).to.eq(
      `https://intrinsic.art/${traits.address.toLowerCase()}/0`
    );

    expect(await traits.supportsInterface("0xd9b67a26")).to.eq(true);

    expect(await traits.royaltyInfo(0, 1000)).to.deep.eq([
      royaltySplitter.address,
      BigNumber.from(100),
    ]);

    expect(await traits.royaltyInfo(5, 3000)).to.deep.eq([
      royaltySplitter.address,
      BigNumber.from(300),
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
      [
        BigNumber.from(0),
        BigNumber.from(0),
        BigNumber.from(0),
        BigNumber.from(0),
        BigNumber.from(0),
      ],
      [
        BigNumber.from(10),
        BigNumber.from(20),
        BigNumber.from(30),
        BigNumber.from(40),
        BigNumber.from(50),
      ],
    ]);

    expect(await traits.traitTypes()).to.deep.eq([
      ["Hair Color", "Eye Color"],
      ["hairColor", "eyeColor"],
    ]);

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

  it("Initializes the Royalty Splitter contracts", async () => {
    expect(await royaltySplitter.totalShares()).to.eq(100);
    expect(await royaltySplitter.shares(artistRevenueClaimer.address)).to.eq(
      90
    );
    expect(await royaltySplitter.shares(platformRevenueClaimer.address)).to.eq(
      10
    );
    expect(await royaltySplitter.payee(0)).to.eq(artistRevenueClaimer.address);
    expect(await royaltySplitter.payee(1)).to.eq(
      platformRevenueClaimer.address
    );
  });

  it("Artist and whitelisted users can mint for free", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(120));

    await expect(artwork.ownerOf(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    expect(await artwork.userNonce(artist.address)).to.eq(0);
    await expect(artwork.artwork(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );

    await artwork.connect(artist).mintArtworkProof([0, 3], 100);

    expect(await artwork.ownerOf(0)).to.eq(artist.address);

    expect(await artwork.artwork(0)).to.deep.eq([
      [BigNumber.from("0"), BigNumber.from("3")],
      ["Blonde", "Green"],
      ["blonde", "green"],
      ["Hair Color", "Eye Color"],
      ["hairColor", "eyeColor"],
      artworkHash(artwork.address, artist.address, 0, 100),
    ]);

    expect(await artwork.userNonce(artist.address)).to.eq(1);

    expect(await traits.balanceOf(artist.address, 0)).to.eq(0);
    expect(await traits.balanceOf(artist.address, 3)).to.eq(0);

    await artwork.connect(artist).reclaimTraits(0);

    await expect(artwork.artwork(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );

    expect(await traits.balanceOf(artist.address, 0)).to.eq(1);
    expect(await traits.balanceOf(artist.address, 3)).to.eq(1);

    await artwork.connect(whitelistedUser1).mintArtworkWhitelist([1, 4], 200);
    await artwork.connect(whitelistedUser2).mintArtworkWhitelist([2, 4], 300);

    expect(await artwork.ownerOf(1)).to.eq(whitelistedUser1.address);
    expect(await artwork.ownerOf(2)).to.eq(whitelistedUser2.address);

    expect(await artwork.artwork(1)).to.deep.eq([
      [BigNumber.from("1"), BigNumber.from("4")],
      ["Brown", "Blue"],
      ["brown", "blue"],
      ["Hair Color", "Eye Color"],
      ["hairColor", "eyeColor"],
      artworkHash(artwork.address, whitelistedUser1.address, 0, 200),
    ]);

    expect(await artwork.artwork(2)).to.deep.eq([
      [BigNumber.from("2"), BigNumber.from("4")],
      ["Black", "Blue"],
      ["black", "blue"],
      ["Hair Color", "Eye Color"],
      ["hairColor", "eyeColor"],
      artworkHash(artwork.address, whitelistedUser2.address, 0, 300),
    ]);
  });

  it("A user can create artwork and reclaim traits from it", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(120));

    expect(await ethers.provider.getBalance(artwork.address)).to.eq(0);
    expect(await ethers.provider.getBalance(traits.address)).to.eq(0);

    const ethAmount = (await traits.traitPrice()).mul(2);

    await expect(artwork.ownerOf(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    expect(await artwork.userNonce(user1.address)).to.eq(0);
    await expect(artwork.artwork(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );

    await artwork
      .connect(user1)
      .mintTraitsAndArtwork([0, 3], [1, 1], [0, 3], 100, {
        value: ethAmount,
      });

    expect(await ethers.provider.getBalance(artwork.address)).to.eq(0);
    expect(await ethers.provider.getBalance(traits.address)).to.eq(ethAmount);

    expect(await artwork.ownerOf(0)).to.eq(user1.address);

    expect(await artwork.artwork(0)).to.deep.eq([
      [BigNumber.from("0"), BigNumber.from("3")],
      ["Blonde", "Green"],
      ["blonde", "green"],
      ["Hair Color", "Eye Color"],
      ["hairColor", "eyeColor"],
      artworkHash(artwork.address, user1.address, 0, 100),
    ]);

    expect(await artwork.userNonce(user1.address)).to.eq(1);

    expect(await traits.balanceOf(user1.address, 0)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 3)).to.eq(0);

    await artwork.connect(user1).reclaimTraits(0);

    await expect(artwork.artwork(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );

    await expect(artwork.artwork(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    expect(await traits.balanceOf(user1.address, 0)).to.eq(1);
    expect(await traits.balanceOf(user1.address, 3)).to.eq(1);
  });

  it("Correctly handles token URIs", async () => {
    expect(await artwork.tokenURI(0)).to.eq(
      `https://intrinsic.art/${artwork.address.toLowerCase()}/0`
    );

    expect(await artwork.tokenURI(1)).to.eq(
      `https://intrinsic.art/${artwork.address.toLowerCase()}/1`
    );

    expect(await traits.uri(0)).to.eq(
      `https://intrinsic.art/${traits.address.toLowerCase()}/0`
    );

    expect(await traits.uri(4)).to.eq(
      `https://intrinsic.art/${traits.address.toLowerCase()}/4`
    );
  });

  it("Artwork token IDs increment even if previous ones are have been reclaimed", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(120));

    const ethAmount = (await traits.traitPrice()).mul(2);

    expect(await artwork.nextTokenId()).to.eq(0);
    await expect(artwork.ownerOf(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    await expect(artwork.artwork(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );

    // Create artwork 0
    await artwork
      .connect(user1)
      .mintTraitsAndArtwork([0, 3], [1, 1], [0, 3], 100, {
        value: ethAmount,
      });

    expect(await artwork.nextTokenId()).to.eq(1);
    expect(await artwork.ownerOf(0)).to.eq(user1.address);
    expect(await artwork.artwork(0)).to.deep.eq([
      [BigNumber.from("0"), BigNumber.from("3")],
      ["Blonde", "Green"],
      ["blonde", "green"],
      ["Hair Color", "Eye Color"],
      ["hairColor", "eyeColor"],
      artworkHash(artwork.address, user1.address, 0, 100),
    ]);

    await artwork.connect(user1).reclaimTraits(0);

    await expect(artwork.ownerOf(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    await expect(artwork.artwork(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );

    await expect(artwork.ownerOf(1)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    await expect(artwork.artwork(1)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );

    // Mint artwork 1
    await artwork.connect(user1).mintArtwork([0, 3], 100);

    expect(await artwork.nextTokenId()).to.eq(2);
    await expect(artwork.ownerOf(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    await expect(artwork.artwork(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    expect(await artwork.ownerOf(1)).to.eq(user1.address);
    expect(await artwork.artwork(1)).to.deep.eq([
      [BigNumber.from("0"), BigNumber.from("3")],
      ["Blonde", "Green"],
      ["blonde", "green"],
      ["Hair Color", "Eye Color"],
      ["hairColor", "eyeColor"],
      artworkHash(artwork.address, user1.address, 1, 100),
    ]);

    await artwork.connect(user1).reclaimTraits(1);

    // Create artwork 2
    await artwork
      .connect(user1)
      .mintTraitsAndArtwork([1, 4], [1, 1], [1, 4], 100, {
        value: ethAmount,
      });

    expect(await artwork.nextTokenId()).to.eq(3);
    await expect(artwork.ownerOf(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    await expect(artwork.artwork(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    await expect(artwork.ownerOf(1)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    await expect(artwork.artwork(1)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    expect(await artwork.ownerOf(2)).to.eq(user1.address);
    expect(await artwork.artwork(2)).to.deep.eq([
      [BigNumber.from("1"), BigNumber.from("4")],
      ["Brown", "Blue"],
      ["brown", "blue"],
      ["Hair Color", "Eye Color"],
      ["hairColor", "eyeColor"],
      artworkHash(artwork.address, user1.address, 2, 100),
    ]);
  });

  it("A user can buy traits and create artwork in separate transactions", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(300));

    expect(await ethers.provider.getBalance(artwork.address)).to.eq(0);
    expect(await ethers.provider.getBalance(traits.address)).to.eq(0);

    const ethAmount = (await traits.traitPrice()).mul(4);

    await expect(artwork.ownerOf(1)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    expect(await artwork.userNonce(user1.address)).to.eq(0);
    await expect(artwork.artwork(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );

    expect(await traits.balanceOf(user1.address, 0)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 1)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 2)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 3)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 4)).to.eq(0);

    await traits.connect(user1).mintTraits(user1.address, [1, 4], [2, 2], {
      value: ethAmount,
    });

    expect(await traits.balanceOf(user1.address, 0)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 1)).to.eq(2);
    expect(await traits.balanceOf(user1.address, 2)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 3)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 4)).to.eq(2);

    await artwork.connect(user1).mintArtwork([1, 4], 100);

    expect(await traits.balanceOf(user1.address, 0)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 1)).to.eq(1);
    expect(await traits.balanceOf(user1.address, 2)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 3)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 4)).to.eq(1);

    expect(await ethers.provider.getBalance(artwork.address)).to.eq(0);
    expect(await ethers.provider.getBalance(traits.address)).to.eq(ethAmount);

    expect(await artwork.ownerOf(0)).to.eq(user1.address);

    expect(await artwork.artwork(0)).to.deep.eq([
      [BigNumber.from("1"), BigNumber.from("4")],
      ["Brown", "Blue"],
      ["brown", "blue"],
      ["Hair Color", "Eye Color"],
      ["hairColor", "eyeColor"],
      artworkHash(artwork.address, user1.address, 0, 100),
    ]);

    expect(await artwork.userNonce(user1.address)).to.eq(1);

    expect(await traits.balanceOf(user1.address, 0)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 3)).to.eq(0);

    await artwork.connect(user1).reclaimTraits(0);

    await expect(artwork.artwork(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    expect(await traits.balanceOf(user1.address, 0)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 1)).to.eq(2);
    expect(await traits.balanceOf(user1.address, 2)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 3)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 4)).to.eq(2);
  });

  it("Trait prices update correctly during a linear auction", async () => {
    // Auction duration is 100 seconds
    // Four price steps, each step lasts 25 seconds
    // Auction start price = 1 ETH
    // Auction end price = 0.1 ETH
    // Price steps should be: 1 ETH, 0.7 ETH, 0.4 ETH, 0.1 ETH
    const priceStepDuration = auctionDuration / auctionPriceSteps;

    await time.increaseTo(auctionStartTime - 1);

    await expect(traits.traitPriceStep()).to.be.revertedWith(
      "AuctionNotLive()"
    );
    await expect(traits.traitPrice()).to.be.revertedWith("AuctionNotLive()");

    await time.increaseTo(auctionStartTime);

    expect(await traits.traitPriceStep()).to.eq(0);
    expect(await traits.traitPrice()).to.eq(auctionStartPrice);

    // Increase time to second after first price step
    await time.increaseTo(auctionStartTime + 1);

    expect(await traits.traitPriceStep()).to.eq(0);
    expect(await traits.traitPrice()).to.eq(auctionStartPrice);

    // Increase time to right before next price step
    await time.increaseTo(auctionStartTime + priceStepDuration - 1);

    expect(await traits.traitPriceStep()).to.eq(0);
    expect(await traits.traitPrice()).to.eq(auctionStartPrice);

    // Increase time to next price step
    await time.increaseTo(auctionStartTime + priceStepDuration);

    expect(await traits.traitPriceStep()).to.eq(1);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.7"));

    // Increase time to second after this price step
    await time.increaseTo(auctionStartTime + priceStepDuration + 1);

    expect(await traits.traitPriceStep()).to.eq(1);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.7"));

    // Increase time to second before next price step
    await time.increaseTo(auctionStartTime + 2 * priceStepDuration - 1);

    expect(await traits.traitPriceStep()).to.eq(1);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.7"));

    // Increase time to next price step
    await time.increaseTo(auctionStartTime + 2 * priceStepDuration);

    expect(await traits.traitPriceStep()).to.eq(2);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.4"));

    // Increase time to second after this price step
    await time.increaseTo(auctionStartTime + 2 * priceStepDuration + 1);

    expect(await traits.traitPriceStep()).to.eq(2);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.4"));

    // Increase time to second before next price step
    await time.increaseTo(auctionStartTime + 3 * priceStepDuration - 1);

    expect(await traits.traitPriceStep()).to.eq(2);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.4"));

    // Increase time to next price step
    await time.increaseTo(auctionStartTime + 3 * priceStepDuration);

    expect(await traits.traitPriceStep()).to.eq(3);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.1"));

    // Increase time to next second after this price step
    await time.increaseTo(auctionStartTime + 3 * priceStepDuration + 1);

    expect(await traits.traitPriceStep()).to.eq(3);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.1"));

    // Increase time to end of auction
    await time.increaseTo(auctionEndTime - 1);

    expect(await traits.traitPriceStep()).to.eq(3);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.1"));

    await time.increaseTo(auctionEndTime);

    expect(await traits.traitPriceStep()).to.eq(3);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.1"));

    await time.increaseTo(auctionEndTime + 1);

    expect(await traits.traitPriceStep()).to.eq(3);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.1"));

    await time.increaseTo(auctionEndTime + 100);

    expect(await traits.traitPriceStep()).to.eq(3);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.1"));
  });

  it("Trait prices update correctly during an exponential auction", async () => {
    // Auction duration is 100 seconds
    // Four price steps, each step lasts 25 seconds
    // Auction start price = 1 ETH
    // Auction end price = 0.1 ETH
    // Price steps should be: 1 ETH, 0.7 ETH, 0.4 ETH, 0.1 ETH
    const priceStepDuration = auctionDuration / auctionPriceSteps;

    const updateAuctionData = (
      await ethers.getContractFactory("Traits", deployer)
    ).interface.encodeFunctionData("updateAuction", [
      auctionStartTime,
      auctionEndTime,
      auctionStartPrice,
      auctionEndPrice,
      auctionPriceSteps,
      true,
      traitsSaleStartTime,
      whitelistStartTime,
    ]);

    // Update the auction through the registry to make it exponential
    await projectRegistry
      .connect(projectRegistryAdmin)
      .execute([traits.address], [0], [updateAuctionData]);

    await expect(traits.traitPriceStep()).to.be.revertedWith(
      "AuctionNotLive()"
    );
    await expect(traits.traitPrice()).to.be.revertedWith("AuctionNotLive()");

    await time.increaseTo(auctionStartTime);

    expect(await traits.traitPriceStep()).to.eq(0);
    expect(await traits.traitPrice()).to.eq(auctionStartPrice);

    // Increase time to second after first price step
    await time.increaseTo(auctionStartTime + 1);

    expect(await traits.traitPriceStep()).to.eq(0);
    expect(await traits.traitPrice()).to.eq(auctionStartPrice);

    // Increase time to right before next price step
    await time.increaseTo(auctionStartTime + priceStepDuration - 1);

    expect(await traits.traitPriceStep()).to.eq(0);
    expect(await traits.traitPrice()).to.eq(auctionStartPrice);

    // Increase time to next price step
    await time.increaseTo(auctionStartTime + priceStepDuration);

    expect(await traits.traitPriceStep()).to.eq(1);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.5"));

    // Increase time to second after this price step
    await time.increaseTo(auctionStartTime + priceStepDuration + 1);

    expect(await traits.traitPriceStep()).to.eq(1);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.5"));

    // Increase time to second before next price step
    await time.increaseTo(auctionStartTime + 2 * priceStepDuration - 1);

    expect(await traits.traitPriceStep()).to.eq(1);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.5"));

    // Increase time to next price step
    await time.increaseTo(auctionStartTime + 2 * priceStepDuration);

    expect(await traits.traitPriceStep()).to.eq(2);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.2"));

    // Increase time to second after this price step
    await time.increaseTo(auctionStartTime + 2 * priceStepDuration + 1);

    expect(await traits.traitPriceStep()).to.eq(2);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.2"));

    // Increase time to second before next price step
    await time.increaseTo(auctionStartTime + 3 * priceStepDuration - 1);

    expect(await traits.traitPriceStep()).to.eq(2);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.2"));

    // Increase time to next price step
    await time.increaseTo(auctionStartTime + 3 * priceStepDuration);

    expect(await traits.traitPriceStep()).to.eq(3);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.1"));

    // Increase time to next second after this price step
    await time.increaseTo(auctionStartTime + 3 * priceStepDuration + 1);

    expect(await traits.traitPriceStep()).to.eq(3);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.1"));

    // Increase time to end of auction
    await time.increaseTo(auctionEndTime - 1);

    expect(await traits.traitPriceStep()).to.eq(3);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.1"));

    await time.increaseTo(auctionEndTime);

    expect(await traits.traitPriceStep()).to.eq(3);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.1"));

    await time.increaseTo(auctionEndTime + 1);

    expect(await traits.traitPriceStep()).to.eq(3);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.1"));

    await time.increaseTo(auctionEndTime + 100);

    expect(await traits.traitPriceStep()).to.eq(3);
    expect(await traits.traitPrice()).to.eq(ethers.utils.parseEther("0.1"));
  });

  it("Users cannot create artwork with traits they don't own", async () => {
    // Go to start of auction period
    await time.increaseTo(auctionStartTime);

    await expect(
      artwork.connect(user1).mintArtwork([0, 3], 100)
    ).to.be.revertedWith("ERC1155: insufficient balance for transfer");
  });

  it("Users cannot create artwork with traits that are sold out", async () => {
    // Go to start of auction period
    await time.increaseTo(traitsSaleStartTime);

    // Buy x10 of trait 0 with 10 ETH, trait is sold out now
    await traits.connect(user1).mintTraits(user1.address, [0], [10], {
      value: ethers.utils.parseEther("10"),
    });

    await traits.connect(user2).mintTraits(user1.address, [3], [1], {
      value: ethers.utils.parseEther("10"),
    });

    const ethAmount = await traits.traitPrice();

    await expect(
      artwork.connect(user2).mintTraitsAndArtwork([0], [1], [0, 3], 100, {
        value: ethAmount,
      })
    ).to.be.revertedWith("MaxSupply()");
  });

  it("Users can't reclaim traits from artwork they don't own", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(120));

    const ethAmount = (await traits.traitPrice()).mul(2);

    // User 1 creates artwork 0
    await artwork
      .connect(user1)
      .mintTraitsAndArtwork([0, 3], [1, 1], [0, 3], 100, {
        value: ethAmount,
      });

    await expect(artwork.connect(user2).reclaimTraits(0)).to.be.revertedWith(
      "OnlyArtworkOwner()"
    );
  });

  it("Users can't create artwork that doesn't have a trait from each type", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(120));

    const ethAmount = (await traits.traitPrice()).mul(2);

    await expect(
      artwork.connect(user1).mintTraitsAndArtwork([0, 2], [1, 1], [0, 2], 100, {
        value: ethAmount,
      })
    ).to.be.revertedWith("InvalidTraits()");

    await expect(
      artwork.connect(user1).mintTraitsAndArtwork([0, 0], [1, 1], [0, 0], 100, {
        value: ethAmount,
      })
    ).to.be.revertedWith("InvalidTraits()");

    await expect(
      artwork.connect(user1).mintTraitsAndArtwork([2, 2], [1, 1], [2, 2], 100, {
        value: ethAmount,
      })
    ).to.be.revertedWith("InvalidTraits()");

    await expect(
      artwork.connect(user1).mintTraitsAndArtwork([3, 4], [1, 1], [3, 4], 100, {
        value: ethAmount,
      })
    ).to.be.revertedWith("InvalidTraits()");

    await expect(
      artwork.connect(user1).mintTraitsAndArtwork([4, 4], [1, 1], [4, 4], 100, {
        value: ethAmount,
      })
    ).to.be.revertedWith("InvalidTraits()");

    await expect(
      artwork.connect(user1).mintTraitsAndArtwork([3, 0], [1, 1], [3, 0], 100, {
        value: ethAmount,
      })
    ).to.be.revertedWith("InvalidTraits()");
  });

  it("Users can't buy traits if invalid arrays are passed", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(300));

    const traitPrice = await traits.traitPrice();

    await expect(
      traits.connect(user1).mintTraits(user1.address, [0, 3, 4], [1, 1], {
        value: traitPrice.mul(3),
      })
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      traits.connect(user1).mintTraits(user1.address, [0, 3, 4], [], {
        value: traitPrice.mul(3),
      })
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      traits.connect(user1).mintTraits(user1.address, [0], [1, 2], {
        value: traitPrice.mul(3),
      })
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      traits.connect(user1).mintTraits(user1.address, [], [1, 2, 2], {
        value: traitPrice.mul(3),
      })
    ).to.be.revertedWith("InvalidArrayLengths()");
  });

  it("Users can't buy traits if not enough ETH is sent", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(300));

    const traitPrice = await traits.traitPrice();

    await expect(
      traits.connect(user1).mintTraits(user1.address, [0, 3, 4], [1, 1, 1], {
        value: traitPrice.mul(29).div(10),
      })
    ).to.be.revertedWith("InvalidEthAmount()");

    await expect(
      traits.connect(user1).mintTraits(user1.address, [0], [5], {
        value: traitPrice.mul(49).div(10),
      })
    ).to.be.revertedWith("InvalidEthAmount()");
  });

  it("Users can't create artwork if invalid trait amounts are passed", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(120));

    const traitPrice = await traits.traitPrice();

    await expect(
      artwork
        .connect(user1)
        .mintTraitsAndArtwork([0, 3, 4], [1, 1, 1], [0, 3, 4], 100, {
          value: traitPrice.mul(3),
        })
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      artwork.connect(user1).mintTraitsAndArtwork([0], [1], [0], 100, {
        value: traitPrice.mul(1),
      })
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      artwork
        .connect(user1)
        .mintTraitsAndArtwork([0, 2, 3, 4], [1, 1, 1, 1], [0, 2, 3, 4], 100, {
          value: traitPrice.mul(4),
        })
    ).to.be.revertedWith("InvalidArrayLengths()");
  });

  it("Traits primary sales payment splitting is handled correctly", async () => {
    const artistRevenueClaimerInitialBalance = await ethers.provider.getBalance(
      artistRevenueClaimer.address
    );
    const platformRevenueClaimerInitialBalance =
      await ethers.provider.getBalance(platformRevenueClaimer.address);

    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(300));

    expect(await traits.totalShares()).to.eq(100);

    expect(await traits["totalReleased()"]()).to.eq(0);
    expect(
      await traits["released(address)"](artistRevenueClaimer.address)
    ).to.eq(0);
    expect(
      await traits["released(address)"](platformRevenueClaimer.address)
    ).to.eq(0);
    expect(
      await traits["releasable(address)"](artistRevenueClaimer.address)
    ).to.eq(0);
    expect(
      await traits["releasable(address)"](platformRevenueClaimer.address)
    ).to.eq(0);
    expect(await ethers.provider.getBalance(traits.address)).to.eq(0);

    const ethRevenue1 = (await traits.traitPrice()).mul(10);

    await traits.connect(user1).mintTraits(user1.address, [0], [10], {
      value: ethRevenue1,
    });

    expect(await traits["totalReleased()"]()).to.eq(0);
    expect(
      await traits["released(address)"](artistRevenueClaimer.address)
    ).to.eq(0);
    expect(
      await traits["released(address)"](platformRevenueClaimer.address)
    ).to.eq(0);
    expect(
      await traits["releasable(address)"](artistRevenueClaimer.address)
    ).to.eq(ethRevenue1.mul(90).div(100));
    expect(
      await traits["releasable(address)"](platformRevenueClaimer.address)
    ).to.eq(ethRevenue1.mul(10).div(100));
    expect(await ethers.provider.getBalance(traits.address)).to.eq(ethRevenue1);
    expect(
      await ethers.provider.getBalance(artistRevenueClaimer.address)
    ).to.eq(artistRevenueClaimerInitialBalance);
    expect(
      await ethers.provider.getBalance(platformRevenueClaimer.address)
    ).to.eq(platformRevenueClaimerInitialBalance);

    // Platform revenue is released
    await traits
      .connect(user1)
      ["release(address)"](platformRevenueClaimer.address);

    const platformRevenueClaimed1 = ethRevenue1.mul(10).div(100);

    expect(await traits["totalReleased()"]()).to.eq(platformRevenueClaimed1);
    expect(
      await traits["released(address)"](artistRevenueClaimer.address)
    ).to.eq(0);
    expect(
      await traits["released(address)"](platformRevenueClaimer.address)
    ).to.eq(platformRevenueClaimed1);
    expect(
      await traits["releasable(address)"](artistRevenueClaimer.address)
    ).to.eq(ethRevenue1.mul(90).div(100));
    expect(
      await traits["releasable(address)"](platformRevenueClaimer.address)
    ).to.eq(0);
    expect(await ethers.provider.getBalance(traits.address)).to.eq(
      ethRevenue1.sub(platformRevenueClaimed1)
    );
    expect(
      await ethers.provider.getBalance(artistRevenueClaimer.address)
    ).to.eq(artistRevenueClaimerInitialBalance);
    expect(
      await ethers.provider.getBalance(platformRevenueClaimer.address)
    ).to.eq(platformRevenueClaimerInitialBalance.add(platformRevenueClaimed1));

    // Platform revenue cannot be released again since releasable amount is zero
    await expect(
      traits.connect(user1)["release(address)"](platformRevenueClaimer.address)
    ).to.be.revertedWith("PaymentSplitter: account is not due payment");

    // User that isn't setup as a payee can't release to themselves
    await expect(
      traits.connect(user1)["release(address)"](user1.address)
    ).to.be.revertedWith("PaymentSplitter: account has no shares");

    const ethRevenue2 = (await traits.traitPrice()).mul(20);

    await traits.connect(user1).mintTraits(user1.address, [1, 2], [10, 10], {
      value: ethRevenue2,
    });

    expect(await traits["totalReleased()"]()).to.eq(platformRevenueClaimed1);
    expect(
      await traits["released(address)"](artistRevenueClaimer.address)
    ).to.eq(0);
    expect(
      await traits["released(address)"](platformRevenueClaimer.address)
    ).to.eq(platformRevenueClaimed1);
    expect(
      await traits["releasable(address)"](artistRevenueClaimer.address)
    ).to.eq(ethRevenue1.add(ethRevenue2).mul(90).div(100));
    expect(
      await traits["releasable(address)"](platformRevenueClaimer.address)
    ).to.eq(ethRevenue2.mul(10).div(100));
    expect(await ethers.provider.getBalance(traits.address)).to.eq(
      ethRevenue1.sub(platformRevenueClaimed1).add(ethRevenue2)
    );
    expect(
      await ethers.provider.getBalance(artistRevenueClaimer.address)
    ).to.eq(artistRevenueClaimerInitialBalance);
    expect(
      await ethers.provider.getBalance(platformRevenueClaimer.address)
    ).to.eq(platformRevenueClaimerInitialBalance.add(platformRevenueClaimed1));

    const platformRevenueClaimed2 = ethRevenue2.mul(10).div(100);

    // Platform revenue is released
    await traits
      .connect(user1)
      ["release(address)"](platformRevenueClaimer.address);

    expect(await traits["totalReleased()"]()).to.eq(
      platformRevenueClaimed1.add(platformRevenueClaimed2)
    );
    expect(
      await traits["released(address)"](artistRevenueClaimer.address)
    ).to.eq(0);
    expect(
      await traits["released(address)"](platformRevenueClaimer.address)
    ).to.eq(platformRevenueClaimed1.add(platformRevenueClaimed2));
    expect(
      await traits["releasable(address)"](artistRevenueClaimer.address)
    ).to.eq(ethRevenue1.add(ethRevenue2).mul(90).div(100));
    expect(
      await traits["releasable(address)"](platformRevenueClaimer.address)
    ).to.eq(0);
    expect(await ethers.provider.getBalance(traits.address)).to.eq(
      ethRevenue1
        .sub(platformRevenueClaimed1)
        .add(ethRevenue2)
        .sub(platformRevenueClaimed2)
    );
    expect(
      await ethers.provider.getBalance(artistRevenueClaimer.address)
    ).to.eq(artistRevenueClaimerInitialBalance);
    expect(
      await ethers.provider.getBalance(platformRevenueClaimer.address)
    ).to.eq(
      platformRevenueClaimerInitialBalance
        .add(platformRevenueClaimed1)
        .add(platformRevenueClaimed2)
    );

    const artistRevenueClaimed1 = ethRevenue1.add(ethRevenue2).mul(90).div(100);

    // Artist revenue is released
    await traits
      .connect(user1)
      ["release(address)"](artistRevenueClaimer.address);

    expect(await traits["totalReleased()"]()).to.eq(
      platformRevenueClaimed1
        .add(platformRevenueClaimed2)
        .add(artistRevenueClaimed1)
    );
    expect(
      await traits["released(address)"](artistRevenueClaimer.address)
    ).to.eq(artistRevenueClaimed1);
    expect(
      await traits["released(address)"](platformRevenueClaimer.address)
    ).to.eq(platformRevenueClaimed1.add(platformRevenueClaimed2));
    expect(
      await traits["releasable(address)"](artistRevenueClaimer.address)
    ).to.eq(0);
    expect(
      await traits["releasable(address)"](platformRevenueClaimer.address)
    ).to.eq(0);
    expect(await ethers.provider.getBalance(traits.address)).to.eq(
      ethRevenue1
        .sub(platformRevenueClaimed1)
        .add(ethRevenue2)
        .sub(platformRevenueClaimed2)
        .sub(artistRevenueClaimed1)
    );
    expect(
      await ethers.provider.getBalance(artistRevenueClaimer.address)
    ).to.eq(artistRevenueClaimerInitialBalance.add(artistRevenueClaimed1));
    expect(
      await ethers.provider.getBalance(platformRevenueClaimer.address)
    ).to.eq(
      platformRevenueClaimerInitialBalance
        .add(platformRevenueClaimed1)
        .add(platformRevenueClaimed2)
    );
    expect(await ethers.provider.getBalance(traits.address)).to.eq(0);

    // Platform revenue cannot be released again since releasable amount is zero
    await expect(
      traits.connect(user1)["release(address)"](platformRevenueClaimer.address)
    ).to.be.revertedWith("PaymentSplitter: account is not due payment");

    // Artist revenue cannot be released again since releasable amount is zero
    await expect(
      traits.connect(user1)["release(address)"](artistRevenueClaimer.address)
    ).to.be.revertedWith("PaymentSplitter: account is not due payment");
  });

  it("Trait total supplys cannot exceed max supplys", async () => {
    // Go to start of auction period
    await time.increaseTo(traitsSaleStartTime);

    expect(await traits.maxSupply(0)).to.eq(10);

    // User has 0 of trait 0
    expect(await traits.balanceOf(user1.address, 0)).to.eq(0);

    expect(await traits.totalSupply(0)).to.eq(0);

    // Buy x1 of trait 0 with 1 ETH
    await traits.connect(user1).mintTraits(user1.address, [0], [1], {
      value: ethers.utils.parseEther("1"),
    });

    expect(await traits.totalSupply(0)).to.eq(1);

    // User has 1 of trait 0
    expect(await traits.balanceOf(user1.address, 0)).to.eq(1);

    await expect(
      traits.connect(user1).mintTraits(user1.address, [0], [10], {
        value: ethers.utils.parseEther("10"),
      })
    ).to.be.revertedWith("MaxSupply()");

    await traits.connect(user1).mintTraits(user1.address, [0], [9], {
      value: ethers.utils.parseEther("10"),
    });

    expect(await traits.totalSupply(0)).to.eq(10);

    expect(await traits.maxSupply(0)).to.eq(10);

    // User has 10 of trait 0
    expect(await traits.balanceOf(user1.address, 0)).to.eq(10);

    await expect(
      traits.connect(user1).mintTraits(user1.address, [0], [1], {
        value: ethers.utils.parseEther("1"),
      })
    ).to.be.revertedWith("MaxSupply()");
  });

  it("transferTraitsToCreateArtwork() can only be called by the Artwork contract", async () => {
    await expect(
      traits.connect(user1).transferTraitsToMintArtwork(user1.address, [0, 3])
    ).to.be.revertedWith("OnlyArtwork()");

    await expect(
      traits.connect(user1).transferTraitsToMintArtwork(artwork.address, [0, 3])
    ).to.be.revertedWith("OnlyArtwork()");
  });

  it("Individual traits cannot be bought before trait sales start time", async () => {
    // Go to start of auction period
    await time.increaseTo(traitsSaleStartTime - 10);

    await expect(
      traits.connect(user1).mintTraits(user1.address, [0], [1], {
        value: ethers.utils.parseEther("1"),
      })
    ).to.be.revertedWith("TraitsSaleStartTime()");
  });

  it("Whitelisted users can't mint more than they're allocated", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(120));

    expect(
      await traits.whitelistMintsRemaining(whitelistedUser1.address)
    ).to.eq(1);

    await artwork.connect(whitelistedUser1).mintArtworkWhitelist([0, 3], 100);

    expect(await artwork.ownerOf(0)).to.eq(whitelistedUser1.address);

    expect(
      await traits.whitelistMintsRemaining(whitelistedUser1.address)
    ).to.eq(0);

    await expect(
      artwork.connect(whitelistedUser1).mintArtworkWhitelist([0, 3], 100)
    ).to.be.revertedWith("NoWhitelistMints()");

    expect(await traits.whitelistMintsRemaining(user1.address)).to.eq(0);

    await expect(
      artwork.connect(user1).mintArtworkWhitelist([0, 3], 100)
    ).to.be.revertedWith("NoWhitelistMints()");
  });

  it("Artwork proof can only be minted once", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(120));

    await artwork.connect(artist).mintArtworkProof([0, 3], 100);

    expect(await artwork.ownerOf(0)).to.eq(artist.address);

    await expect(
      artwork.connect(artist).mintArtworkProof([0, 3], 100)
    ).to.be.revertedWith("ProofAlreadyMinted()");
  });

  it("Addresses other than artist and project registry can't mint proof", async () => {
    await expect(
      artwork.connect(user1).mintArtworkProof([0, 3], 100)
    ).to.be.revertedWith("OnlyArtistOrProjectRegistry()");
  });

  it("Execute function reverts if invalid array lengths are given", async () => {
    const updateAuctionData = (
      await ethers.getContractFactory("Traits", deployer)
    ).interface.encodeFunctionData("updateAuction", [
      auctionStartTime,
      auctionEndTime,
      auctionStartPrice,
      auctionEndPrice,
      auctionPriceSteps,
      true,
      traitsSaleStartTime,
      whitelistStartTime,
    ]);

    await expect(
      projectRegistry
        .connect(projectRegistryAdmin)
        .execute([traits.address], [0, 0], [updateAuctionData])
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      projectRegistry
        .connect(projectRegistryAdmin)
        .execute([traits.address], [0], [updateAuctionData, updateAuctionData])
    ).to.be.revertedWith("InvalidArrayLengths()");
  });

  it("Whitelist mints revert before the whitelist mint timestamp", async () => {
    await expect(
      artwork.connect(whitelistedUser1).mintArtworkWhitelist([1, 4], 200)
    ).to.be.revertedWith("WhitelistStartTime()");
  });

  it("Whitelisted mints must have correct array length and valid token IDs", async () => {
    // Move forward in time so whitelist mints are active
    await time.increase(time.duration.seconds(120));

    await expect(
      artwork.connect(whitelistedUser1).mintArtworkWhitelist([1, 4, 5], 200)
    ).to.be.revertedWith("InvalidArrayLengths()");
    await expect(
      artwork.connect(whitelistedUser1).mintArtworkWhitelist([1, 2], 200)
    ).to.be.revertedWith("InvalidTraits()");
  });

  it("Whitelisted mints revert if trait max supply is reached", async () => {
    // Move forward in time so individual trait mints are active
    await time.increase(time.duration.seconds(300));

    const ethAmount = (await traits.traitPrice()).mul(10);

    await traits.connect(user1).mintTraits(user1.address, [0], [10], {
      value: ethAmount,
    });

    await expect(
      artwork.connect(whitelistedUser1).mintArtworkWhitelist([0, 4], 200)
    ).to.be.revertedWith("MaxSupply()");
  });

  it("Royalty splitter allows for royalties to be claimed correctly", async () => {
    // Send 10 ETH to royalty splitter
    await user1.sendTransaction({
      to: royaltySplitter.address,
      value: ethers.utils.parseEther("10"),
    });

    // Platform claimer should have 1 ETH releasable
    expect(
      await royaltySplitter["releasable(address)"](
        platformRevenueClaimer.address
      )
    ).to.eq(ethers.utils.parseEther("1"));

    // Artist should have 9 ETH releasable
    expect(
      await royaltySplitter["releasable(address)"](artistRevenueClaimer.address)
    ).to.eq(ethers.utils.parseEther("9"));

    const platformETHBalanceBeforeRelease = await ethers.provider.getBalance(
      platformRevenueClaimer.address
    );

    // Platform releases its payment
    await royaltySplitter
      .connect(user1)
      ["release(address)"](platformRevenueClaimer.address);

    // Platform claimer balance should have increased by 1 ETH
    expect(
      (await ethers.provider.getBalance(platformRevenueClaimer.address)).sub(
        platformETHBalanceBeforeRelease
      )
    ).to.eq(ethers.utils.parseEther("1"));

    // Platform claimer should have 0 ETH releasable
    expect(
      await royaltySplitter["releasable(address)"](
        platformRevenueClaimer.address
      )
    ).to.eq(ethers.utils.parseEther("0"));

    // Reverts if attempting to release when releaseable is zero
    await expect(
      royaltySplitter
        .connect(user1)
        ["release(address)"](platformRevenueClaimer.address)
    ).to.be.revertedWith("");

    const artistETHBalanceBeforeRelease = await ethers.provider.getBalance(
      artistRevenueClaimer.address
    );

    // Artist releases its payment
    await royaltySplitter
      .connect(user1)
      ["release(address)"](artistRevenueClaimer.address);

    // Artist claimer balance should have increased by 9 ETH
    expect(
      (await ethers.provider.getBalance(artistRevenueClaimer.address)).sub(
        artistETHBalanceBeforeRelease
      )
    ).to.eq(ethers.utils.parseEther("9"));
  });
});
