import { HardhatRuntimeEnvironment } from "hardhat/types";

const MintWeth = async (
  hre: HardhatRuntimeEnvironment,
  wethAddress: string,
  recipientAddress: string,
  wethAmount: string
): Promise<void> => {
  const weth = await hre.ethers.getContractAt("MockWeth", wethAddress);

  await weth.mint(recipientAddress, wethAmount);
  console.log(`Minted ${wethAmount} WETH to ${recipientAddress}`);
};

export default MintWeth;
