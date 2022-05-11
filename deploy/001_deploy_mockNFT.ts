import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployContract } from "../helpers/deployContract";
import Config from "../helpers/config";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  await deployContract(hre, "MockElement", []);
  await deployContract(hre, "MockCanvas", []);

  const mockElement = await hre.ethers.getContract("MockElement");
  const mockCanvas = await hre.ethers.getContract("MockCanvas");
  // Mock Canvas
  await mockCanvas.initialize(MockElement.address);
  await mockCanvas.addProject(
    Config.AddProject.projectName,
    Config.AddProject.artistAddress, // Artist Address
    Config.AddProject.invocations,
    Config.AddProject.dynamic
  );

  for (let i = 0; i < 10; i++) {
    mockCanvas.safeMint(Config.safeMint.to, Config.safeMint.projectId);
  }
  // Mock Elements
  await mockElement.createFeatures(
    Config.createFeatures.projectId,
    Config.createFeatures.featureCategories,
    Config.createFeatures.features
  );
};

export default func;
