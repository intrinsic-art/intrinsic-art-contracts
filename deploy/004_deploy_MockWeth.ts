import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployContract } from "../helpers/deployContract";
import { ethers } from "hardhat";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await ethers.provider.getNetwork();
  if (
    chainId === 31337 ||
    chainId === 5 ||
    chainId === 11155111 ||
    chainId === 80001
  ) {
    await deployContract(hre, "MockWeth", []);
    const mockWeth = await hre.ethers.getContract("MockWeth");

    await new Promise((resolve) => setTimeout(resolve, 20000));

    try {
      await hre.run("verify:verify", {
        address: mockWeth.address,
        constructorArguments: [],
      });
    } catch (error) {
      console.error();
    }
  }
};

export default func;
