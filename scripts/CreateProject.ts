import { HardhatRuntimeEnvironment } from "hardhat/types";
import config from "../helpers/config";

const CreateProject = async (
  hre: HardhatRuntimeEnvironment,
  studioAddress: string
): Promise<void> => {
  const studio = await hre.ethers.getContractAt("Studio", studioAddress);

  await studio.createProject(
    config.createProjectData,
    config.createAuctionData,
    config.createAMMData,
    {
      gasLimit: 30000000,
    }
  );
  console.log(`Created Project ${config.createProjectData.name}`);
};

export default CreateProject;
