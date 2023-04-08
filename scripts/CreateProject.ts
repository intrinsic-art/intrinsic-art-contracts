import { HardhatRuntimeEnvironment } from "hardhat/types";
import projectConfigs from "../projectConfigs";

const CreateProject = async (
  hre: HardhatRuntimeEnvironment,
  projectIndex: number
): Promise<void> => {
  const {
    deployments: { deploy, execute },
    getNamedAccounts,
  } = hre;

  const { deployer } = await getNamedAccounts();

  const artworkConstructorArgs = [
    projectConfigs[projectIndex].artworkConstructorData.name,
    projectConfigs[projectIndex].artworkConstructorData.symbol,
    projectConfigs[projectIndex].artworkConstructorData.baseURI,
    projectConfigs[projectIndex].artworkConstructorData.scriptJSON,
    projectConfigs[projectIndex].artworkConstructorData.artistAddress,
    projectConfigs[projectIndex].artworkConstructorData.owner,
  ];

  console.log("Deploying Contracts");

  const artworkDeployResult = await deploy("Artwork", {
    log: true,
    from: deployer,
    args: artworkConstructorArgs,
  });

  const traitsConstructorArgs = [
    artworkDeployResult.address,
    projectConfigs[projectIndex].traitsConstructorData.uri,
    projectConfigs[projectIndex].traitsConstructorData.owner,
    projectConfigs[projectIndex].traitsConstructorData.platformRevenueClaimer,
    projectConfigs[projectIndex].traitsConstructorData.artistRevenueClaimer,
  ];

  const traitsDeployResult = await deploy("Traits", {
    log: true,
    from: deployer,
    args: traitsConstructorArgs,
  });

  await new Promise((resolve) => setTimeout(resolve, 60000));

  const artwork = await hre.ethers.getContractAt(
    "Artwork",
    artworkDeployResult.address
  );
  const traits = await hre.ethers.getContractAt(
    "Traits",
    traitsDeployResult.address
  );

  console.log("Verifying Contracts");

  try {
    await hre.run("verify:verify", {
      address: artwork.address,
      constructorArguments: artworkConstructorArgs,
    });
  } catch (error) {
    console.error();
  }

  try {
    await hre.run("verify:verify", {
      address: traits.address,
      constructorArguments: traitsConstructorArgs,
    });
  } catch (error) {
    console.error();
  }

  console.log("Setting traits");

  await execute(
    "Artwork",
    { log: true, from: deployer },
    "setTraits",
    traits.address
  );

  console.log("Creating traits and trait types");

  await execute(
    "Traits",
    { log: true, from: deployer },
    "createTraitsAndTypes",
    projectConfigs[projectIndex].createTraitsData.traitTypeNames,
    projectConfigs[projectIndex].createTraitsData.traitTypeValues,
    projectConfigs[projectIndex].createTraitsData.traitNames,
    projectConfigs[projectIndex].createTraitsData.traitValues,
    projectConfigs[projectIndex].createTraitsData.traitTypeIndexes,
    projectConfigs[projectIndex].createTraitsData.traitMaxRevenues
  );

  const scripts = projectConfigs[projectIndex].scripts;

  for (const [scriptNumber, script] of scripts.entries()) {
    console.log("Uploading script ", scriptNumber);
    await execute(
      "Artwork",
      { log: true, from: deployer },
      "updateScript",
      scriptNumber,
      script
    );
  }

  console.log("Locking project");

  await execute("Artwork", { log: true, from: deployer }, "lockProject");

  console.log("Scheduling auction");

  await execute(
    "Traits",
    { log: true, from: deployer },
    "scheduleAuction",
    projectConfigs[projectIndex].scheduleAuctionData.auctionStartTime,
    projectConfigs[projectIndex].scheduleAuctionData.auctionEndTime,
    projectConfigs[projectIndex].scheduleAuctionData.auctionStartPrice,
    projectConfigs[projectIndex].scheduleAuctionData.auctionEndPrice
  );

  await execute(
    "ProjectRegistry",
    { log: true, from: deployer },
    "registerProject",
    artwork.address,
    traits.address
  );

  console.log("Created project");
};

export default CreateProject;
