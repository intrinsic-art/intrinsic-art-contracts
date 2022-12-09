import * as dotenv from "dotenv";
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";
import AddWhitelistedArtist from "./scripts/AddWhitelistedArtist";
import CreateProject from "./scripts/CreateProject";
import AddScripts from "./scripts/AddScripts";
import LockProject from "./scripts/LockProject";
import CreateMarkets from "./scripts/CreateMarkets";
import MintWeth from "./scripts/MintWeth";

dotenv.config();

task(
  "AddWhitelistedArtist",
  "Add an artist to the whitelist so they can create a project"
)
  .addParam("studio", "Address of Studio contract")
  .addParam("artist", "Address of the artist")
  .setAction(async (taskArgs, hre) => {
    await AddWhitelistedArtist(hre, taskArgs.studio, taskArgs.artist);
  });

task("CreateProject", "Create a project")
  .addParam("projectIndex", "Index of the project in the config file")
  .addParam("studio", "Address of Studio contract")
  .setAction(async (taskArgs, hre) => {
    await CreateProject(hre, taskArgs.projectIndex, taskArgs.studio);
  });

task("AddScripts", "Add a script to a project")
  .addParam("projectIndex", "Index of the project in the config file")
  .addParam("projectId", "ID of project to add script to")
  .addParam("studio", "Address of Studio contract")
  .setAction(async (taskArgs, hre) => {
    await AddScripts(
      hre,
      taskArgs.projectIndex,
      taskArgs.projectId,
      taskArgs.studio
    );
  });

task("LockProject", "Lock a project")
  .addParam("projectId", "ID of project to add script to")
  .addParam("studio", "Address of Studio contract")
  .setAction(async (taskArgs, hre) => {
    await LockProject(hre, taskArgs.projectId, taskArgs.studio);
  });

task("CreateMarkets", "Create the element markets")
  .addParam("projectIndex", "Index of the project in the config file")
  .addParam("projectId", "ID of project to add script to")
  .addParam("studio", "Address of Studio contract")
  .setAction(async (taskArgs, hre) => {
    await CreateMarkets(
      hre,
      taskArgs.projectIndex,
      taskArgs.projectId,
      taskArgs.studio
    );
  });

task("MintWeth", "Mint WETH to the specified address")
  .addParam("wethAddress", "Address of the WETH contract")
  .addParam("wethRecipient", "Address of the WETH recipient")
  .addParam("wethAmount", "Amount of WETH to mint")
  .setAction(async (taskArgs, hre) => {
    await MintWeth(
      hre,
      taskArgs.wethAddress,
      taskArgs.wethRecipient,
      taskArgs.wethAmount
    );
  });

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  mocha: {
    timeout: 1000000,
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: [":Studio$"],
  },
  namedAccounts: {
    deployer: {
      default: 0,
      mainnet: `privatekey://${process.env.MAINNET_DEPLOYER_PRIVATE_KEY}`,
      goerli: `privatekey://${process.env.GOERLI_DEPLOYER_PRIVATE_KEY}`,
      sepolia: `privatekey://${process.env.SEPOLIA_DEPLOYER_PRIVATE_KEY}`,
      polygonMumbai: `privatekey://${process.env.POLYGON_MUMBAI_DEPLOYER_PRIVATE_KEY}`,
    },
  },
  networks: {
    mainnet: {
      chainId: 1,
      url: process.env.MAINNET_PROVIDER,
      accounts: [process.env.MAINNET_DEPLOYER_PRIVATE_KEY || ""],
    },
    goerli: {
      chainId: 5,
      url: process.env.GOERLI_PROVIDER,
      accounts: [process.env.GOERLI_DEPLOYER_PRIVATE_KEY || ""],
    },
    sepolia: {
      chainId: 11155111,
      url: process.env.SEPOLIA_PROVIDER,
      accounts: [process.env.SEPOLIA_DEPLOYER_PRIVATE_KEY || ""],
    },
    polygonMumbai: {
      chainId: 80001,
      url: process.env.POLYGON_MUMBAI_PROVIDER,
      accounts: [process.env.POLYGON_MUMBAI_DEPLOYER_PRIVATE_KEY || ""],
    },
  },
  etherscan: {
    apiKey: {
      mainnet: `${process.env.ETHERSCAN_ETHEREUM_API_KEY}`,
      goerli: `${process.env.ETHERSCAN_ETHEREUM_API_KEY}`,
      sepolia: `${process.env.ETHERSCAN_ETHEREUM_API_KEY}`,
      polygonMumbai: `${process.env.ETHERSCAN_POLYGON_API_KEY}`,
    },
  },
};

export default config;
