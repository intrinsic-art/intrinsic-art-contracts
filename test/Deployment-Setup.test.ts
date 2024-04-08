import {
  Artwork,
  Artwork__factory,
  MockStringStorage,
  MockStringStorage__factory,
  ProjectRegistry,
  ProjectRegistry__factory,
  Traits,
  Traits__factory,
} from "../typechain-types";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import time from "./helpers/time";

describe("Deployment and setup", function () {
  let projectRegistry: ProjectRegistry;
  let stringStorage: MockStringStorage;
  let artwork1: Artwork;
  let traits1: Traits;
  let artwork2: Artwork;
  let traits2: Traits;

  let deployer: SignerWithAddress;
  let artist: SignerWithAddress;
  let user1: SignerWithAddress;
  let whitelistedUser1: SignerWithAddress;
  let whitelistedUser2: SignerWithAddress;
  let primarySalesReceiver: SignerWithAddress;
  let royaltySalesReceiver: SignerWithAddress;
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
      primarySalesReceiver,
      royaltySalesReceiver,
      projectRegistryOwner,
      projectRegistryAdmin1,
      projectRegistryAdmin2,
    ] = await ethers.getSigners();

    projectRegistry = await new ProjectRegistry__factory(deployer).deploy(
      projectRegistryOwner.address,
      [projectRegistryAdmin1.address],
      "https://intrinsic.art/"
    );

    stringStorage = await new MockStringStorage__factory(deployer).deploy();
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
        projectRegistry.address,
        primarySalesReceiver.address,
        {
          traitTypeNames: ["Hair Color"],
          traitTypeValues: ["hairColor", "eyeColor"],
          traitNames: ["Blonde", "Brown", "Black", "Green", "Blue"],
          traitValues: ["blonde", "brown", "black", "green", "blue"],
          traitTypeIndexes: [0, 0, 0, 1, 1],
          traitMaxSupplys: [10, 20, 30, 40, 50],
        }
      )
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      new Traits__factory(deployer).deploy(
        projectRegistry.address,
        primarySalesReceiver.address,
        {
          traitTypeNames: ["Hair Color", "Eye Color"],
          traitTypeValues: ["hairColor", "eyeColor"],
          traitNames: ["Blonde", "Brown", "Black", "Green"],
          traitValues: ["blonde", "brown", "black", "green", "blue"],
          traitTypeIndexes: [0, 0, 0, 1, 1],
          traitMaxSupplys: [10, 20, 30, 40, 50],
        }
      )
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      new Traits__factory(deployer).deploy(
        projectRegistry.address,
        primarySalesReceiver.address,
        {
          traitTypeNames: ["Hair Color", "Eye Color"],
          traitTypeValues: ["hairColor", "eyeColor"],
          traitNames: ["Blonde", "Brown", "Black", "Green", "Blue"],
          traitValues: ["blonde", "brown", "black", "green"],
          traitTypeIndexes: [0, 0, 0, 1, 1],
          traitMaxSupplys: [10, 20, 30, 40, 50],
        }
      )
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      new Traits__factory(deployer).deploy(
        projectRegistry.address,
        primarySalesReceiver.address,
        {
          traitTypeNames: ["Hair Color", "Eye Color"],
          traitTypeValues: ["hairColor", "eyeColor"],
          traitNames: ["Blonde", "Brown", "Black", "Green", "Blue"],
          traitValues: ["blonde", "brown", "black", "green", "blue"],
          traitTypeIndexes: [0, 0, 0, 1],
          traitMaxSupplys: [10, 20, 30, 40, 50],
        }
      )
    ).to.be.revertedWith("InvalidArrayLengths()");

    await expect(
      new Traits__factory(deployer).deploy(
        projectRegistry.address,
        primarySalesReceiver.address,
        {
          traitTypeNames: ["Hair Color", "Eye Color"],
          traitTypeValues: ["hairColor", "eyeColor"],
          traitNames: ["Blonde", "Brown", "Black", "Green", "Blue"],
          traitValues: ["blonde", "brown", "black", "green", "blue"],
          traitTypeIndexes: [0, 0, 0, 1, 1],
          traitMaxSupplys: [10, 20, 30, 40],
        }
      )
    ).to.be.revertedWith("InvalidArrayLengths()");
  });

  it("Auction can't be scheduled with invalid times or prices", async () => {
    artwork1 = await new Artwork__factory(deployer).deploy(
      "Intrinsic.art Disentanglement",
      "INSC",
      artist.address,
      projectRegistry.address,
      royaltySalesReceiver.address,
      { stringStorageSlot: 0, stringStorageAddress: stringStorage.address },
      { stringStorageSlot: 1, stringStorageAddress: stringStorage.address }
    );

    traits1 = await new Traits__factory(deployer).deploy(
      projectRegistry.address,
      primarySalesReceiver.address,
      {
        traitTypeNames: ["Hair Color", "Eye Color"],
        traitTypeValues: ["hairColor", "eyeColor"],
        traitNames: ["Blonde", "Brown", "Black", "Green", "Blue"],
        traitValues: ["blonde", "brown", "black", "green", "blue"],
        traitTypeIndexes: [0, 0, 0, 1, 1],
        traitMaxSupplys: [10, 20, 30, 40, 50],
      }
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

    const encodedArtworkData = abiCoder.encode(
      ["address", "uint256", "address[]", "uint256[]"],
      [
        traits1.address,
        whitelistStartTime,
        [whitelistedUser1.address, whitelistedUser2.address],
        [1, 1],
      ]
    );
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
        artwork1.address,
        false,
        auctionStartTime,
        auctionEndTime,
        auctionStartPrice,
        auctionEndPrice,
        auctionPriceSteps,
        traitsSaleStartTime,
      ]
    );

    await expect(
      projectRegistry
        .connect(projectRegistryAdmin1)
        .registerProject(
          artwork1.address,
          encodedArtworkData,
          traits1.address,
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

    artwork1 = await new Artwork__factory(deployer).deploy(
      "Intrinsic.art Disentanglement",
      "INSC",
      artist.address,
      projectRegistry.address,
      royaltySalesReceiver.address,
      { stringStorageSlot: 0, stringStorageAddress: stringStorage.address },
      { stringStorageSlot: 1, stringStorageAddress: stringStorage.address }
    );

    traits1 = await new Traits__factory(deployer).deploy(
      projectRegistry.address,
      primarySalesReceiver.address,
      {
        traitTypeNames: ["Hair Color", "Eye Color"],
        traitTypeValues: ["hairColor", "eyeColor"],
        traitNames: ["Blonde", "Brown", "Black", "Green", "Blue"],
        traitValues: ["blonde", "brown", "black", "green", "blue"],
        traitTypeIndexes: [0, 0, 0, 1, 1],
        traitMaxSupplys: [10, 20, 30, 40, 50],
      }
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

    const encodedArtworkData = abiCoder.encode(
      ["address", "uint256", "address[]", "uint256[]"],
      [
        traits1.address,
        whitelistStartTime,
        [whitelistedUser1.address, whitelistedUser2.address],
        [1, 1],
      ]
    );
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
        artwork1.address,
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
      .connect(projectRegistryAdmin1)
      .registerProject(
        artwork1.address,
        encodedArtworkData,
        traits1.address,
        encodedTraitsData
      );

    await expect(
      projectRegistry
        .connect(user1)
        .registerProject(
          artwork1.address,
          encodedArtworkData,
          traits1.address,
          encodedTraitsData
        )
    ).to.be.revertedWith("OnlyAdmin()");

    expect(await projectRegistry.projects(1)).to.deep.eq([
      artwork1.address,
      traits1.address,
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

  it("Project Registry ownership transfer is two steps", async () => {
    expect(await projectRegistry.owner()).to.eq(projectRegistryOwner.address);

    await expect(
      projectRegistry.connect(user1).transferOwnership(user1.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await projectRegistry
      .connect(projectRegistryOwner)
      .transferOwnership(user1.address);

    expect(await projectRegistry.owner()).to.eq(projectRegistryOwner.address);

    expect(await projectRegistry.pendingOwner()).to.eq(user1.address);

    await projectRegistry.connect(user1).acceptOwnership();

    expect(await projectRegistry.owner()).to.eq(user1.address);
  });

  it("Address that isn't project registry can't setup artwork contract", async () => {
    artwork1 = await new Artwork__factory(deployer).deploy(
      "Intrinsic.art Disentanglement",
      "INSC",
      artist.address,
      projectRegistry.address,
      royaltySalesReceiver.address,
      { stringStorageSlot: 0, stringStorageAddress: stringStorage.address },
      { stringStorageSlot: 1, stringStorageAddress: stringStorage.address }
    );

    const encodedArtworkData = abiCoder.encode(["address"], [user1.address]);
    await expect(
      artwork1.connect(user1).setup(encodedArtworkData)
    ).to.be.revertedWith("OnlyProjectRegistry()");
  });

  it("Address that isn't project registry can't setup traits contract", async () => {
    currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    auctionStartTime = currentTime + 110;
    auctionEndTime = auctionStartTime - 1;
    auctionStartPrice = ethers.utils.parseEther("1");
    auctionEndPrice = ethers.utils.parseEther("0.1");
    auctionPriceSteps = 4;
    traitsSaleStartTime = currentTime + 300;
    whitelistStartTime = currentTime + 110;

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
        artwork1.address,
        false,
        auctionStartTime,
        auctionEndTime,
        auctionStartPrice,
        auctionEndPrice,
        auctionPriceSteps,
        traitsSaleStartTime,
      ]
    );

    traits1 = await new Traits__factory(deployer).deploy(
      projectRegistry.address,
      royaltySalesReceiver.address,
      {
        traitTypeNames: ["Hair Color", "Eye Color"],
        traitTypeValues: ["hairColor", "eyeColor"],
        traitNames: ["Blonde", "Brown", "Black", "Green", "Blue"],
        traitValues: ["blonde", "brown", "black", "green", "blue"],
        traitTypeIndexes: [0, 0, 0, 1, 1],
        traitMaxSupplys: [10, 20, 30, 40, 50],
      }
    );

    await expect(
      traits1.connect(user1).setup(encodedTraitsData)
    ).to.be.revertedWith("OnlyProjectRegistry()");
  });

  it("Project can't be registered if either contract address is address zero", async () => {
    artwork1 = await new Artwork__factory(deployer).deploy(
      "Intrinsic.art Disentanglement",
      "INSC",
      artist.address,
      projectRegistry.address,
      royaltySalesReceiver.address,
      { stringStorageSlot: 0, stringStorageAddress: stringStorage.address },
      { stringStorageSlot: 1, stringStorageAddress: stringStorage.address }
    );

    traits1 = await new Traits__factory(deployer).deploy(
      projectRegistry.address,
      primarySalesReceiver.address,
      {
        traitTypeNames: ["Hair Color", "Eye Color"],
        traitTypeValues: ["hairColor", "eyeColor"],
        traitNames: ["Blonde", "Brown", "Black", "Green", "Blue"],
        traitValues: ["blonde", "brown", "black", "green", "blue"],
        traitTypeIndexes: [0, 0, 0, 1, 1],
        traitMaxSupplys: [10, 20, 30, 40, 50],
      }
    );

    currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    auctionStartTime = currentTime + 110;
    auctionEndTime = currentTime + 210;
    auctionStartPrice = ethers.utils.parseEther("1");
    auctionEndPrice = ethers.utils.parseEther("0.1");
    auctionPriceSteps = 4;
    traitsSaleStartTime = currentTime + 300;
    whitelistStartTime = currentTime + 110;

    const encodedArtworkData = abiCoder.encode(
      ["address", "uint256", "address[]", "uint256[]"],
      [
        traits1.address,
        whitelistStartTime,
        [whitelistedUser1.address, whitelistedUser2.address],
        [1, 1],
      ]
    );
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
        artwork1.address,
        false,
        auctionStartTime,
        auctionEndTime,
        auctionStartPrice,
        auctionEndPrice,
        auctionPriceSteps,
        traitsSaleStartTime,
      ]
    );

    await expect(
      projectRegistry
        .connect(projectRegistryAdmin1)
        .registerProject(
          artwork1.address,
          encodedArtworkData,
          ethers.constants.AddressZero,
          encodedTraitsData
        )
    ).to.be.revertedWith("InvalidAddress()");

    await expect(
      projectRegistry
        .connect(projectRegistryAdmin1)
        .registerProject(
          ethers.constants.AddressZero,
          encodedArtworkData,
          traits1.address,
          encodedTraitsData
        )
    ).to.be.revertedWith("InvalidAddress()");
  });

  it("A project can be deregistered", async () => {
    projectRegistry = await new ProjectRegistry__factory(deployer).deploy(
      projectRegistryOwner.address,
      [projectRegistryAdmin1.address, projectRegistryAdmin2.address],
      "test URI"
    );

    artwork1 = await new Artwork__factory(deployer).deploy(
      "Intrinsic.art Disentanglement",
      "INSC",
      artist.address,
      projectRegistry.address,
      royaltySalesReceiver.address,
      { stringStorageSlot: 0, stringStorageAddress: stringStorage.address },
      { stringStorageSlot: 1, stringStorageAddress: stringStorage.address }
    );

    artwork2 = await new Artwork__factory(deployer).deploy(
      "Intrinsic.art Disentanglement",
      "INSC",
      artist.address,
      projectRegistry.address,
      royaltySalesReceiver.address,
      { stringStorageSlot: 0, stringStorageAddress: stringStorage.address },
      { stringStorageSlot: 1, stringStorageAddress: stringStorage.address }
    );

    traits1 = await new Traits__factory(deployer).deploy(
      projectRegistry.address,
      primarySalesReceiver.address,
      {
        traitTypeNames: ["Hair Color", "Eye Color"],
        traitTypeValues: ["hairColor", "eyeColor"],
        traitNames: ["Blonde", "Brown", "Black", "Green", "Blue"],
        traitValues: ["blonde", "brown", "black", "green", "blue"],
        traitTypeIndexes: [0, 0, 0, 1, 1],
        traitMaxSupplys: [10, 20, 30, 40, 50],
      }
    );

    traits2 = await new Traits__factory(deployer).deploy(
      projectRegistry.address,
      primarySalesReceiver.address,
      {
        traitTypeNames: ["Hair Color", "Eye Color"],
        traitTypeValues: ["hairColor", "eyeColor"],
        traitNames: ["Blonde", "Brown", "Black", "Green", "Blue"],
        traitValues: ["blonde", "brown", "black", "green", "blue"],
        traitTypeIndexes: [0, 0, 0, 1, 1],
        traitMaxSupplys: [10, 20, 30, 40, 50],
      }
    );

    currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    auctionStartTime = currentTime + 110;
    auctionEndTime = auctionStartTime + 210;
    auctionStartPrice = ethers.utils.parseEther("1");
    auctionEndPrice = ethers.utils.parseEther("0.1");
    auctionPriceSteps = 4;
    traitsSaleStartTime = currentTime + 300;
    whitelistStartTime = currentTime + 110;

    const encodedArtworkData1 = abiCoder.encode(
      ["address", "uint256", "address[]", "uint256[]"],
      [
        traits1.address,
        whitelistStartTime,
        [whitelistedUser1.address, whitelistedUser2.address],
        [1, 1],
      ]
    );
    const encodedTraitsData1 = abiCoder.encode(
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
        artwork1.address,
        false,
        auctionStartTime,
        auctionEndTime,
        auctionStartPrice,
        auctionEndPrice,
        auctionPriceSteps,
        traitsSaleStartTime,
      ]
    );

    // Register the first project
    await projectRegistry
      .connect(projectRegistryAdmin1)
      .registerProject(
        artwork1.address,
        encodedArtworkData1,
        traits1.address,
        encodedTraitsData1
      );

    const encodedArtworkData2 = abiCoder.encode(
      ["address", "uint256", "address[]", "uint256[]"],
      [
        traits2.address,
        whitelistStartTime,
        [whitelistedUser1.address, whitelistedUser2.address],
        [1, 1],
      ]
    );
    const encodedTraitsData2 = abiCoder.encode(
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
        artwork2.address,
        false,
        auctionStartTime,
        auctionEndTime,
        auctionStartPrice,
        auctionEndPrice,
        auctionPriceSteps,
        traitsSaleStartTime,
      ]
    );

    // Register the second project
    await projectRegistry
      .connect(projectRegistryAdmin1)
      .registerProject(
        artwork2.address,
        encodedArtworkData2,
        traits2.address,
        encodedTraitsData2
      );

    expect((await projectRegistry.projects(1)).artwork).to.eq(artwork1.address);
    expect((await projectRegistry.projects(1)).traits).to.eq(traits1.address);
    expect((await projectRegistry.projects(2)).artwork).to.eq(artwork2.address);
    expect((await projectRegistry.projects(2)).traits).to.eq(traits2.address);

    await expect(
      projectRegistry.connect(user1).deregisterProject(2)
    ).to.be.revertedWith("OnlyAdmin()");

    await expect(
      projectRegistry.connect(projectRegistryAdmin1).deregisterProject(1)
    ).to.be.revertedWith("OnlyDeregisterLastProject()");

    expect(await projectRegistry.projectCount()).to.eq(2);

    await projectRegistry.connect(projectRegistryAdmin1).deregisterProject(2);

    expect(await projectRegistry.projectCount()).to.eq(1);

    expect((await projectRegistry.projects(1)).artwork).to.eq(artwork1.address);
    expect((await projectRegistry.projects(1)).traits).to.eq(traits1.address);
    expect((await projectRegistry.projects(2)).artwork).to.eq(
      ethers.constants.AddressZero
    );
    expect((await projectRegistry.projects(2)).traits).to.eq(
      ethers.constants.AddressZero
    );

    await projectRegistry.connect(projectRegistryAdmin1).deregisterProject(1);

    expect(await projectRegistry.projectCount()).to.eq(0);

    expect((await projectRegistry.projects(1)).artwork).to.eq(
      ethers.constants.AddressZero
    );
    expect((await projectRegistry.projects(1)).traits).to.eq(
      ethers.constants.AddressZero
    );
    expect((await projectRegistry.projects(2)).artwork).to.eq(
      ethers.constants.AddressZero
    );
    expect((await projectRegistry.projects(2)).traits).to.eq(
      ethers.constants.AddressZero
    );
  });

  it("A project can't be deregistered if the auction has started'", async () => {
    projectRegistry = await new ProjectRegistry__factory(deployer).deploy(
      projectRegistryOwner.address,
      [projectRegistryAdmin1.address, projectRegistryAdmin2.address],
      "test URI"
    );

    artwork1 = await new Artwork__factory(deployer).deploy(
      "Intrinsic.art Disentanglement",
      "INSC",
      artist.address,
      projectRegistry.address,
      royaltySalesReceiver.address,
      { stringStorageSlot: 0, stringStorageAddress: stringStorage.address },
      { stringStorageSlot: 1, stringStorageAddress: stringStorage.address }
    );

    traits1 = await new Traits__factory(deployer).deploy(
      projectRegistry.address,
      primarySalesReceiver.address,
      {
        traitTypeNames: ["Hair Color", "Eye Color"],
        traitTypeValues: ["hairColor", "eyeColor"],
        traitNames: ["Blonde", "Brown", "Black", "Green", "Blue"],
        traitValues: ["blonde", "brown", "black", "green", "blue"],
        traitTypeIndexes: [0, 0, 0, 1, 1],
        traitMaxSupplys: [10, 20, 30, 40, 50],
      }
    );

    currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    auctionStartTime = currentTime + 110;
    auctionEndTime = auctionStartTime + 210;
    auctionStartPrice = ethers.utils.parseEther("1");
    auctionEndPrice = ethers.utils.parseEther("0.1");
    auctionPriceSteps = 4;
    traitsSaleStartTime = currentTime + 300;
    whitelistStartTime = currentTime + 110;

    const encodedArtworkData1 = abiCoder.encode(
      ["address", "uint256", "address[]", "uint256[]"],
      [
        traits1.address,
        whitelistStartTime,
        [whitelistedUser1.address, whitelistedUser2.address],
        [1, 1],
      ]
    );
    const encodedTraitsData1 = abiCoder.encode(
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
        artwork1.address,
        false,
        auctionStartTime,
        auctionEndTime,
        auctionStartPrice,
        auctionEndPrice,
        auctionPriceSteps,
        traitsSaleStartTime,
      ]
    );

    // Register the first project
    await projectRegistry
      .connect(projectRegistryAdmin1)
      .registerProject(
        artwork1.address,
        encodedArtworkData1,
        traits1.address,
        encodedTraitsData1
      );

    // Move forward in time so auction is active
    await time.increase(time.duration.seconds(300));

    await expect(
      projectRegistry.connect(projectRegistryAdmin1).deregisterProject(1)
    ).to.be.revertedWith("AuctionIsLive()");
  });
});
