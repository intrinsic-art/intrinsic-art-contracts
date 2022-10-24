import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployContract } from "../helpers/deployContract";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  await deployContract(hre, "Canvas", []);
  const owner = "";
  const canvas = await hre.ethers.getContract("Canvas");
  await canvas.initialize(owner);
};

export default func;
