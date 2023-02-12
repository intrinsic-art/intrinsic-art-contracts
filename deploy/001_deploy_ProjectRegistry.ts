import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const {
    deployments: { deploy, execute },
    getNamedAccounts,
  } = hre;
  const { deployer } = await getNamedAccounts();

  await deploy("ProjectRegistry", {
    log: true,
    from: deployer,
    args: [],
  });

  await new Promise((resolve) => setTimeout(resolve, 20000));

  const projectRegistry = await hre.ethers.getContract("ProjectRegistry");

  await execute(
    "ProjectRegistry",
    { log: true, from: deployer },
    "initialize",
    deployer,
    [deployer]
  );

  try {
    await hre.run("verify:verify", {
      address: projectRegistry.address,
      constructorArguments: [],
    });
  } catch (error) {
    console.error();
  }
};

export default func;
