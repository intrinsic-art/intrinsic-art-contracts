import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployContract } from "../helpers/deployContract";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  await deployContract(hre, "Studio", []);
};

export default func;
