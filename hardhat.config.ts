import * as dotenv from "dotenv";
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";
import "hardhat-abi-exporter";
import "solidity-coverage";
import CreateMetta from "./scripts/CreateMetta";
import CreateTackLineTorn from "./scripts/CreateTackLineTorn";

dotenv.config();

task("CreateMetta", "Creates the Metta project").setAction(
  async (taskArgs, hre) => {
    await CreateMetta(hre);
  }
);

task("CreateTackLineTorn", "Creates the Tack Line Torn project").setAction(
  async (taskArgs, hre) => {
    await CreateTackLineTorn(hre);
  }
);

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
  },
  mocha: {
    timeout: 1000000,
  },
  abiExporter: {
    path: "./abi",
    runOnCompile: true,
    clear: true,
    flat: false,
    spacing: 2,
    pretty: false,
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
      saveDeployments: false,
    },
    goerli: {
      chainId: 5,
      url: process.env.GOERLI_PROVIDER,
      accounts: [process.env.GOERLI_DEPLOYER_PRIVATE_KEY || ""],
      saveDeployments: true,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: `${process.env.ETHERSCAN_ETHEREUM_API_KEY}`,
      goerli: `${process.env.ETHERSCAN_ETHEREUM_API_KEY}`,
    },
  },
};

export default config;
