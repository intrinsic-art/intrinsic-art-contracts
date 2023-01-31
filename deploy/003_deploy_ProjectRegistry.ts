import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployContract } from "../helpers/deployContract";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  await deployContract(hre, "ProjectRegistry", []);

  await new Promise((resolve) => setTimeout(resolve, 20000));

  const projectRegistry = await hre.ethers.getContract("ProjectRegistry");

  try {
    await hre.run("verify:verify", {
      address: projectRegistry.address,
      constructorArguments: [],
    });
  } catch (error) {
    console.error();
  }
};

export default func;
