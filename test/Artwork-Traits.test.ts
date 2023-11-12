import {
  Artwork,
  Artwork__factory,
  Traits,
  Traits__factory,
  PaymentSplitter,
  ProjectRegistry,
  ProjectRegistry__factory,
  MockScriptStorage1,
  MockScriptStorage2,
  MockScriptStorage1__factory,
  MockScriptStorage2__factory,
} from "../typechain-types";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Signer } from "ethers";
import time from "./helpers/time";
import { artworkHash } from "./helpers/utilities";

describe("Artwork and Traits", function () {
  let projectRegistry: ProjectRegistry;
  let scriptStorage1: MockScriptStorage1;
  let scriptStorage2: MockScriptStorage2;
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

    scriptStorage1 = await new MockScriptStorage1__factory(deployer).deploy();
    scriptStorage2 = await new MockScriptStorage2__factory(deployer).deploy();

    // "https://artwork.intrinsic.art/",

    artwork = await new Artwork__factory(deployer).deploy(
      "Intrinsic.art Disentanglement",
      "INSC",
      "testJSON",
      artist.address,
      projectRegistry.address,
      [scriptStorage1.address, scriptStorage2.address],
      1000,
      [artistRevenueClaimer.address, platformRevenueClaimer.address],
      [90, 10]
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
      await artwork.royaltySplitter()
    );

    currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    auctionStartTime = currentTime + 110;
    auctionEndTime = currentTime + 210;
    auctionStartPrice = ethers.utils.parseEther("1");
    auctionEndPrice = ethers.utils.parseEther("0.1");
    auctionPriceSteps = 4;
    traitsSaleStartTime = currentTime + 300;

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
    expect(await artwork.scriptStorageContracts()).to.deep.eq([
      scriptStorage1.address,
      scriptStorage2.address,
    ]);
    expect(await artwork.scripts()).to.deep.eq([
      "Test Script 1",
      "Test Script 2",
    ]);
    expect(await artwork.metadataJSON()).to.eq("testJSON");
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
    expect(await artwork.VERSION()).to.eq("1.0.0");
    expect(await artwork.royaltySplitter()).to.eq(royaltySplitter.address);
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

    await artwork.connect(artist).artistCreateArtworkProof([0, 3], 100);

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

    await artwork.connect(whitelistedUser1).whitelistCreateArtwork([1, 4], 200);
    await artwork.connect(whitelistedUser2).whitelistCreateArtwork([2, 4], 300);

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

  it.only("A user can create artwork and reclaim traits from it", async () => {
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
      .buyTraitsCreateArtwork([0, 3], [1, 1], [0, 3], 100, {
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

  // it("Correctly handles token URIs", async () => {
  //   // Move forward in time so auction is active
  //   await time.increase(time.duration.seconds(120));

  //   const ethAmount = (await traits.traitPrice()).mul(2);

  //   await artwork
  //     .connect(user1)
  //     .buyTraitsCreateArtwork([0, 3], [1, 1], [0, 3], 100, {
  //       value: ethAmount,
  //     });

  //   await artwork
  //     .connect(user1)
  //     .buyTraitsCreateArtwork([0, 3], [1, 1], [0, 3], 100, {
  //       value: ethAmount,
  //     });

  //   expect(await artwork.tokenURI(0)).to.eq(
  //     `https://artwork.intrinsic.art/${artwork.address.toLowerCase()}/0`
  //   );

  //   expect(await artwork.tokenURI(1)).to.eq(
  //     `https://artwork.intrinsic.art/${artwork.address.toLowerCase()}/1`
  //   );

  //   await expect(artwork.tokenURI(2)).to.be.revertedWith(
  //     "ERC721: invalid token ID"
  //   );

  //   await expect(artwork.tokenURI(3)).to.be.revertedWith(
  //     "ERC721: invalid token ID"
  //   );

  //   expect(await traits.uri(0)).to.eq(
  //     `https://trait.intrinsic.art/${traits.address.toLowerCase()}/0`
  //   );

  //   expect(await traits.uri(4)).to.eq(
  //     `https://trait.intrinsic.art/${traits.address.toLowerCase()}/4`
  //   );

  //   await expect(traits.uri(5)).to.be.revertedWith("InvalidTokenId()");

  //   await expect(traits.uri(6)).to.be.revertedWith("InvalidTokenId()");
  // });

  // it("Artwork token IDs increment even if previous ones are have been reclaimed", async () => {
  //   // Move forward in time so auction is active
  //   await time.increase(time.duration.seconds(120));

  //   const ethAmount = (await traits.traitPrice()).mul(2);

  //   expect(await artwork.nextTokenId()).to.eq(0);
  //   await expect(artwork.ownerOf(0)).to.be.revertedWith(
  //     "ERC721: invalid token ID"
  //   );
  //   await expect(artwork.artwork(0)).to.be.revertedWith(
  //     "ERC721: invalid token ID"
  //   );

  //   // Create artwork 0
  //   await artwork
  //     .connect(user1)
  //     .buyTraitsCreateArtwork([0, 3], [1, 1], [0, 3], 100, {
  //       value: ethAmount,
  //     });

  //   expect(await artwork.nextTokenId()).to.eq(1);
  //   expect(await artwork.ownerOf(0)).to.eq(user1.address);
  //   expect(await artwork.artwork(0)).to.deep.eq([
  //     [BigNumber.from("0"), BigNumber.from("3")],
  //     ["Blonde", "Green"],
  //     ["blonde", "green"],
  //     ["Hair Color", "Eye Color"],
  //     ["hairColor", "eyeColor"],
  //     artworkHash(artwork.address, user1.address, 0, 100),
  //   ]);

  //   await artwork.connect(user1).reclaimTraits(0);

  //   await expect(artwork.ownerOf(0)).to.be.revertedWith(
  //     "ERC721: invalid token ID"
  //   );
  //   await expect(artwork.artwork(0)).to.be.revertedWith(
  //     "ERC721: invalid token ID"
  //   );

  //   await expect(artwork.ownerOf(1)).to.be.revertedWith(
  //     "ERC721: invalid token ID"
  //   );
  //   await expect(artwork.artwork(1)).to.be.revertedWith(
  //     "ERC721: invalid token ID"
  //   );

  //   // Create artwork 1
  //   await artwork.connect(user1).createArtwork([0, 3], 100);

  //   expect(await artwork.nextTokenId()).to.eq(2);
  //   await expect(artwork.ownerOf(0)).to.be.revertedWith(
  //     "ERC721: invalid token ID"
  //   );
  //   await expect(artwork.artwork(0)).to.be.revertedWith(
  //     "ERC721: invalid token ID"
  //   );
  //   expect(await artwork.ownerOf(1)).to.eq(user1.address);
  //   expect(await artwork.artwork(1)).to.deep.eq([
  //     [BigNumber.from("0"), BigNumber.from("3")],
  //     ["Blonde", "Green"],
  //     ["blonde", "green"],
  //     ["Hair Color", "Eye Color"],
  //     ["hairColor", "eyeColor"],
  //     artworkHash(artwork.address, user1.address, 1, 100),
  //   ]);

  //   await artwork.connect(user1).reclaimTraits(1);

  //   // Create artwork 2
  //   await artwork
  //     .connect(user1)
  //     .buyTraitsCreateArtwork([1, 4], [1, 1], [1, 4], 100, {
  //       value: ethAmount,
  //     });

  //   expect(await artwork.nextTokenId()).to.eq(3);
  //   await expect(artwork.ownerOf(0)).to.be.revertedWith(
  //     "ERC721: invalid token ID"
  //   );
  //   await expect(artwork.artwork(0)).to.be.revertedWith(
  //     "ERC721: invalid token ID"
  //   );
  //   await expect(artwork.ownerOf(1)).to.be.revertedWith(
  //     "ERC721: invalid token ID"
  //   );
  //   await expect(artwork.artwork(1)).to.be.revertedWith(
  //     "ERC721: invalid token ID"
  //   );
  //   expect(await artwork.ownerOf(2)).to.eq(user1.address);
  //   expect(await artwork.artwork(2)).to.deep.eq([
  //     [BigNumber.from("1"), BigNumber.from("4")],
  //     ["Brown", "Blue"],
  //     ["brown", "blue"],
  //     ["Hair Color", "Eye Color"],
  //     ["hairColor", "eyeColor"],
  //     artworkHash(artwork.address, user1.address, 2, 100),
  //   ]);
  // });

  // it("A user can buy traits and create artwork in separate transactions", async () => {
  //   // Move forward in time so auction is active
  //   await time.increase(time.duration.seconds(300));

  //   expect(await ethers.provider.getBalance(artwork.address)).to.eq(0);
  //   expect(await ethers.provider.getBalance(traits.address)).to.eq(0);

  //   const ethAmount = (await traits.traitPrice()).mul(4);

  //   await expect(artwork.ownerOf(1)).to.be.revertedWith(
  //     "ERC721: invalid token ID"
  //   );
  //   expect(await artwork.userNonce(user1.address)).to.eq(0);
  //   await expect(artwork.artwork(0)).to.be.revertedWith(
  //     "ERC721: invalid token ID"
  //   );

  //   expect(await traits.balanceOf(user1.address, 0)).to.eq(0);
  //   expect(await traits.balanceOf(user1.address, 1)).to.eq(0);
  //   expect(await traits.balanceOf(user1.address, 2)).to.eq(0);
  //   expect(await traits.balanceOf(user1.address, 3)).to.eq(0);
  //   expect(await traits.balanceOf(user1.address, 4)).to.eq(0);

  //   await traits.connect(user1).buyTraits(user1.address, [1, 4], [2, 2], {
  //     value: ethAmount,
  //   });

  //   expect(await traits.balanceOf(user1.address, 0)).to.eq(0);
  //   expect(await traits.balanceOf(user1.address, 1)).to.eq(2);
  //   expect(await traits.balanceOf(user1.address, 2)).to.eq(0);
  //   expect(await traits.balanceOf(user1.address, 3)).to.eq(0);
  //   expect(await traits.balanceOf(user1.address, 4)).to.eq(2);

  //   await artwork.connect(user1).createArtwork([1, 4], 100);

  //   expect(await traits.balanceOf(user1.address, 0)).to.eq(0);
  //   expect(await traits.balanceOf(user1.address, 1)).to.eq(1);
  //   expect(await traits.balanceOf(user1.address, 2)).to.eq(0);
  //   expect(await traits.balanceOf(user1.address, 3)).to.eq(0);
  //   expect(await traits.balanceOf(user1.address, 4)).to.eq(1);

  //   expect(await ethers.provider.getBalance(artwork.address)).to.eq(0);
  //   expect(await ethers.provider.getBalance(traits.address)).to.eq(ethAmount);

  //   expect(await artwork.ownerOf(0)).to.eq(user1.address);

  //   expect(await artwork.artwork(0)).to.deep.eq([
  //     [BigNumber.from("1"), BigNumber.from("4")],
  //     ["Brown", "Blue"],
  //     ["brown", "blue"],
  //     ["Hair Color", "Eye Color"],
  //     ["hairColor", "eyeColor"],
  //     artworkHash(artwork.address, user1.address, 0, 100),
  //   ]);

  //   expect(await artwork.userNonce(user1.address)).to.eq(1);

  //   expect(await traits.balanceOf(user1.address, 0)).to.eq(0);
  //   expect(await traits.balanceOf(user1.address, 3)).to.eq(0);

  //   await artwork.connect(user1).reclaimTraits(0);

  //   await expect(artwork.artwork(0)).to.be.revertedWith(
  //     "ERC721: invalid token ID"
  //   );
  //   expect(await traits.balanceOf(user1.address, 0)).to.eq(0);
  //   expect(await traits.balanceOf(user1.address, 1)).to.eq(2);
  //   expect(await traits.balanceOf(user1.address, 2)).to.eq(0);
  //   expect(await traits.balanceOf(user1.address, 3)).to.eq(0);
  //   expect(await traits.balanceOf(user1.address, 4)).to.eq(2);
  // });

  // it("Trait prices during the auction update correctly", async () => {
  //   // Auction time is 100 seconds

  //   await time.increaseTo(auctionStartTime - 1);

  //   await expect(traits.traitPrice()).to.be.revertedWith("AuctionNotLive()");

  //   await time.increaseTo(auctionStartTime);

  //   expect(await traits.traitPrice()).to.eq(auctionStartPrice);

  //   // Increase time to halfway through auction
  //   await time.increase(time.duration.seconds(50));

  //   expect(await traits.traitPrice()).to.eq(
  //     auctionStartPrice.add(auctionEndPrice).div(2)
  //   );

  //   // Increase time to end of auction
  //   await time.increase(time.duration.seconds(50));

  //   expect(await traits.traitPrice()).to.eq(auctionEndPrice);

  //   // Ensure price stays at the end price
  //   await time.increase(time.duration.seconds(1000));

  //   expect(await traits.traitPrice()).to.eq(auctionEndPrice);
  // });

  // it("Users cannot create artwork with traits they don't own", async () => {
  //   // Go to start of auction period
  //   await time.increaseTo(auctionStartTime);

  //   await expect(
  //     artwork.connect(user1).createArtwork([0, 3], 100)
  //   ).to.be.revertedWith("ERC1155: insufficient balance for transfer");
  // });

  // it("Users cannot create artwork with traits that are sold out", async () => {
  //   // Go to start of auction period
  //   await time.increaseTo(traitsSaleStartTime);

  //   // Buy x10 of trait 0 with 10 ETH, trait is sold out now
  //   await traits.connect(user1).buyTraits(user1.address, [0], [10], {
  //     value: ethers.utils.parseEther("10"),
  //   });

  //   await traits.connect(user2).buyTraits(user1.address, [3], [1], {
  //     value: ethers.utils.parseEther("10"),
  //   });

  //   const ethAmount = await traits.traitPrice();

  //   await expect(
  //     artwork.connect(user2).buyTraitsCreateArtwork([0], [1], [0, 3], 100, {
  //       value: ethAmount,
  //     })
  //   ).to.be.revertedWith("MaxSupply()");
  // });

  // it("Users can't reclaim traits from artwork they don't own", async () => {
  //   // Move forward in time so auction is active
  //   await time.increase(time.duration.seconds(120));

  //   const ethAmount = (await traits.traitPrice()).mul(2);

  //   // User 1 creates artwork 0
  //   await artwork
  //     .connect(user1)
  //     .buyTraitsCreateArtwork([0, 3], [1, 1], [0, 3], 100, {
  //       value: ethAmount,
  //     });

  //   await expect(artwork.connect(user2).reclaimTraits(0)).to.be.revertedWith(
  //     "OnlyArtworkOwner()"
  //   );
  // });

  // it("Users can't create artwork that doesn't have a trait from each type", async () => {
  //   // Move forward in time so auction is active
  //   await time.increase(time.duration.seconds(120));

  //   const ethAmount = (await traits.traitPrice()).mul(2);

  //   await expect(
  //     artwork
  //       .connect(user1)
  //       .buyTraitsCreateArtwork([0, 2], [1, 1], [0, 2], 100, {
  //         value: ethAmount,
  //       })
  //   ).to.be.revertedWith("InvalidTraits()");

  //   await expect(
  //     artwork
  //       .connect(user1)
  //       .buyTraitsCreateArtwork([0, 0], [1, 1], [0, 0], 100, {
  //         value: ethAmount,
  //       })
  //   ).to.be.revertedWith("InvalidTraits()");

  //   await expect(
  //     artwork
  //       .connect(user1)
  //       .buyTraitsCreateArtwork([2, 2], [1, 1], [2, 2], 100, {
  //         value: ethAmount,
  //       })
  //   ).to.be.revertedWith("InvalidTraits()");

  //   await expect(
  //     artwork
  //       .connect(user1)
  //       .buyTraitsCreateArtwork([3, 4], [1, 1], [3, 4], 100, {
  //         value: ethAmount,
  //       })
  //   ).to.be.revertedWith("InvalidTraits()");

  //   await expect(
  //     artwork
  //       .connect(user1)
  //       .buyTraitsCreateArtwork([4, 4], [1, 1], [4, 4], 100, {
  //         value: ethAmount,
  //       })
  //   ).to.be.revertedWith("InvalidTraits()");

  //   await expect(
  //     artwork
  //       .connect(user1)
  //       .buyTraitsCreateArtwork([3, 0], [1, 1], [3, 0], 100, {
  //         value: ethAmount,
  //       })
  //   ).to.be.revertedWith("InvalidTraits()");
  // });

  // it("Users can't buy traits if invalid arrays are passed", async () => {
  //   // Move forward in time so auction is active
  //   await time.increase(time.duration.seconds(300));

  //   const traitPrice = await traits.traitPrice();

  //   await expect(
  //     traits.connect(user1).buyTraits(user1.address, [0, 3, 4], [1, 1], {
  //       value: traitPrice.mul(3),
  //     })
  //   ).to.be.revertedWith("InvalidArrayLengths()");

  //   await expect(
  //     traits.connect(user1).buyTraits(user1.address, [0, 3, 4], [], {
  //       value: traitPrice.mul(3),
  //     })
  //   ).to.be.revertedWith("InvalidArrayLengths()");

  //   await expect(
  //     traits.connect(user1).buyTraits(user1.address, [0], [1, 2], {
  //       value: traitPrice.mul(3),
  //     })
  //   ).to.be.revertedWith("InvalidArrayLengths()");

  //   await expect(
  //     traits.connect(user1).buyTraits(user1.address, [], [1, 2, 2], {
  //       value: traitPrice.mul(3),
  //     })
  //   ).to.be.revertedWith("InvalidArrayLengths()");
  // });

  // it("Users can't buy traits if not enough ETH is sent", async () => {
  //   // Move forward in time so auction is active
  //   await time.increase(time.duration.seconds(300));

  //   const traitPrice = await traits.traitPrice();

  //   await expect(
  //     traits.connect(user1).buyTraits(user1.address, [0, 3, 4], [1, 1, 1], {
  //       value: traitPrice.mul(29).div(10),
  //     })
  //   ).to.be.revertedWith("InvalidEthAmount()");

  //   await expect(
  //     traits.connect(user1).buyTraits(user1.address, [0], [5], {
  //       value: traitPrice.mul(49).div(10),
  //     })
  //   ).to.be.revertedWith("InvalidEthAmount()");
  // });

  // it("Users can't create artwork if invalid trait amounts are passed", async () => {
  //   // Move forward in time so auction is active
  //   await time.increase(time.duration.seconds(120));

  //   const traitPrice = await traits.traitPrice();

  //   await expect(
  //     artwork
  //       .connect(user1)
  //       .buyTraitsCreateArtwork([0, 3, 4], [1, 1, 1], [0, 3, 4], 100, {
  //         value: traitPrice.mul(3),
  //       })
  //   ).to.be.revertedWith("InvalidArrayLengths()");

  //   await expect(
  //     artwork.connect(user1).buyTraitsCreateArtwork([0], [1], [0], 100, {
  //       value: traitPrice.mul(1),
  //     })
  //   ).to.be.revertedWith("InvalidArrayLengths()");

  //   await expect(
  //     artwork
  //       .connect(user1)
  //       .buyTraitsCreateArtwork([0, 2, 3, 4], [1, 1, 1, 1], [0, 2, 3, 4], 100, {
  //         value: traitPrice.mul(4),
  //       })
  //   ).to.be.revertedWith("InvalidArrayLengths()");
  // });

  // it("Traits primary sales payment splitting is handled correctly", async () => {
  //   const artistRevenueClaimerInitialBalance = await ethers.provider.getBalance(
  //     artistRevenueClaimer.address
  //   );
  //   const platformRevenueClaimerInitialBalance =
  //     await ethers.provider.getBalance(platformRevenueClaimer.address);

  //   // Move forward in time so auction is active
  //   await time.increase(time.duration.seconds(300));

  //   expect(await traits.totalShares()).to.eq(100);

  //   expect(await traits["totalReleased()"]()).to.eq(0);
  //   expect(
  //     await traits["released(address)"](artistRevenueClaimer.address)
  //   ).to.eq(0);
  //   expect(
  //     await traits["released(address)"](platformRevenueClaimer.address)
  //   ).to.eq(0);
  //   expect(
  //     await traits["releasable(address)"](artistRevenueClaimer.address)
  //   ).to.eq(0);
  //   expect(
  //     await traits["releasable(address)"](platformRevenueClaimer.address)
  //   ).to.eq(0);
  //   expect(await ethers.provider.getBalance(traits.address)).to.eq(0);

  //   const ethRevenue1 = (await traits.traitPrice()).mul(10);

  //   await traits.connect(user1).buyTraits(user1.address, [0], [10], {
  //     value: ethRevenue1,
  //   });

  //   expect(await traits["totalReleased()"]()).to.eq(0);
  //   expect(
  //     await traits["released(address)"](artistRevenueClaimer.address)
  //   ).to.eq(0);
  //   expect(
  //     await traits["released(address)"](platformRevenueClaimer.address)
  //   ).to.eq(0);
  //   expect(
  //     await traits["releasable(address)"](artistRevenueClaimer.address)
  //   ).to.eq(ethRevenue1.mul(90).div(100));
  //   expect(
  //     await traits["releasable(address)"](platformRevenueClaimer.address)
  //   ).to.eq(ethRevenue1.mul(10).div(100));
  //   expect(await ethers.provider.getBalance(traits.address)).to.eq(ethRevenue1);
  //   expect(
  //     await ethers.provider.getBalance(artistRevenueClaimer.address)
  //   ).to.eq(artistRevenueClaimerInitialBalance);
  //   expect(
  //     await ethers.provider.getBalance(platformRevenueClaimer.address)
  //   ).to.eq(platformRevenueClaimerInitialBalance);

  //   // Platform revenue is released
  //   await traits
  //     .connect(user1)
  //     ["release(address)"](platformRevenueClaimer.address);

  //   const platformRevenueClaimed1 = ethRevenue1.mul(10).div(100);

  //   expect(await traits["totalReleased()"]()).to.eq(platformRevenueClaimed1);
  //   expect(
  //     await traits["released(address)"](artistRevenueClaimer.address)
  //   ).to.eq(0);
  //   expect(
  //     await traits["released(address)"](platformRevenueClaimer.address)
  //   ).to.eq(platformRevenueClaimed1);
  //   expect(
  //     await traits["releasable(address)"](artistRevenueClaimer.address)
  //   ).to.eq(ethRevenue1.mul(90).div(100));
  //   expect(
  //     await traits["releasable(address)"](platformRevenueClaimer.address)
  //   ).to.eq(0);
  //   expect(await ethers.provider.getBalance(traits.address)).to.eq(
  //     ethRevenue1.sub(platformRevenueClaimed1)
  //   );
  //   expect(
  //     await ethers.provider.getBalance(artistRevenueClaimer.address)
  //   ).to.eq(artistRevenueClaimerInitialBalance);
  //   expect(
  //     await ethers.provider.getBalance(platformRevenueClaimer.address)
  //   ).to.eq(platformRevenueClaimerInitialBalance.add(platformRevenueClaimed1));

  //   // Platform revenue cannot be released again since releasable amount is zero
  //   await expect(
  //     traits.connect(user1)["release(address)"](platformRevenueClaimer.address)
  //   ).to.be.revertedWith("PaymentSplitter: account is not due payment");

  //   // User that isn't setup as a payee can't release to themselves
  //   await expect(
  //     traits.connect(user1)["release(address)"](user1.address)
  //   ).to.be.revertedWith("PaymentSplitter: account has no shares");

  //   const ethRevenue2 = (await traits.traitPrice()).mul(20);

  //   await traits.connect(user1).buyTraits(user1.address, [1, 2], [10, 10], {
  //     value: ethRevenue2,
  //   });

  //   expect(await traits["totalReleased()"]()).to.eq(platformRevenueClaimed1);
  //   expect(
  //     await traits["released(address)"](artistRevenueClaimer.address)
  //   ).to.eq(0);
  //   expect(
  //     await traits["released(address)"](platformRevenueClaimer.address)
  //   ).to.eq(platformRevenueClaimed1);
  //   expect(
  //     await traits["releasable(address)"](artistRevenueClaimer.address)
  //   ).to.eq(ethRevenue1.add(ethRevenue2).mul(90).div(100));
  //   expect(
  //     await traits["releasable(address)"](platformRevenueClaimer.address)
  //   ).to.eq(ethRevenue2.mul(10).div(100));
  //   expect(await ethers.provider.getBalance(traits.address)).to.eq(
  //     ethRevenue1.sub(platformRevenueClaimed1).add(ethRevenue2)
  //   );
  //   expect(
  //     await ethers.provider.getBalance(artistRevenueClaimer.address)
  //   ).to.eq(artistRevenueClaimerInitialBalance);
  //   expect(
  //     await ethers.provider.getBalance(platformRevenueClaimer.address)
  //   ).to.eq(platformRevenueClaimerInitialBalance.add(platformRevenueClaimed1));

  //   const platformRevenueClaimed2 = ethRevenue2.mul(10).div(100);

  //   // Platform revenue is released
  //   await traits
  //     .connect(user1)
  //     ["release(address)"](platformRevenueClaimer.address);

  //   expect(await traits["totalReleased()"]()).to.eq(
  //     platformRevenueClaimed1.add(platformRevenueClaimed2)
  //   );
  //   expect(
  //     await traits["released(address)"](artistRevenueClaimer.address)
  //   ).to.eq(0);
  //   expect(
  //     await traits["released(address)"](platformRevenueClaimer.address)
  //   ).to.eq(platformRevenueClaimed1.add(platformRevenueClaimed2));
  //   expect(
  //     await traits["releasable(address)"](artistRevenueClaimer.address)
  //   ).to.eq(ethRevenue1.add(ethRevenue2).mul(90).div(100));
  //   expect(
  //     await traits["releasable(address)"](platformRevenueClaimer.address)
  //   ).to.eq(0);
  //   expect(await ethers.provider.getBalance(traits.address)).to.eq(
  //     ethRevenue1
  //       .sub(platformRevenueClaimed1)
  //       .add(ethRevenue2)
  //       .sub(platformRevenueClaimed2)
  //   );
  //   expect(
  //     await ethers.provider.getBalance(artistRevenueClaimer.address)
  //   ).to.eq(artistRevenueClaimerInitialBalance);
  //   expect(
  //     await ethers.provider.getBalance(platformRevenueClaimer.address)
  //   ).to.eq(
  //     platformRevenueClaimerInitialBalance
  //       .add(platformRevenueClaimed1)
  //       .add(platformRevenueClaimed2)
  //   );

  //   const artistRevenueClaimed1 = ethRevenue1.add(ethRevenue2).mul(90).div(100);

  //   // Artist revenue is released
  //   await traits
  //     .connect(user1)
  //     ["release(address)"](artistRevenueClaimer.address);

  //   expect(await traits["totalReleased()"]()).to.eq(
  //     platformRevenueClaimed1
  //       .add(platformRevenueClaimed2)
  //       .add(artistRevenueClaimed1)
  //   );
  //   expect(
  //     await traits["released(address)"](artistRevenueClaimer.address)
  //   ).to.eq(artistRevenueClaimed1);
  //   expect(
  //     await traits["released(address)"](platformRevenueClaimer.address)
  //   ).to.eq(platformRevenueClaimed1.add(platformRevenueClaimed2));
  //   expect(
  //     await traits["releasable(address)"](artistRevenueClaimer.address)
  //   ).to.eq(0);
  //   expect(
  //     await traits["releasable(address)"](platformRevenueClaimer.address)
  //   ).to.eq(0);
  //   expect(await ethers.provider.getBalance(traits.address)).to.eq(
  //     ethRevenue1
  //       .sub(platformRevenueClaimed1)
  //       .add(ethRevenue2)
  //       .sub(platformRevenueClaimed2)
  //       .sub(artistRevenueClaimed1)
  //   );
  //   expect(
  //     await ethers.provider.getBalance(artistRevenueClaimer.address)
  //   ).to.eq(artistRevenueClaimerInitialBalance.add(artistRevenueClaimed1));
  //   expect(
  //     await ethers.provider.getBalance(platformRevenueClaimer.address)
  //   ).to.eq(
  //     platformRevenueClaimerInitialBalance
  //       .add(platformRevenueClaimed1)
  //       .add(platformRevenueClaimed2)
  //   );
  //   expect(await ethers.provider.getBalance(traits.address)).to.eq(0);

  //   // Platform revenue cannot be released again since releasable amount is zero
  //   await expect(
  //     traits.connect(user1)["release(address)"](platformRevenueClaimer.address)
  //   ).to.be.revertedWith("PaymentSplitter: account is not due payment");

  //   // Artist revenue cannot be released again since releasable amount is zero
  //   await expect(
  //     traits.connect(user1)["release(address)"](artistRevenueClaimer.address)
  //   ).to.be.revertedWith("PaymentSplitter: account is not due payment");
  // });

  // it("Trait total supplys cannot exceed max supplys", async () => {
  //   // Go to start of auction period
  //   await time.increaseTo(traitsSaleStartTime);

  //   expect(await traits.maxSupply(0)).to.eq(10);

  //   // User has 0 of trait 0
  //   expect(await traits.balanceOf(user1.address, 0)).to.eq(0);

  //   expect(await traits.totalSupply(0)).to.eq(0);

  //   // Buy x1 of trait 0 with 1 ETH
  //   await traits.connect(user1).buyTraits(user1.address, [0], [1], {
  //     value: ethers.utils.parseEther("1"),
  //   });

  //   expect(await traits.totalSupply(0)).to.eq(1);

  //   // User has 1 of trait 0
  //   expect(await traits.balanceOf(user1.address, 0)).to.eq(1);

  //   await expect(
  //     traits.connect(user1).buyTraits(user1.address, [0], [10], {
  //       value: ethers.utils.parseEther("10"),
  //     })
  //   ).to.be.revertedWith("MaxSupply()");

  //   await traits.connect(user1).buyTraits(user1.address, [0], [9], {
  //     value: ethers.utils.parseEther("10"),
  //   });

  //   expect(await traits.totalSupply(0)).to.eq(10);

  //   expect(await traits.maxSupply(0)).to.eq(10);

  //   // User has 10 of trait 0
  //   expect(await traits.balanceOf(user1.address, 0)).to.eq(10);

  //   await expect(
  //     traits.connect(user1).buyTraits(user1.address, [0], [1], {
  //       value: ethers.utils.parseEther("1"),
  //     })
  //   ).to.be.revertedWith("MaxSupply()");
  // });

  // it("transferTraitsToCreateArtwork() can only be called by the Artwork contract", async () => {
  //   await expect(
  //     traits.connect(user1).transferTraitsToCreateArtwork(user1.address, [0, 3])
  //   ).to.be.revertedWith("OnlyArtwork()");

  //   await expect(
  //     traits
  //       .connect(user1)
  //       .transferTraitsToCreateArtwork(artwork.address, [0, 3])
  //   ).to.be.revertedWith("OnlyArtwork()");
  // });

  // it("Traits contract address cannot be set twice", async () => {
  //   await expect(
  //     artwork.connect(owner).setTraits(traits.address)
  //   ).to.be.revertedWith("TraitsAlreadySet()");
  // });

  // it("Project configuration cannot be updated once the project is locked", async () => {
  //   await expect(
  //     artwork.connect(owner).updateScript(0, "test script")
  //   ).to.be.revertedWith("Locked");

  //   await expect(
  //     traits
  //       .connect(owner)
  //       .createTraitsAndTypes(
  //         ["Hair Color", "Eye Color"],
  //         ["hairColor", "eyeColor"],
  //         ["Blonde", "Brown", "Black", "Green", "Blue"],
  //         ["blonde", "brown", "black", "green", "blue"],
  //         [0, 0, 0, 1, 1],
  //         [10, 20, 30, 40, 50]
  //       )
  //   ).to.be.revertedWith("Locked");
  // });

  // it("Individual traits cannot be bought before trait sales start time", async () => {
  //   // Go to start of auction period
  //   await time.increaseTo(traitsSaleStartTime - 10);

  //   await expect(
  //     traits.connect(user1).buyTraits(user1.address, [0], [1], {
  //       value: ethers.utils.parseEther("1"),
  //     })
  //   ).to.be.revertedWith("TraitsSaleStartTime()");
  // });
});
