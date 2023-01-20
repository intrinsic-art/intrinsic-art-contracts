import { HardhatRuntimeEnvironment } from "hardhat/types";
import script2 from "../helpers/script2";

const AddScript = async (
  hre: HardhatRuntimeEnvironment,
  studioAddress: string,
  projectId: string
): Promise<void> => {
  const studio = await hre.ethers.getContractAt("Studio", studioAddress);

  await studio.updateScript(projectId, 0, script2[0], {
    gasLimit: 8000000,
  });

  console.log("Added 0");

  await studio.updateScript(projectId, 1, script2[1], {
    gasLimit: 8000000,
  });

  console.log("Added 0");

  console.log(`Added script to project ${projectId}`);
};

export default AddScript;
