import {
  Artwork,
  Artwork__factory,
  ProjectRegistry,
  ProjectRegistry__factory,
  Traits,
  Traits__factory,
} from "../typechain-types";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Deployment and setup", function () {
  let traits: Traits;
  let artwork: Artwork;
  let projectRegistry: ProjectRegistry;

  let deployer: SignerWithAddress;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let admin1: SignerWithAddress;
  let admin2: SignerWithAddress;
  let artistRevenueClaimer: SignerWithAddress;
  let platformRevenueClaimer: SignerWithAddress;

  beforeEach(async function () {
    [
      deployer,
      owner,
      user1,
      admin1,
      admin2,
      artistRevenueClaimer,
      platformRevenueClaimer,
    ] = await ethers.getSigners();
  });

  it("Artwork contract can't be deployed with invalid array lengths", async () => {
    await expect(
      new Artwork__factory(deployer).deploy(
        1000,
        "Intrinsic.art Disentanglement",
        "INSC",
        "https://artwork.intrinsic.art/",
        "testJSON",
        owner.address,
        [artistRevenueClaimer.address],
        [90, 10]
      )
    ).to.be.revertedWith("PaymentSplitter: payees and shares length mismatch");

    await expect(
      new Artwork__factory(deployer).deploy(
        1000,
        "Intrinsic.art Disentanglement",
        "INSC",
        "https://artwork.intrinsic.art/",
        "testJSON",
        owner.address,
        [artistRevenueClaimer.address, platformRevenueClaimer.address],
        [90]
      )
    ).to.be.revertedWith("PaymentSplitter: payees and shares length mismatch");

    await expect(
      new Artwork__factory(deployer).deploy(
        1000,
        "Intrinsic.art Disentanglement",
        "INSC",
        "https://artwork.intrinsic.art/",
        "testJSON",
        owner.address,
        [],
        []
      )
    ).to.be.revertedWith("PaymentSplitter: no payees");
  });

  it("Only the owner can set the traits on the Artwork contract", async () => {
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

    expect(await artwork.traits()).to.eq(ethers.constants.AddressZero);

    await expect(
      artwork.connect(user1).setTraits(user1.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await artwork.connect(owner).setTraits(user1.address);

    expect(await artwork.traits()).to.eq(user1.address);
  });

  it("Only the owner can update scripts on the Artwork contract", async () => {
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

    expect(await artwork.projectScripts()).to.deep.eq([]);

    await expect(
      artwork.connect(user1).updateScript(0, "test script")
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await artwork.connect(owner).updateScript(0, "test script 2");

    expect(await artwork.projectScripts()).to.deep.eq(["test script 2"]);
  });

  it("Only the owner can update the base URI on the Artwork contract", async () => {
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

    expect(await artwork.baseURI()).to.eq("https://artwork.intrinsic.art/");

    await expect(
      artwork.connect(user1).updateBaseURI("new URI")
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await artwork.connect(owner).updateBaseURI("new URI 2");

    expect(await artwork.baseURI()).to.eq("new URI 2");
  });

  it("Artwork contract can only be locked by the owner", async () => {
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

    artwork.connect(owner).setTraits(user1.address);

    expect(await artwork.locked()).to.eq(false);

    await artwork.connect(owner).lockProject();

    expect(await artwork.locked()).to.eq(true);
  });

  it("Artwork contract can't be locked if the Traits conract hasn't been set", async () => {
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

    await expect(artwork.connect(owner).lockProject()).to.be.revertedWith(
      "TraitsNotSet()"
    );
  });

  it("Artwork contract can't be locked twice", async () => {
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

    await artwork.connect(owner).setTraits(user1.address);

    await artwork.connect(owner).lockProject();

    await expect(artwork.connect(owner).lockProject()).to.be.revertedWith(
      "Locked()"
    );
  });

  it("Traits contract can't be deployed with invalid array lengths", async () => {
    await expect(
      new Traits__factory(deployer).deploy(
        1000,
        "https://trait.intrinsic.art/",
        owner.address,
        owner.address,
        [],
        [90, 10],
        [artistRevenueClaimer.address, platformRevenueClaimer.address],
        [90, 10]
      )
    ).to.be.revertedWith("PaymentSplitter: payees and shares length mismatch");

    await expect(
      new Traits__factory(deployer).deploy(
        1000,
        "https://trait.intrinsic.art/",
        owner.address,
        owner.address,
        [artistRevenueClaimer.address, platformRevenueClaimer.address],
        [90, 10],
        [artistRevenueClaimer.address, platformRevenueClaimer.address],
        [90, 10, 20]
      )
    ).to.be.revertedWith("PaymentSplitter: payees and shares length mismatch");
  });

  it("Traits and trait types can't be set by non-owner", async () => {
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

    await expect(
      traits
        .connect(user1)
        .createTraitsAndTypes(
          ["Hair Color", "Eye Color"],
          ["hairColor", "eyeColor"],
          ["Blonde", "Brown", "Black", "Green", "Blue"],
          ["blonde", "brown", "black", "green", "blue"],
          [0, 0, 0, 1, 1],
          [10, 20, 30, 40, 50]
        )
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Traits and trait types can't be set with invalid array lengths", async () => {
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

    await expect(
      traits
        .connect(owner)
        .createTraitsAndTypes(
          ["Hair Color", "Eye Color"],
          ["hairColor"],
          ["Blonde", "Brown", "Black", "Green", "Blue"],
          ["blonde", "brown", "black", "green", "blue"],
          [0, 0, 0, 1, 1],
          [10, 20, 30, 40, 50]
        )
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      traits
        .connect(owner)
        .createTraitsAndTypes(
          ["Hair Color", "Eye Color"],
          ["hairColor", "eyeColor"],
          ["Blonde", "Brown", "Black", "Green", "Blue"],
          ["blonde", "brown", "black", "green"],
          [0, 0, 0, 1, 1],
          [10, 20, 30, 40, 50]
        )
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      traits
        .connect(owner)
        .createTraitsAndTypes(
          ["Hair Color", "Eye Color"],
          ["hairColor", "eyeColor"],
          ["Blonde", "Brown", "Black", "Green", "Blue"],
          ["blonde", "brown", "black", "green", "blue"],
          [0, 0, 0, 1, 1],
          [10, 20, 30, 40]
        )
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      traits
        .connect(owner)
        .createTraitsAndTypes(
          [],
          [],
          ["Blonde", "Brown", "Black", "Green", "Blue"],
          ["blonde", "brown", "black", "green", "blue"],
          [0, 0, 0, 1, 1],
          [10, 20, 30, 40, 50]
        )
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      traits
        .connect(owner)
        .createTraitsAndTypes(
          ["Hair Color", "Eye Color"],
          ["hairColor", "eyeColor"],
          [],
          [],
          [],
          []
        )
    ).to.be.revertedWith("InvalidArrayLengths()");
  });

  it("Auction can't be scheduled by non-owner", async () => {
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

    await artwork.connect(owner).setTraits(traits.address);

    await artwork.connect(owner).lockProject();

    const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    const auctionStartTime = currentTime + 110;
    const auctionEndTime = currentTime + 210;
    const auctionStartPrice = ethers.utils.parseEther("1");
    const auctionEndPrice = ethers.utils.parseEther("0.1");

    await expect(
      traits
        .connect(user1)
        .scheduleAuction(
          auctionStartTime,
          auctionEndTime,
          auctionStartPrice,
          auctionEndPrice
        )
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Auction can't be scheduled if project isn't locked yet", async () => {
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

    await artwork.connect(owner).setTraits(traits.address);

    const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    const auctionStartTime = currentTime + 110;
    const auctionEndTime = currentTime + 210;
    const auctionStartPrice = ethers.utils.parseEther("1");
    const auctionEndPrice = ethers.utils.parseEther("0.1");

    await expect(
      traits
        .connect(owner)
        .scheduleAuction(
          auctionStartTime,
          auctionEndTime,
          auctionStartPrice,
          auctionEndPrice
        )
    ).to.be.revertedWith("NotLocked()");
  });

  it("Auction can't be scheduled with invalid times or prices", async () => {
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

    await artwork.connect(owner).setTraits(traits.address);

    await artwork.connect(owner).lockProject();

    const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    const auctionStartTime = currentTime + 110;
    const auctionEndTime = currentTime + 210;
    const auctionStartPrice = ethers.utils.parseEther("1");
    const auctionEndPrice = ethers.utils.parseEther("0.1");

    // Flip the start time and end time to make auction invalid
    await expect(
      traits
        .connect(owner)
        .scheduleAuction(
          auctionEndTime,
          auctionStartTime,
          auctionStartPrice,
          auctionEndPrice
        )
    ).to.be.revertedWith("InvalidAuction()");

    // Flip the start price and end price to make auction invalid
    await expect(
      traits
        .connect(owner)
        .scheduleAuction(
          auctionStartTime,
          auctionEndTime,
          auctionEndPrice,
          auctionStartPrice
        )
    ).to.be.revertedWith("InvalidAuction()");
  });

  it("Traits URI can only be updated by the owner", async () => {
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

    expect(await traits.uri(0)).to.eq(
      `https://trait.intrinsic.art/${traits.address.toLowerCase()}/0`
    );

    await expect(traits.connect(user1).updateURI("newURI")).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );

    await traits.connect(owner).updateURI("https://newURI2/");

    expect(await traits.uri(0)).to.eq(
      `https://newURI2/${traits.address.toLowerCase()}/0`
    );
  });

  it("Traits and trait types can only be created once", async () => {
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
    ).to.be.revertedWith("TraitsAlreadyCreated()");
  });

  it("Project Registry correctly handles access control", async () => {
    projectRegistry = await new ProjectRegistry__factory(deployer).deploy(
      owner.address,
      [admin1.address, admin2.address]
    );

    expect(await projectRegistry.owner()).to.eq(owner.address);
    expect(await projectRegistry.admins(admin1.address)).to.eq(true);
    expect(await projectRegistry.admins(admin2.address)).to.eq(true);
    expect(await projectRegistry.admins(owner.address)).to.eq(false);
    expect(await projectRegistry.admins(deployer.address)).to.eq(false);

    await projectRegistry
      .connect(admin1)
      .registerProject(user1.address, deployer.address);

    await expect(
      projectRegistry
        .connect(user1)
        .registerProject(user1.address, deployer.address)
    ).to.be.revertedWith("OnlyAdmin()");

    expect(await projectRegistry.projects(1)).to.deep.eq([
      user1.address,
      deployer.address,
    ]);

    await expect(
      projectRegistry.connect(admin1).addAdmins([user1.address])
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(
      projectRegistry.connect(user1).addAdmins([user1.address])
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(
      projectRegistry.connect(admin1).removeAdmins([admin2.address])
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(
      projectRegistry.connect(user1).addAdmins([admin1.address])
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await projectRegistry.connect(owner).addAdmins([user1.address]);

    expect(await projectRegistry.admins(admin1.address)).to.eq(true);
    expect(await projectRegistry.admins(admin2.address)).to.eq(true);
    expect(await projectRegistry.admins(user1.address)).to.eq(true);

    await projectRegistry
      .connect(user1)
      .registerProject(admin1.address, admin2.address);

    expect(await projectRegistry.projects(2)).to.deep.eq([
      admin1.address,
      admin2.address,
    ]);

    await projectRegistry
      .connect(owner)
      .removeAdmins([admin1.address, admin2.address, user1.address]);

    expect(await projectRegistry.admins(admin1.address)).to.eq(false);
    expect(await projectRegistry.admins(admin2.address)).to.eq(false);
    expect(await projectRegistry.admins(user1.address)).to.eq(false);
  });
});
