import * as dotenv from "dotenv";
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";
import "hardhat-abi-exporter";
import "solidity-coverage";
import DeployMetta from "./scripts/DeployMetta";
import DeployTackLineTorn from "./scripts/DeployTackLineTorn";
import DeployOneRing from "./scripts/DeployOneRing";
import UpdateWhitelist from "./scripts/UpdateWhitelist";
import DeregisterProject from "./scripts/DeregisterProject";

dotenv.config();

task("DeregisterProject", "Deregisters the project").setAction(async (taskArgs, hre) => {
  await DeregisterProject(hre);
});

task("DeployMetta", "Deploys the project").setAction(async (taskArgs, hre) => {
  await DeployMetta(hre);
});

task("DeployTackLineTorn", "Deploys the project").setAction(
  async (taskArgs, hre) => {
    await DeployTackLineTorn(hre);
  }
);

task("DeployOneRing", "Deploys the project").setAction(
  async (taskArgs, hre) => {
    await DeployOneRing(hre);
  }
);

task("UpdateWhitelist", "Updates the whitelist").setAction(
  async (taskArgs, hre) => {
    await UpdateWhitelist(hre);
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
      baseMainnet: `privatekey://${process.env.BASE_MAINNET_DEPLOYER_PRIVATE_KEY}`,
      baseSepolia: `privatekey://${process.env.BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY}`,
    },
  },
  networks: {
    baseMainnet: {
      chainId: 8453,
      url: process.env.BASE_MAINNET_PROVIDER,
      accounts: [process.env.BASE_MAINNET_DEPLOYER_PRIVATE_KEY || ""],
      saveDeployments: true,
    },
    baseSepolia: {
      chainId: 84532,
      url: process.env.BASE_SEPOLIA_PROVIDER,
      accounts: [process.env.BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY || ""],
      saveDeployments: true,
    },
  },
  etherscan: {
    apiKey: {
      baseMainnet: `${process.env.BASESCAN_API_KEY}`,
      baseSepolia: `${process.env.BASESCAN_API_KEY}`,
    },
    customChains: [
      {
        network: "baseMainnet",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org/",
        },
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org/",
        },
      },
    ],
  },
};

export default config;
