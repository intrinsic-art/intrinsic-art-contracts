import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployContract } from "../helpers/deployContract";
import Config from "../helpers/config";
import { ethers } from "hardhat";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const amm = await ethers.getContract("AMM");
  await deployContract(hre, "Element", [amm.address]);
};

export default func;
