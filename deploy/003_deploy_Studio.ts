import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployContract } from "../helpers/deployContract";
import { ethers } from "hardhat";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { chainId } = await ethers.provider.getNetwork();
  const canvas = await hre.ethers.getContract("Canvas");
  const element = await hre.ethers.getContract("Element");
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
  // 172800 seconds === 2 days
  await deployContract(hre, "Studio", [
    owner,
    canvas.address,
    element.address,
    // 172800,
    1,
    "https://intrinsic.art",
  ]);
  const studio = await hre.ethers.getContract("Studio");

  await new Promise((resolve) => setTimeout(resolve, 20000));

  try {
    await hre.run("verify:verify", {
      address: studio.address,
      constructorArguments: [
        owner,
        canvas.address,
        element.address,
        // 172800,
        1,
        "https://intrinsic.art",
      ],
    });
  } catch (error) {
    console.error();
  }
};

export default func;
