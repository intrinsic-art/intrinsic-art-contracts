import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";

dotenv.config();

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
  networks: {
    mainnet: {
      chainId: 1,
      url: process.env.MAINNET_PROVIDER,
      accounts: [process.env.MAINNET_DEPLOYER_PRIVATE_KEY || ""],
    },
    ropsten: {
      chainId: 3,
      url: process.env.ROPSTEN_PROVIDER,
      accounts: [process.env.ROPSTEN_DEPLOYER_PRIVATE_KEY || ""],
    },
    rinkeby: {
      chainId: 4,
      url: process.env.RINKEBY_PROVIDER,
      accounts: [process.env.RINKEBY_DEPLOYER_PRIVATE_KEY || ""],
    },
    goerli: {
      chainId: 5,
      url: process.env.GOERLI_PROVIDER,
      accounts: [process.env.GOERLI_DEPLOYER_PRIVATE_KEY || ""],
    },
    kovan: {
      chainId: 42,
      url: process.env.KOVAN_PROVIDER,
      accounts: [process.env.KOVAN_DEPLOYER_PRIVATE_KEY || ""],
    },
  },
};

export default config;
