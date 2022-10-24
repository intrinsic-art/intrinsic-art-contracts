import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployContract } from "../helpers/deployContract";
import { ethers } from "hardhat";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await ethers.provider.getNetwork();
  if (chainId === 31337 || chainId === 5)
    await deployContract(hre, "MockWeth", []);
};

export default func;
