import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployContract } from "../helpers/deployContract";
import Config from "../helpers/config";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  await deployContract(hre, "Element", []);
};

export default func;
