import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import projectConfigs from "../scripts/projectConfigs";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await ethers.provider.getNetwork();
  let owner = "";
  if (chainId === 1 && !!process.env.MAINNET_OWNER_ADDRESS) {
    owner = process.env.MAINNET_OWNER_ADDRESS;
  } else if (chainId === 5 && !!process.env.GOERLI_OWNER_ADDRESS) {
    owner = process.env.GOERLI_OWNER_ADDRESS;
  } else if (chainId === 11155111 && !!process.env.SEPOLIA_OWNER_ADDRESS) {
    owner = process.env.SEPOLIA_OWNER_ADDRESS;
  } else if (chainId === 80001 && !!process.env.POLYGON_MUMBAI_OWNER_ADDRESS) {
    owner = process.env.POLYGON_MUMBAI_OWNER_ADDRESS;
  } else {
    console.error("Chain not configured");
  }
  if (
    chainId === 31337 ||
    chainId === 5 ||
    chainId === 11155111 ||
    chainId === 80001
  ) {
    // const artwork = await hre.ethers.getContract("Artwork");
    // await artwork.addStudio(studio.address);
    // await traits.addStudio(studio.address);
    // await studio.addAdmins([owner]);

    const traits = await hre.ethers.getContract("Traits");
    const studio = await hre.ethers.getContract("Studio");
    const projectRegistry = await hre.ethers.getContract("ProjectRegistry");

    console.log("Initializing projects");

    await studio.initialize(
      "Intrinsic.art Disentanglement",
      "INSC",
      traits.address,
      owner,
      [owner]
    );

    console.log("Initialized Studio");

    await traits.initialize(studio.address, "https://intrinsic.art/traits");

    console.log("Initialized Traits");

    await projectRegistry.initialize(owner, [owner]);

    console.log("Initialzied Project Registry");

    await new Promise((resolve) => setTimeout(resolve, 60000));

    console.log("Creating project");

    await studio.createProject(
      projectConfigs[0].createProjectData.baseURI,
      projectConfigs[0].createProjectData.artistAddress,
      projectConfigs[0].createProjectData.maxSupply,
      projectConfigs[0].createProjectData.metadata
    );

    console.log("Creating traits");

    // console.log(traits.address);
    // console.log(projectConfigs[0].createTraitsData.traitTypeNames);
    // console.log(projectConfigs[0].createTraitsData.traitTypeValues);
    // console.log(projectConfigs[0].createTraitsData.traitNames);
    // console.log(projectConfigs[0].createTraitsData.traitValues);
    // console.log(projectConfigs[0].createTraitsData.traitTypeIndexes);
    // console.log(projectConfigs[0].createTraitsData.traitMaxSupplys);

    await studio.createTraits(
      projectConfigs[0].createTraitsData.traitTypeNames,
      projectConfigs[0].createTraitsData.traitTypeValues,
      projectConfigs[0].createTraitsData.traitNames,
      projectConfigs[0].createTraitsData.traitValues,
      projectConfigs[0].createTraitsData.traitTypeIndexes,
      projectConfigs[0].createTraitsData.traitMaxSupplys,
      {
        gasLimit: 8000000,
      }
    );

    const scripts = projectConfigs[0].scripts;
    for (const [scriptNumber, script] of scripts.entries()) {
      console.log("Uploading script ", scriptNumber);

      await studio.updateScript(scriptNumber, script, {
        gasLimit: 8000000,
      });
    }

    console.log("Waiting for TX's to confirm");
    await new Promise((resolve) => setTimeout(resolve, 60000));

    console.log("Locking project");
    await studio.lockProject();

    await new Promise((resolve) => setTimeout(resolve, 60000));

    console.log("Scheduling auction");
    await studio.scheduleAuction(
      projectConfigs[0].scheduleAuctionData.auctionStartTime,
      projectConfigs[0].scheduleAuctionData.auctionEndTime,
      projectConfigs[0].scheduleAuctionData.auctionStartPrice,
      projectConfigs[0].scheduleAuctionData.auctionEndPrice,
      {
        gasLimit: 8000000,
      }
    );

    await projectRegistry.registerProject(studio.address, traits.address);
  }
};

export default func;
