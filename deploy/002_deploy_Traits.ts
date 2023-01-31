import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployContract } from "../helpers/deployContract";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  await deployContract(hre, "Traits", []);

  await new Promise((resolve) => setTimeout(resolve, 20000));

  const traits = await hre.ethers.getContract("Traits");

  try {
    await hre.run("verify:verify", {
      address: traits.address,
      constructorArguments: [],
    });
  } catch (error) {
    console.error();
  }
};

export default func;
