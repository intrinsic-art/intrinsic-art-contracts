import { HardhatRuntimeEnvironment } from "hardhat/types";

const DeregisterProject = async (hre: HardhatRuntimeEnvironment): Promise<void> => {

  const {
    deployments: { execute },
    getNamedAccounts,
    getChainId,
  } = hre;

  const chainId = await getChainId();
  let testnet: boolean;

  if (chainId === "84532") {
    // Base Sepolia
    testnet = true;
  } else if (chainId === "8453") {
    // Base Mainnet
    testnet = false;
  } else {
    console.error("Invalid chain");
    return;
  }

  console.log("testnet: ", testnet);

  const { deployer } = await getNamedAccounts();

  const projectId = 6;

  await execute(
    "ProjectRegistry",
    { log: true, from: deployer },
    "deregisterProject",
    projectId
  );
};

export default DeregisterProject;
