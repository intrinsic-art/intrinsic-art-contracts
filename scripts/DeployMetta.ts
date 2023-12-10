import { HardhatRuntimeEnvironment } from "hardhat/types";
import config from "../projectConfigs/metta/config";

const CreateProject = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  const abiCoder = hre.ethers.utils.defaultAbiCoder;
  const {
    deployments: { deploy, execute },
    getNamedAccounts,
  } = hre;

  const { deployer } = await getNamedAccounts();
  const projectRegistry = await hre.ethers.getContract("ProjectRegistry");

  console.log("Deploying string storage contract...");

  const stringStorageDeployResult = await deploy("MettaStringStorage", {
    log: true,
    from: deployer,
  });

  console.log("Deploying artwork contract...");

  const artworkConstructorArgs = [
    config.artworkConstructorData.name,
    config.artworkConstructorData.symbol,
    config.artworkConstructorData.artistAddress,
    projectRegistry.address,
    config.artworkConstructorData.royaltyFeeNumerator,
    config.artworkConstructorData.royaltyPayees,
    config.artworkConstructorData.royaltyShares,
    {
      stringStorageSlot: 0,
      stringStorageAddress: stringStorageDeployResult.address,
    },
    {
      stringStorageSlot: 1,
      stringStorageAddress: stringStorageDeployResult.address,
    },
  ];

  const artworkDeployResult = await deploy("MettaArtwork", {
    contract: "Artwork",
    log: true,
    from: deployer,
    args: artworkConstructorArgs,
  });

  console.log("Deploying traits contract...");

  const traitsConstructorArgs = [
    projectRegistry.address,
    config.traitsConstructorData.traitsSetupData,
    config.traitsConstructorData.primarySalesPayees,
    config.traitsConstructorData.primarySalesShares,
    config.traitsConstructorData.royaltyPayees,
    config.traitsConstructorData.royaltyShares,
  ];

  const traitsDeployResult = await deploy("MettaTraits", {
    contract: "Traits",
    log: true,
    from: deployer,
    args: traitsConstructorArgs,
  });

  const artwork = await hre.ethers.getContractAt(
    "Artwork",
    artworkDeployResult.address
  );
  const traits = await hre.ethers.getContractAt(
    "Traits",
    traitsDeployResult.address
  );

  console.log("Waiting 60s before verifying contracts...");
  await new Promise((resolve) => setTimeout(resolve, 60000));

  console.log("Verifying Artwork contract...");

  try {
    await hre.run("verify:verify", {
      address: artwork.address,
      constructorArguments: artworkConstructorArgs,
    });
  } catch (error) {
    console.error();
  }

  console.log("Verifying Traits contract...");

  try {
    await hre.run("verify:verify", {
      address: traits.address,
      constructorArguments: traitsConstructorArgs,
    });
  } catch (error) {
    console.error();
  }

  console.log("Registering project & scheduling auction...");

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
      config.setupData.auctionExponential,
      hre.ethers.BigNumber.from(config.setupData.auctionStartTime),
      hre.ethers.BigNumber.from(config.setupData.auctionEndTime),
      config.setupData.auctionStartPrice,
      config.setupData.auctionEndPrice,
      hre.ethers.BigNumber.from(config.setupData.auctionPriceSteps),
      hre.ethers.BigNumber.from(config.setupData.traitsSaleStartTime),
      hre.ethers.BigNumber.from(config.setupData.whitelistStartTime),
    ]
  );

  await execute(
    "ProjectRegistry",
    { log: true, from: deployer },
    "registerProject",
    artwork.address,
    encodedArtworkData,
    traits.address,
    encodedTraitsData
  );
};

export default CreateProject;
