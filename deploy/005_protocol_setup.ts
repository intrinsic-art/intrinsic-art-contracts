import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await ethers.provider.getNetwork();
  let owner = "";
  if (chainId === 1 && !!process.env.MAINNET_OWNER_ADDRESS) {
    owner = process.env.MAINNET_OWNER_ADDRESS;
  } else if (chainId === 5 && !!process.env.GOERLI_OWNER_ADDRESS) {
    owner = process.env.GOERLI_OWNER_ADDRESS;
  } else if (chainId === 11155111 && !!process.env.SEPOLIA_OWNER_ADDRESS) {
    owner = process.env.SEPOLIA_OWNER_ADDRESS;
  } else if (chainId === 80001 && !!process.env.POLYGON_MUMBAI_OWNER_ADDRESS) {
    owner = process.env.POLYGON_MUMBAI_OWNER_ADDRESS;
  } else {
    console.error("Chain not configured");
  }
  if (
    chainId === 31337 ||
    chainId === 5 ||
    chainId === 11155111 ||
    chainId === 80001
  ) {
    const artwork = await hre.ethers.getContract("Artwork");
    const traits = await hre.ethers.getContract("Traits");
    const studio = await hre.ethers.getContract("Studio");

    await artwork.addStudio(studio.address);
    await traits.addStudio(studio.address);
    await studio.addAdmins([owner]);
  }
};

export default func;
