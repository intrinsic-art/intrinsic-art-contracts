import { HardhatRuntimeEnvironment } from "hardhat/types";
import projectConfigs from "./projectConfigs";

const CreateMarkets = async (
  hre: HardhatRuntimeEnvironment,
  projectIndex: number,
  projectId: string,
  studioAddress: string
): Promise<void> => {
  const studio = await hre.ethers.getContractAt("Studio", studioAddress);

  console.log(
    await studio.updateMarkets(
      projectId,
      projectConfigs[projectIndex].createMarketData,
      {
        gasLimit: 8000000,
      }
    )
  );

  console.log(`Created markets for project ${projectId}`);
};

export default CreateMarkets;
