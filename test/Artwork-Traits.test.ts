import {
  Artwork,
  Artwork__factory,
  Traits,
  Traits__factory,
  PaymentSplitter,
} from "../typechain-types";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import time from "./helpers/time";
import { artworkHash } from "./helpers/utilities";

describe("Artwork and Traits", function () {
  let traits: Traits;
  let artwork: Artwork;
  let traitsRoyaltySplitter: PaymentSplitter;
  let artworkRoyaltySplitter: PaymentSplitter;

  let deployer: SignerWithAddress;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let artistRevenueClaimer: SignerWithAddress;
  let platformRevenueClaimer: SignerWithAddress;

  let currentTime;
  let auctionStartTime: number;
  let auctionEndTime: number;
  let auctionStartPrice: BigNumber;
  let auctionEndPrice: BigNumber;

  beforeEach(async function () {
    [
      deployer,
      owner,
      user1,
      user2,
      artistRevenueClaimer,
      platformRevenueClaimer,
    ] = await ethers.getSigners();

    artwork = await new Artwork__factory(deployer).deploy(
      1000,
      "Intrinsic.art Disentanglement",
      "INSC",
      "https://artwork.intrinsic.art/",
      "testJSON",
      owner.address,
      [artistRevenueClaimer.address, platformRevenueClaimer.address],
      [90, 10]
    );

    traits = await new Traits__factory(deployer).deploy(
      1000,
      "https://trait.intrinsic.art/",
      artwork.address,
      owner.address,
      [artistRevenueClaimer.address, platformRevenueClaimer.address],
      [90, 10],
      [artistRevenueClaimer.address, platformRevenueClaimer.address],
      [90, 10]
    );

    artworkRoyaltySplitter = await ethers.getContractAt(
      "PaymentSplitter",
      await artwork.royaltySplitter()
    );

    traitsRoyaltySplitter = await ethers.getContractAt(
      "PaymentSplitter",
      await traits.royaltySplitter()
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
        [10, 20, 30, 40, 50]
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

  it("Initializes the Artwork contract", async () => {
    expect(await artwork.traits()).to.eq(traits.address);
    expect(await artwork.name()).to.eq("Intrinsic.art Disentanglement");
    expect(await artwork.symbol()).to.eq("INSC");
    expect(await artwork.baseURI()).to.eq("https://artwork.intrinsic.art/");
    expect(await artwork.projectScriptCount()).to.eq(2);
    expect(await artwork.projectScripts()).to.deep.eq([
      "Test Script 1",
      "Test Script 2",
    ]);
    expect(await artwork.scriptJSON()).to.eq("testJSON");
    expect(await artwork.owner()).to.eq(owner.address);
    expect(await artwork.royaltyInfo(0, 1000)).to.deep.eq([
      artworkRoyaltySplitter.address,
      BigNumber.from(100),
    ]);
    expect(await artwork.nextTokenId()).to.eq(0);
    expect(await artwork.locked()).to.eq(true);
    expect(await artwork.VERSION()).to.eq("1.0.0");
    expect(await artwork.royaltySplitter()).to.eq(
      artworkRoyaltySplitter.address
    );
    expect(await artwork.supportsInterface("0x80ac58cd")).to.eq(true);
  });

  it("Initializes the Traits contract", async () => {
    expect(await traits.artwork()).to.eq(artwork.address);
    expect(await traits.royaltySplitter()).to.eq(traitsRoyaltySplitter.address);
    expect(await traits.VERSION()).to.eq("1.0.0");
    expect(await traits.auctionStartTime()).to.eq(auctionStartTime);
    expect(await traits.auctionEndTime()).to.eq(auctionEndTime);
    expect(await traits.auctionStartPrice()).to.eq(auctionStartPrice);
    expect(await traits.auctionEndPrice()).to.eq(auctionEndPrice);
    expect(await traits.uri(0)).to.eq(
      `https://trait.intrinsic.art/${traits.address.toLowerCase()}/0`
    );

    expect(await traits.supportsInterface("0xd9b67a26")).to.eq(true);

    expect(await traits.royaltyInfo(0, 1000)).to.deep.eq([
      traitsRoyaltySplitter.address,
      BigNumber.from(100),
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
    expect(await artworkRoyaltySplitter.totalShares()).to.eq(100);
    expect(
      await artworkRoyaltySplitter.shares(artistRevenueClaimer.address)
    ).to.eq(90);
    expect(
      await artworkRoyaltySplitter.shares(platformRevenueClaimer.address)
    ).to.eq(10);
    expect(await artworkRoyaltySplitter.payee(0)).to.eq(
      artistRevenueClaimer.address
    );
    expect(await artworkRoyaltySplitter.payee(1)).to.eq(
      platformRevenueClaimer.address
    );

    expect(await traitsRoyaltySplitter.totalShares()).to.eq(100);
    expect(
      await traitsRoyaltySplitter.shares(artistRevenueClaimer.address)
    ).to.eq(90);
    expect(
      await traitsRoyaltySplitter.shares(platformRevenueClaimer.address)
    ).to.eq(10);
    expect(await traitsRoyaltySplitter.payee(0)).to.eq(
      artistRevenueClaimer.address
    );
    expect(await traitsRoyaltySplitter.payee(1)).to.eq(
      platformRevenueClaimer.address
    );
  });

  it("A user can create artwork and decompose it", async () => {
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
      .buyTraitsCreateArtwork([0, 3], [1, 1], [0, 3], {
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
      artworkHash(artwork.address, user1.address, 0),
    ]);

    expect(await artwork.userNonce(user1.address)).to.eq(1);

    expect(await traits.balanceOf(user1.address, 0)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 3)).to.eq(0);

    await artwork.connect(user1).decomposeArtwork(0);

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
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(120));

    const ethAmount = (await traits.traitPrice()).mul(2);

    await artwork
      .connect(user1)
      .buyTraitsCreateArtwork([0, 3], [1, 1], [0, 3], {
        value: ethAmount,
      });

    await artwork
      .connect(user1)
      .buyTraitsCreateArtwork([0, 3], [1, 1], [0, 3], {
        value: ethAmount,
      });

    expect(await artwork.tokenURI(0)).to.eq(
      `https://artwork.intrinsic.art/${artwork.address.toLowerCase()}/0`
    );

    expect(await artwork.tokenURI(1)).to.eq(
      `https://artwork.intrinsic.art/${artwork.address.toLowerCase()}/1`
    );

    await expect(artwork.tokenURI(2)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );

    await expect(artwork.tokenURI(3)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );

    expect(await traits.uri(0)).to.eq(
      `https://trait.intrinsic.art/${traits.address.toLowerCase()}/0`
    );

    expect(await traits.uri(4)).to.eq(
      `https://trait.intrinsic.art/${traits.address.toLowerCase()}/4`
    );

    await expect(traits.uri(5)).to.be.revertedWith("InvalidTokenId()");

    await expect(traits.uri(6)).to.be.revertedWith("InvalidTokenId()");
  });

  it("Artwork token IDs increment even if previous ones are decomposed", async () => {
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
      .buyTraitsCreateArtwork([0, 3], [1, 1], [0, 3], {
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
      artworkHash(artwork.address, user1.address, 0),
    ]);

    await artwork.connect(user1).decomposeArtwork(0);

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

    // Create artwork 1
    await artwork.connect(user1).createArtwork([0, 3]);

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
      artworkHash(artwork.address, user1.address, 1),
    ]);

    await artwork.connect(user1).decomposeArtwork(1);

    // Create artwork 2
    await artwork
      .connect(user1)
      .buyTraitsCreateArtwork([1, 4], [1, 1], [1, 4], {
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
      artworkHash(artwork.address, user1.address, 2),
    ]);
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
    expect(await artwork.userNonce(user1.address)).to.eq(0);
    await expect(artwork.artwork(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );

    expect(await traits.balanceOf(user1.address, 0)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 1)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 2)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 3)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 4)).to.eq(0);

    await traits.connect(user1).buyTraits(user1.address, [1, 4], [2, 2], {
      value: ethAmount,
    });

    expect(await traits.balanceOf(user1.address, 0)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 1)).to.eq(2);
    expect(await traits.balanceOf(user1.address, 2)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 3)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 4)).to.eq(2);

    await artwork.connect(user1).createArtwork([1, 4]);

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
      artworkHash(artwork.address, user1.address, 0),
    ]);

    expect(await artwork.userNonce(user1.address)).to.eq(1);

    expect(await traits.balanceOf(user1.address, 0)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 3)).to.eq(0);

    await artwork.connect(user1).decomposeArtwork(0);

    await expect(artwork.artwork(0)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );
    expect(await traits.balanceOf(user1.address, 0)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 1)).to.eq(2);
    expect(await traits.balanceOf(user1.address, 2)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 3)).to.eq(0);
    expect(await traits.balanceOf(user1.address, 4)).to.eq(2);
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

    // Ensure price stays at the end price
    await time.increase(time.duration.seconds(1000));

    expect(await traits.traitPrice()).to.eq(auctionEndPrice);
  });

  it("Users cannot create artwork with traits they don't own", async () => {
    // Go to start of auction period
    await time.increaseTo(auctionStartTime);

    await expect(
      artwork.connect(user1).createArtwork([0, 3])
    ).to.be.revertedWith("ERC1155: insufficient balance for transfer");
  });

  it("Users cannot create artwork with traits that are sold out", async () => {
    // Go to start of auction period
    await time.increaseTo(auctionStartTime);

    // Buy x10 of trait 0 with 10 ETH, trait is sold out now
    await traits.connect(user1).buyTraits(user1.address, [0], [10], {
      value: ethers.utils.parseEther("10"),
    });

    await traits.connect(user2).buyTraits(user1.address, [3], [1], {
      value: ethers.utils.parseEther("10"),
    });

    const ethAmount = await traits.traitPrice();

    await expect(
      artwork.connect(user2).buyTraitsCreateArtwork([0], [1], [0, 3], {
        value: ethAmount,
      })
    ).to.be.revertedWith("MaxSupply()");
  });

  it("Users can't decompose artwork they don't own", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(120));

    const ethAmount = (await traits.traitPrice()).mul(2);

    // User 1 creates artwork 0
    await artwork
      .connect(user1)
      .buyTraitsCreateArtwork([0, 3], [1, 1], [0, 3], {
        value: ethAmount,
      });

    await expect(artwork.connect(user2).decomposeArtwork(0)).to.be.revertedWith(
      "OnlyArtworkOwner()"
    );
  });

  it("Users can't create artwork that doesn't have a trait from each type", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(120));

    const ethAmount = (await traits.traitPrice()).mul(2);

    await expect(
      artwork.connect(user1).buyTraitsCreateArtwork([0, 2], [1, 1], [0, 2], {
        value: ethAmount,
      })
    ).to.be.revertedWith("InvalidTraits()");

    await expect(
      artwork.connect(user1).buyTraitsCreateArtwork([0, 0], [1, 1], [0, 0], {
        value: ethAmount,
      })
    ).to.be.revertedWith("InvalidTraits()");

    await expect(
      artwork.connect(user1).buyTraitsCreateArtwork([2, 2], [1, 1], [2, 2], {
        value: ethAmount,
      })
    ).to.be.revertedWith("InvalidTraits()");

    await expect(
      artwork.connect(user1).buyTraitsCreateArtwork([3, 4], [1, 1], [3, 4], {
        value: ethAmount,
      })
    ).to.be.revertedWith("InvalidTraits()");

    await expect(
      artwork.connect(user1).buyTraitsCreateArtwork([4, 4], [1, 1], [4, 4], {
        value: ethAmount,
      })
    ).to.be.revertedWith("InvalidTraits()");

    await expect(
      artwork.connect(user1).buyTraitsCreateArtwork([3, 0], [1, 1], [3, 0], {
        value: ethAmount,
      })
    ).to.be.revertedWith("InvalidTraits()");
  });

  it("Users can't buy traits if invalid arrays are passed", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(120));

    const traitPrice = await traits.traitPrice();

    await expect(
      traits.connect(user1).buyTraits(user1.address, [0, 3, 4], [1, 1], {
        value: traitPrice.mul(3),
      })
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      traits.connect(user1).buyTraits(user1.address, [0, 3, 4], [], {
        value: traitPrice.mul(3),
      })
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      traits.connect(user1).buyTraits(user1.address, [0], [1, 2], {
        value: traitPrice.mul(3),
      })
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      traits.connect(user1).buyTraits(user1.address, [], [1, 2, 2], {
        value: traitPrice.mul(3),
      })
    ).to.be.revertedWith("InvalidArrayLengths()");
  });

  it("Users can't buy traits if not enough ETH is sent", async () => {
    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(120));

    const traitPrice = await traits.traitPrice();

    await expect(
      traits.connect(user1).buyTraits(user1.address, [0, 3, 4], [1, 1, 1], {
        value: traitPrice.mul(29).div(10),
      })
    ).to.be.revertedWith("InvalidEthAmount()");

    await expect(
      traits.connect(user1).buyTraits(user1.address, [0], [5], {
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
        .buyTraitsCreateArtwork([0, 3, 4], [1, 1, 1], [0, 3, 4], {
          value: traitPrice.mul(3),
        })
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      artwork.connect(user1).buyTraitsCreateArtwork([0], [1], [0], {
        value: traitPrice.mul(1),
      })
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      artwork
        .connect(user1)
        .buyTraitsCreateArtwork([0, 2, 3, 4], [1, 1, 1, 1], [0, 2, 3, 4], {
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
    await time.increase(time.duration.seconds(120));

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

    await traits.connect(user1).buyTraits(user1.address, [0], [10], {
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

    await traits.connect(user1).buyTraits(user1.address, [1, 2], [10, 10], {
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
    await time.increaseTo(auctionStartTime);

    expect(await traits.maxSupply(0)).to.eq(10);

    // User has 0 of trait 0
    expect(await traits.balanceOf(user1.address, 0)).to.eq(0);

    expect(await traits.totalSupply(0)).to.eq(0);

    // Buy x1 of trait 0 with 1 ETH
    await traits.connect(user1).buyTraits(user1.address, [0], [1], {
      value: ethers.utils.parseEther("1"),
    });

    expect(await traits.totalSupply(0)).to.eq(1);

    // User has 1 of trait 0
    expect(await traits.balanceOf(user1.address, 0)).to.eq(1);

    await expect(
      traits.connect(user1).buyTraits(user1.address, [0], [10], {
        value: ethers.utils.parseEther("10"),
      })
    ).to.be.revertedWith("MaxSupply()");

    await traits.connect(user1).buyTraits(user1.address, [0], [9], {
      value: ethers.utils.parseEther("10"),
    });

    expect(await traits.totalSupply(0)).to.eq(10);

    expect(await traits.maxSupply(0)).to.eq(10);

    // User has 10 of trait 0
    expect(await traits.balanceOf(user1.address, 0)).to.eq(10);

    await expect(
      traits.connect(user1).buyTraits(user1.address, [0], [1], {
        value: ethers.utils.parseEther("1"),
      })
    ).to.be.revertedWith("MaxSupply()");
  });

  it("transferTraitsToCreateArtwork() can only be called by the Artwork contract", async () => {
    await expect(
      traits.connect(user1).transferTraitsToCreateArtwork(user1.address, [0, 3])
    ).to.be.revertedWith("OnlyArtwork()");

    await expect(
      traits
        .connect(user1)
        .transferTraitsToCreateArtwork(artwork.address, [0, 3])
    ).to.be.revertedWith("OnlyArtwork()");
  });

  it("Traits contract address cannot be set twice", async () => {
    await expect(
      artwork.connect(owner).setTraits(traits.address)
    ).to.be.revertedWith("TraitsAlreadySet()");
  });

  it("Project configuration cannot be updated once the project is locked", async () => {
    await expect(
      artwork.connect(owner).updateScript(0, "test script")
    ).to.be.revertedWith("Locked");

    await expect(
      traits
        .connect(owner)
        .createTraitsAndTypes(
          ["Hair Color", "Eye Color"],
          ["hairColor", "eyeColor"],
          ["Blonde", "Brown", "Black", "Green", "Blue"],
          ["blonde", "brown", "black", "green", "blue"],
          [0, 0, 0, 1, 1],
          [10, 20, 30, 40, 50]
        )
    ).to.be.revertedWith("Locked");
  });
});
