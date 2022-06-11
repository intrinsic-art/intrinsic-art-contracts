import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployContract } from "../helpers/deployContract";
import Config from "../helpers/Config";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  await deployContract(hre, "AMM", [
    Config.AMM.artistFeeNumerator,
    Config.AMM.totalFeeNumerator,
    Config.AMM.wethAddress,
  ]);
};

export default func;
