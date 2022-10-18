import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const canvas = await hre.ethers.getContract("Canvas");
  const element = await hre.ethers.getContract("Element");
  const dutchAuction = await hre.ethers.getContract("DutchAuction");
  const amm = await hre.ethers.getContract("AMM");
  const studio = await hre.ethers.getContract("Studio");
  const mockWeth = await hre.ethers.getContract("MockWeth");

  let weth = "";
  const { chainId } = await ethers.provider.getNetwork();
  if (chainId === 31337 || chainId === 5) {
    weth = mockWeth.address;
  } else if (chainId === 1) {
    weth = "";
  }

  // Initialize canvas contract
  await canvas.initialize();

  // Initialize Dutch Auction contract
  await dutchAuction.initialize(canvas.address, studio.address);

  // Initialize AMM contract
  await amm.initialize(
    element.address,
    studio.address,
    100_000_000,
    90_000_000
  );

  // Initialize Studio contract
  await studio.initialize(
    canvas.address,
    dutchAuction.address,
    element.address,
    amm.address
  );
  // console.log("Protocol Setup");
  // console.log(`Weth address + ${weth}`);
};
export default func;
