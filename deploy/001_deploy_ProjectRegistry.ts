import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const {
    deployments: { deploy },
    getNamedAccounts,
  } = hre;
  const { deployer } = await getNamedAccounts();

  console.log("deployer: ", deployer);

  await deploy("ProjectRegistry", {
    log: true,
    from: deployer,
    args: [deployer, [deployer], "https://base-sepolia-api.intrinsic.art/"],
  });

  console.log("Waiting 60s before verifying contract...");
  await new Promise((resolve) => setTimeout(resolve, 60000));

  const projectRegistry = await hre.ethers.getContract("ProjectRegistry");

  try {
    await hre.run("verify:verify", {
      address: projectRegistry.address,
      constructorArguments: [
        deployer,
        [deployer],
        "https://historian.encryptafile.com/",
      ],
    });
  } catch (error) {
    console.error();
  }
};

export default func;
