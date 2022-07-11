import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import Config from "../helpers/Config";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const mockWeth = await hre.ethers.getContract("MockWeth");
  const element = await hre.ethers.getContract("Element");
  const amm = await hre.ethers.getContract("AMM");
  const dutchAuction = await hre.ethers.getContract("DutchAuction");
  const canvas = await hre.ethers.getContract("Canvas");
  const coloringBook = await hre.ethers.getContract("ColoringBook");

  let weth = "";
  const { chainId } = await ethers.provider.getNetwork();
  if (chainId === 31337) {
    weth = mockWeth.address;
  } else if (chainId === 1) {
    weth = "";
  }

  // Initialize canvas contract
  await canvas.initialize(
    element.address,
    dutchAuction.address,
    coloringBook.address,
    amm.address
  );

  // Initialize coloring book contract
  await coloringBook.initialize(
    element.address,
    amm.address,
    dutchAuction.address,
    canvas.address,
    mockWeth.address
  );

  await amm.initialize(
    weth,
    Config.AMM.totalFeeNumerator,
    Config.AMM.artistFeeNumerator
  );
  console.log("Protocol Setup");
  console.log(`Weth address + ${weth}`);
};
export default func;
