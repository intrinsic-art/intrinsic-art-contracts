import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployContract } from "../helpers/deployContract";
import { ethers } from "hardhat";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await ethers.provider.getNetwork();
  const canvas = await hre.ethers.getContract("Canvas");
  const element = await hre.ethers.getContract("Element");
  let owner;
  if (chainId === 1) {
    owner = process.env.MAINNET_OWNER_ADDRESS;
  } else if (chainId === 5) {
    owner = process.env.GOERLI_OWNER_ADDRESS;
  } else {
    console.error("Chain not configured");
  }
  // 172800 seconds === 2 days
  await deployContract(hre, "Studio", [
    owner,
    canvas.address,
    element.address,
    172800,
    "https://intrinsic.art",
  ]);
};

export default func;
