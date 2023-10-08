import { HardhatRuntimeEnvironment } from "hardhat/types";
import config from "../projectConfigs/metta/config";
import * as fs from "fs";

const CreateProject = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  const {
    deployments: { deploy, execute },
    getNamedAccounts,
  } = hre;

  const { deployer } = await getNamedAccounts();

  const artworkConstructorArgs = [
    config.artworkConstructorData.royaltyFeeNumerator,
    config.artworkConstructorData.name,
    config.artworkConstructorData.symbol,
    config.artworkConstructorData.baseURI,
    config.artworkConstructorData.scriptJSON,
    config.artworkConstructorData.owner,
    config.artworkConstructorData.royaltyPayees,
    config.artworkConstructorData.royaltyShares,
  ];

  console.log("Deploying Contracts");

  const artworkDeployResult = await deploy("Artwork", {
    log: true,
    from: deployer,
    args: artworkConstructorArgs,
  });

  const traitsConstructorArgs = [
    config.traitsConstructorData.royaltyFeeNumerator,
    config.traitsConstructorData.uri,
    artworkDeployResult.address,
    config.traitsConstructorData.owner,
    config.traitsConstructorData.primarySalesPayees,
    config.traitsConstructorData.primarySalesShares,
    config.traitsConstructorData.royaltyPayees,
    config.traitsConstructorData.royaltyShares,
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
    config.createTraitsData.traitTypeNames,
    config.createTraitsData.traitTypeValues,
    config.createTraitsData.traitNames,
    config.createTraitsData.traitValues,
    config.createTraitsData.traitTypeIndexes,
    config.createTraitsData.traitMaxSupplys
  );

  const script = fs.readFileSync(
    "projectConfigs/metta/minifiedScript.txt",
    "utf8"
  );

  // console.log("script: ", script);

  console.log("uploading script");

  await execute(
    "Artwork",
    { log: true, from: deployer },
    "updateScript",
    0,
    script
  );

  // for (const [scriptNumber, script] of scripts.entries()) {
  //   console.log("Uploading script ", scriptNumber);
  //   await execute(
  //     "Artwork",
  //     { log: true, from: deployer },
  //     "updateScript",
  //     scriptNumber,
  //     script
  //   );
  // }

  console.log("Locking project");

  await execute("Artwork", { log: true, from: deployer }, "lockProject");

  console.log("Scheduling auction");

  await execute(
    "Traits",
    { log: true, from: deployer },
    "scheduleAuction",
    config.scheduleAuctionData.auctionStartTime,
    config.scheduleAuctionData.auctionEndTime,
    config.scheduleAuctionData.auctionStartPrice,
    config.scheduleAuctionData.auctionEndPrice,
    config.scheduleAuctionData.traitsSaleStartTime
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
