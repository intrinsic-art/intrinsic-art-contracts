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

  const studioConstructorArgs = [
    projectConfigs[projectIndex].studioConstructorData.name,
    projectConfigs[projectIndex].studioConstructorData.symbol,
    projectConfigs[projectIndex].studioConstructorData.baseURI,
    projectConfigs[projectIndex].studioConstructorData.scriptJSON,
    projectConfigs[projectIndex].studioConstructorData.artistAddress,
    projectConfigs[projectIndex].studioConstructorData.owner,
  ];

  console.log("Deploying Contracts");

  const studioDeployResult = await deploy("Studio", {
    log: true,
    from: deployer,
    args: studioConstructorArgs,
  });

  const traitsConstructorArgs = [
    studioDeployResult.address,
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

  const studio = await hre.ethers.getContractAt(
    "Studio",
    studioDeployResult.address
  );
  const traits = await hre.ethers.getContractAt(
    "Traits",
    traitsDeployResult.address
  );

  console.log("Verifying Contracts");

  try {
    await hre.run("verify:verify", {
      address: studio.address,
      constructorArguments: studioConstructorArgs,
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
    "Studio",
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

  const scripts = projectConfigs[0].scripts;

  for (const [scriptNumber, script] of scripts.entries()) {
    console.log("Uploading script ", scriptNumber);
    await execute(
      "Studio",
      { log: true, from: deployer },
      "updateScript",
      scriptNumber,
      script
    );
  }

  console.log("Locking project");

  await execute("Studio", { log: true, from: deployer }, "lockProject");

  console.log("Scheduling auction");

  await execute(
    "Traits",
    { log: true, from: deployer },
    "scheduleAuction",
    projectConfigs[0].scheduleAuctionData.auctionStartTime,
    projectConfigs[0].scheduleAuctionData.auctionEndTime,
    projectConfigs[0].scheduleAuctionData.auctionStartPrice,
    projectConfigs[0].scheduleAuctionData.auctionEndPrice
  );

  await execute(
    "ProjectRegistry",
    { log: true, from: deployer },
    "registerProject",
    studio.address,
    traits.address
  );

  console.log("Created project");
};

export default CreateProject;
