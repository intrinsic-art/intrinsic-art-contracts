import { HardhatRuntimeEnvironment } from "hardhat/types";

const LockProject = async (
  hre: HardhatRuntimeEnvironment,
  projectId: string,
  studioAddress: string
): Promise<void> => {
  const studio = await hre.ethers.getContractAt("Studio", studioAddress);

  await studio.lockProject(projectId);

  console.log(`Locked project ${projectId}`);
};

export default LockProject;
