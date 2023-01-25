import { HardhatRuntimeEnvironment } from "hardhat/types";
import projectConfigs from "./projectConfigs";

const CreateProject = async (
  hre: HardhatRuntimeEnvironment,
  projectConfigIndex: number,
  studioAddress: string
): Promise<void> => {
  const studio = await hre.ethers.getContractAt("Studio", studioAddress);

  // await studio.createProject(
  //   projectConfigs[projectConfigIndex].createProjectData.artistAddress,
  //   projectConfigs[projectConfigIndex].createProjectData.maxSupply,
  //   projectConfigs[projectConfigIndex].createProjectData.metadata,
  //   projectConfigs[projectConfigIndex].createProjectData.elementCategoryLabels,
  //   projectConfigs[projectConfigIndex].createProjectData.elementCategoryValues,
  //   projectConfigs[projectConfigIndex].createProjectData.elementLabels,
  //   projectConfigs[projectConfigIndex].createProjectData.elementValues,
  //   projectConfigs[projectConfigIndex].createProjectData.elementAmounts,
  //   projectConfigs[projectConfigIndex].createProjectData.recipients,
  //   {
  //     gasLimit: 20000000,
  //   }
  // );

  console.log("Created project");
};

export default CreateProject;
