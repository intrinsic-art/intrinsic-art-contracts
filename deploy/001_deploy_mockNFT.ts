import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployContract } from "../helpers/deployContract";
import Config from "../helpers/config";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  await deployContract(hre, "MockElement", []);
  await deployContract(hre, "MockCanvas", []);

  const mockElement = await hre.ethers.getContract("MockElement");
  const mockCanvas = await hre.ethers.getContract("MockCanvas");
  // Mock Canvas
  await mockCanvas.initialize(mockElement.address);
  await mockCanvas.addProject(
    Config.AddProject.projectName,
    Config.AddProject.artistAddress, // Artist Address
    Config.AddProject.invocations,
    Config.AddProject.dynamic
  );
  // Mint Canvas
  mockCanvas.safeMint(deployer, Config.safeMint.projectId);

  // Mock Elements
  await mockElement.createFeatures(
    Config.createFeatures.projectId,
    Config.createFeatures.featureCategories,
    Config.createFeatures.features
  );

  await mockElement.mintBatch(
    deployer,
    Config.mintBatch.ids,
    Config.mintBatch.amounts,
    Config.mintBatch.data
  );

  await mockElement.setApprovalForAll(mockCanvas.address, true);

  await mockCanvas.wrap(
    deployer,
    Config.wrap.featureIds,
    Config.wrap.amounts,
    Config.wrap.canvasId,
    Config.wrap.projectId
  );
};

export default func;
