import { HardhatRuntimeEnvironment } from "hardhat/types";
import config from "../projectConfigs/metta/config";

const CreateProject = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  const abiCoder = hre.ethers.utils.defaultAbiCoder;
  const {
    deployments: { deploy, execute },
    getNamedAccounts,
    getChainId,
  } = hre;

  const chainId = await getChainId();
  let testnet: boolean;

  if (chainId === "84532") {
    // Base Sepolia
    testnet = true;
  } else if (chainId === "8453") {
    // Base Mainnet
    testnet = false;
  } else {
    console.error("Invalid chain");
    return;
  }

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
    config.artworkConstructorData.royaltySalesReceiver,
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
    config.traitsConstructorData.primarySalesReceiver,
    config.traitsConstructorData.traitsSetupData,
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

  const encodedArtworkData = testnet
    ? abiCoder.encode(
        ["address", "uint256", "address[]", "uint256[]"],
        [
          traits.address,
          hre.ethers.BigNumber.from(config.setupDataTestnet.whitelistStartTime),
          config.setupDataTestnet.whitelistAddresses,
          config.setupDataTestnet.whitelistAmounts,
        ]
      )
    : abiCoder.encode(
        ["address", "uint256", "address[]", "uint256[]"],
        [
          traits.address,
          hre.ethers.BigNumber.from(config.setupDataMainnet.whitelistStartTime),
          config.setupDataMainnet.whitelistAddresses,
          config.setupDataMainnet.whitelistAmounts,
        ]
      );
  const encodedTraitsData = testnet
    ? abiCoder.encode(
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
          config.setupDataTestnet.auctionExponential,
          hre.ethers.BigNumber.from(config.setupDataTestnet.auctionStartTime),
          hre.ethers.BigNumber.from(config.setupDataTestnet.auctionEndTime),
          config.setupDataTestnet.auctionStartPrice,
          config.setupDataTestnet.auctionEndPrice,
          hre.ethers.BigNumber.from(config.setupDataTestnet.auctionPriceSteps),
          hre.ethers.BigNumber.from(
            config.setupDataTestnet.traitsSaleStartTime
          ),
        ]
      )
    : abiCoder.encode(
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
          config.setupDataMainnet.auctionExponential,
          hre.ethers.BigNumber.from(config.setupDataMainnet.auctionStartTime),
          hre.ethers.BigNumber.from(config.setupDataMainnet.auctionEndTime),
          config.setupDataMainnet.auctionStartPrice,
          config.setupDataMainnet.auctionEndPrice,
          hre.ethers.BigNumber.from(config.setupDataMainnet.auctionPriceSteps),
          hre.ethers.BigNumber.from(
            config.setupDataMainnet.traitsSaleStartTime
          ),
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
