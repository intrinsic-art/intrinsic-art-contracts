import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const {
    deployments: { deploy },
    getNamedAccounts,
  } = hre;
  const { deployer } = await getNamedAccounts();

  await deploy("ProjectRegistry", {
    log: true,
    from: deployer,
    args: [deployer, [deployer], "https://historian.encryptafile.com/"],
  });

  await new Promise((resolve) => setTimeout(resolve, 20000));

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
