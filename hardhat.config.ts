import * as dotenv from "dotenv";
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-deploy";
import CreateProject from "./scripts/CreateProject";
import AddScript from "./scripts/AddScript";
import MintWeth from "./scripts/MintWeth";

dotenv.config();

task("CreateProject", "Create a project")
  .addParam("studio", "Address of Studio contract")
  .setAction(async (taskArgs, hre) => {
    await CreateProject(hre, taskArgs.studio);
  });

task("AddScript", "Add a script to a project")
  .addParam("studio", "Address of Studio contract")
  .addParam("project", "ID of project to add script to")
  .setAction(async (taskArgs, hre) => {
    await AddScript(hre, taskArgs.studio, taskArgs.project);
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
    version: "0.8.13",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      mainnet: `privatekey://${process.env.MAINNET_DEPLOYER_PRIVATE_KEY}`,
      goerli: `privatekey://${process.env.GOERLI_DEPLOYER_PRIVATE_KEY}`,
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
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
