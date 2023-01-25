import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployContract } from "../helpers/deployContract";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  console.log("Deploying Studio");
  await deployContract(hre, "Studio", []);

  const studio = await hre.ethers.getContract("Studio");

  // await new Promise((resolve) => setTimeout(resolve, 20000));

  try {
    await hre.run("verify:verify", {
      address: studio.address,
    });
  } catch (error) {
    console.error();
  }
};

export default func;
