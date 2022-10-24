import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployContract } from "../helpers/deployContract";
import { ethers } from "hardhat";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await ethers.provider.getNetwork();
  let owner;
  if (chainId === 1) {
    owner = process.env.MAINNET_OWNER_ADDRESS;
  } else if (chainId === 5) {
    owner = process.env.GOERLI_OWNER_ADDRESS;
  } else {
    console.error("Chain not configured");
  }
  await deployContract(hre, "Canvas", [owner]);
};

export default func;
