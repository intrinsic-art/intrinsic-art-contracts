import { HardhatRuntimeEnvironment } from "hardhat/types";
import config from "../helpers/config";

const CreateProject = async (
  hre: HardhatRuntimeEnvironment,
  studioAddress: string
): Promise<void> => {
  const studio = await hre.ethers.getContractAt("Studio", studioAddress);

  console.log(
    await studio.createProject(
      config.artistAddress,
      config.maxSupply,
      config.metadata,
      config.elementCategoryLabels,
      config.elementCategoryValues,
      config.elementLabels,
      config.elementValues,
      config.elementAmounts,
      config.recipients,
      {
        gasLimit: 20000000,
      }
    )
  );
  console.log("Created project");
};

export default CreateProject;
