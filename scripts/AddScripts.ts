import { HardhatRuntimeEnvironment } from "hardhat/types";
import projectConfigs from "./projectConfigs";

const AddScripts = async (
  hre: HardhatRuntimeEnvironment,
  projectConfigIndex: number,
  projectId: string,
  studioAddress: string
): Promise<void> => {
  const studio = await hre.ethers.getContractAt("Studio", studioAddress);
  const scripts = projectConfigs[projectConfigIndex].scripts;

  for (const [scriptNumber, script] of scripts.entries()) {
    console.log("Uploading script ", scriptNumber);

    console.log(
      await studio.updateScript(projectId, scriptNumber, script, {
        gasLimit: 8000000,
      })
    );
  }

  console.log(`Added scripts to project ${projectId}`);
};

export default AddScripts;
