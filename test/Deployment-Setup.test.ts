import {
  Artwork,
  Artwork__factory,
  MockScriptStorage1,
  MockScriptStorage1__factory,
  MockScriptStorage2,
  MockScriptStorage2__factory,
  ProjectRegistry,
  ProjectRegistry__factory,
  Traits,
  Traits__factory,
} from "../typechain-types";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";

describe("Deployment and setup", function () {
  let projectRegistry: ProjectRegistry;
  let scriptStorage1: MockScriptStorage1;
  let scriptStorage2: MockScriptStorage2;
  let artwork: Artwork;
  let traits: Traits;

  let deployer: SignerWithAddress;
  let artist: SignerWithAddress;
  let user1: SignerWithAddress;
  let whitelistedUser1: SignerWithAddress;
  let whitelistedUser2: SignerWithAddress;
  let artistRevenueClaimer: SignerWithAddress;
  let platformRevenueClaimer: SignerWithAddress;
  let projectRegistryOwner: SignerWithAddress;
  let projectRegistryAdmin1: SignerWithAddress;
  let projectRegistryAdmin2: SignerWithAddress;

  let currentTime;
  let auctionStartTime: number;
  let auctionEndTime: number;
  let auctionStartPrice: BigNumber;
  let auctionEndPrice: BigNumber;
  let auctionPriceSteps: number;
  let traitsSaleStartTime: number;
  let whitelistStartTime: number;

  const abiCoder = ethers.utils.defaultAbiCoder;

  beforeEach(async function () {
    [
      deployer,
      artist,
      whitelistedUser1,
      whitelistedUser2,
      user1,
      artistRevenueClaimer,
      platformRevenueClaimer,
      projectRegistryOwner,
      projectRegistryAdmin1,
      projectRegistryAdmin2,
    ] = await ethers.getSigners();

    projectRegistry = await new ProjectRegistry__factory(deployer).deploy(
      projectRegistryOwner.address,
      [projectRegistryAdmin1.address],
      "https://intrinsic.art/"
    );

    scriptStorage1 = await new MockScriptStorage1__factory(deployer).deploy();
    scriptStorage2 = await new MockScriptStorage2__factory(deployer).deploy();
  });

  it("Artwork contract can't be deployed with invalid array lengths", async () => {
    await expect(
      new Artwork__factory(deployer).deploy(
        "Intrinsic.art Disentanglement",
        "INSC",
        "testJSON",
        artist.address,
        projectRegistry.address,
        [scriptStorage1.address, scriptStorage2.address],
        1000,
        [artistRevenueClaimer.address],
        [90, 10]
      )
    ).to.be.revertedWith("PaymentSplitter: payees and shares length mismatch");

    await expect(
      new Artwork__factory(deployer).deploy(
        "Intrinsic.art Disentanglement",
        "INSC",
        "testJSON",
        artist.address,
        projectRegistry.address,
        [scriptStorage1.address, scriptStorage2.address],
        1000,
        [artistRevenueClaimer.address, platformRevenueClaimer.address],
        [90]
      )
    ).to.be.revertedWith("PaymentSplitter: payees and shares length mismatch");

    await expect(
      new Artwork__factory(deployer).deploy(
        "Intrinsic.art Disentanglement",
        "INSC",
        "testJSON",
        artist.address,
        projectRegistry.address,
        [scriptStorage1.address, scriptStorage2.address],
        1000,
        [],
        []
      )
    ).to.be.revertedWith("PaymentSplitter: no payees");
  });

  it("Only an admin can update the base URI on the project registry", async () => {
    expect(await projectRegistry.baseURI()).to.eq("https://intrinsic.art/");

    await expect(
      projectRegistry.connect(user1).updateBaseURI("new URI")
    ).to.be.revertedWith("OnlyAdmin()");

    await projectRegistry
      .connect(projectRegistryAdmin1)
      .updateBaseURI("new URI 2");

    expect(await projectRegistry.baseURI()).to.eq("new URI 2");
  });

  it("Traits contract can't be deployed with invalid array lengths", async () => {
    await expect(
      new Traits__factory(deployer).deploy(
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
        [artistRevenueClaimer.address],
        [90, 10],
        [whitelistedUser1.address, whitelistedUser2.address],
        [1, 1]
      )
    ).to.be.revertedWith("PaymentSplitter: payees and shares length mismatch");

    await expect(
      new Traits__factory(deployer).deploy(
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
        [90],
        [whitelistedUser1.address, whitelistedUser2.address],
        [1, 1]
      )
    ).to.be.revertedWith("PaymentSplitter: payees and shares length mismatch");

    await expect(
      new Traits__factory(deployer).deploy(
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
        [1]
      )
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      new Traits__factory(deployer).deploy(
        "Intrinsic.art Traits",
        "INSC",
        projectRegistry.address,
        {
          traitTypeNames: ["Hair Color"],
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
      )
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      new Traits__factory(deployer).deploy(
        "Intrinsic.art Traits",
        "INSC",
        projectRegistry.address,
        {
          traitTypeNames: ["Hair Color", "Eye Color"],
          traitTypeValues: ["hairColor", "eyeColor"],
          traitNames: ["Blonde", "Brown", "Black", "Green"],
          traitValues: ["blonde", "brown", "black", "green", "blue"],
          traitTypeIndexes: [0, 0, 0, 1, 1],
          traitMaxSupplys: [10, 20, 30, 40, 50],
        },
        [artistRevenueClaimer.address, platformRevenueClaimer.address],
        [90, 10],
        [whitelistedUser1.address, whitelistedUser2.address],
        [1, 1]
      )
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      new Traits__factory(deployer).deploy(
        "Intrinsic.art Traits",
        "INSC",
        projectRegistry.address,
        {
          traitTypeNames: ["Hair Color", "Eye Color"],
          traitTypeValues: ["hairColor", "eyeColor"],
          traitNames: ["Blonde", "Brown", "Black", "Green", "Blue"],
          traitValues: ["blonde", "brown", "black", "green"],
          traitTypeIndexes: [0, 0, 0, 1, 1],
          traitMaxSupplys: [10, 20, 30, 40, 50],
        },
        [artistRevenueClaimer.address, platformRevenueClaimer.address],
        [90, 10],
        [whitelistedUser1.address, whitelistedUser2.address],
        [1, 1]
      )
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      new Traits__factory(deployer).deploy(
        "Intrinsic.art Traits",
        "INSC",
        projectRegistry.address,
        {
          traitTypeNames: ["Hair Color", "Eye Color"],
          traitTypeValues: ["hairColor", "eyeColor"],
          traitNames: ["Blonde", "Brown", "Black", "Green", "Blue"],
          traitValues: ["blonde", "brown", "black", "green", "blue"],
          traitTypeIndexes: [0, 0, 0, 1],
          traitMaxSupplys: [10, 20, 30, 40, 50],
        },
        [artistRevenueClaimer.address, platformRevenueClaimer.address],
        [90, 10],
        [whitelistedUser1.address, whitelistedUser2.address],
        [1, 1]
      )
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      new Traits__factory(deployer).deploy(
        "Intrinsic.art Traits",
        "INSC",
        projectRegistry.address,
        {
          traitTypeNames: ["Hair Color", "Eye Color"],
          traitTypeValues: ["hairColor", "eyeColor"],
          traitNames: ["Blonde", "Brown", "Black", "Green", "Blue"],
          traitValues: ["blonde", "brown", "black", "green", "blue"],
          traitTypeIndexes: [0, 0, 0, 1, 1],
          traitMaxSupplys: [10, 20, 30, 40],
        },
        [artistRevenueClaimer.address, platformRevenueClaimer.address],
        [90, 10],
        [whitelistedUser1.address, whitelistedUser2.address],
        [1, 1]
      )
    ).to.be.revertedWith("InvalidArrayLengths()");
  });

  it("Auction can't be scheduled with invalid times or prices", async () => {
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

    // should be invalid since auction start time is after end time
    currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    auctionStartTime = currentTime + 110;
    auctionEndTime = auctionStartTime - 1;
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

    await expect(
      projectRegistry
        .connect(projectRegistryAdmin1)
        .registerProject(
          artwork.address,
          encodedArtworkData,
          traits.address,
          encodedTraitsData
        )
    ).to.be.revertedWith("InvalidAuction()");
  });

  it("Project Registry correctly handles access control", async () => {
    projectRegistry = await new ProjectRegistry__factory(deployer).deploy(
      projectRegistryOwner.address,
      [projectRegistryAdmin1.address, projectRegistryAdmin2.address],
      "test URI"
    );

    expect(await projectRegistry.owner()).to.eq(projectRegistryOwner.address);
    expect(await projectRegistry.admins(projectRegistryAdmin1.address)).to.eq(
      true
    );
    expect(await projectRegistry.admins(projectRegistryAdmin2.address)).to.eq(
      true
    );
    expect(await projectRegistry.admins(projectRegistryOwner.address)).to.eq(
      false
    );
    expect(await projectRegistry.admins(deployer.address)).to.eq(false);

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

    // should be invalid since auction start time is after end time
    currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    auctionStartTime = currentTime + 110;
    auctionEndTime = auctionStartTime + 210;
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
      .connect(projectRegistryAdmin1)
      .registerProject(
        artwork.address,
        encodedArtworkData,
        traits.address,
        encodedTraitsData
      );

    await expect(
      projectRegistry
        .connect(user1)
        .registerProject(
          artwork.address,
          encodedArtworkData,
          traits.address,
          encodedTraitsData
        )
    ).to.be.revertedWith("OnlyAdmin()");

    expect(await projectRegistry.projects(1)).to.deep.eq([
      artwork.address,
      traits.address,
    ]);

    await expect(
      projectRegistry.connect(projectRegistryAdmin1).addAdmins([user1.address])
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(
      projectRegistry.connect(user1).addAdmins([user1.address])
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(
      projectRegistry
        .connect(projectRegistryAdmin1)
        .removeAdmins([projectRegistryAdmin2.address])
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(
      projectRegistry.connect(user1).addAdmins([projectRegistryAdmin1.address])
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await projectRegistry
      .connect(projectRegistryOwner)
      .addAdmins([user1.address]);

    expect(await projectRegistry.admins(projectRegistryAdmin1.address)).to.eq(
      true
    );
    expect(await projectRegistry.admins(projectRegistryAdmin2.address)).to.eq(
      true
    );
    expect(await projectRegistry.admins(user1.address)).to.eq(true);

    await projectRegistry
      .connect(projectRegistryOwner)
      .removeAdmins([
        projectRegistryAdmin1.address,
        projectRegistryAdmin2.address,
        user1.address,
      ]);

    expect(await projectRegistry.admins(projectRegistryAdmin1.address)).to.eq(
      false
    );
    expect(await projectRegistry.admins(projectRegistryAdmin2.address)).to.eq(
      false
    );
    expect(await projectRegistry.admins(user1.address)).to.eq(false);
  });
});
