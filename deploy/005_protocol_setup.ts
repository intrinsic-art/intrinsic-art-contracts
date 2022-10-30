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
    const canvas = await hre.ethers.getContract("Canvas");
    const element = await hre.ethers.getContract("Element");
    const studio = await hre.ethers.getContract("Studio");
    const mockWeth = await hre.ethers.getContract("MockWeth");

    await canvas.addStudio(studio.address);
    await element.addStudio(studio.address);
    await studio.addApprovedERC20(mockWeth.address);
  }
};

export default func;
