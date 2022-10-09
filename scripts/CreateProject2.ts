import { HardhatRuntimeEnvironment } from "hardhat/types";
import config2 from "../helpers/config2";

const CreateProject = async (
  hre: HardhatRuntimeEnvironment,
  studioAddress: string
): Promise<void> => {
  const studio = await hre.ethers.getContractAt("Studio", studioAddress);

  await studio.createProject(
    config2.createProjectData,
    config2.createAuctionData,
    config2.createAMMData,
    {
      gasLimit: 30000000,
    }
  );
  console.log(`Created Project ${config2.createProjectData.name}`);
};

export default CreateProject;
