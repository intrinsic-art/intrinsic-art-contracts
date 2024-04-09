import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const {
    deployments: { deploy },
    getNamedAccounts,
    getChainId,
  } = hre;
  const { deployer } = await getNamedAccounts();

  const chainId = await getChainId();
  let uri: string;

  if (chainId === "84532") {
    // Base Sepolia
    uri = "https://base-sepolia-api.intrinsic.art/";
  } else if (chainId === "8453") {
    // Base Mainnet
    uri = "https://api.intrinsic.art/";
  } else {
    console.error("Invalid chain");
    return;
  }

  console.log("deployer: ", deployer);

  await deploy("ProjectRegistry", {
    log: true,
    from: deployer,
    args: [deployer, [deployer], uri],
  });

  console.log("Waiting 60s before verifying contract...");
  await new Promise((resolve) => setTimeout(resolve, 60000));

  const projectRegistry = await hre.ethers.getContract("ProjectRegistry");

  try {
    await hre.run("verify:verify", {
      address: projectRegistry.address,
      constructorArguments: [deployer, [deployer], uri],
    });
  } catch (error) {
    console.error();
  }
};

export default func;
