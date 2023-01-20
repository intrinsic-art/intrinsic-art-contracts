import { HardhatRuntimeEnvironment } from "hardhat/types";
import script from "../../helpers/script";

const AddScript = async (
  hre: HardhatRuntimeEnvironment,
  studioAddress: string,
  projectId: string
): Promise<void> => {
  const studio = await hre.ethers.getContractAt("Studio", studioAddress);

  await studio.updateScript(projectId, 0, script[0], {
    gasLimit: 8000000,
  });

  console.log("Added 0");

  await studio.updateScript(projectId, 1, script[1], {
    gasLimit: 8000000,
  });

  console.log("Added 1");

  await studio.updateScript(projectId, 2, script[2], {
    gasLimit: 8000000,
  });

  console.log("Added 2");

  await studio.updateScript(projectId, 3, script[3], {
    gasLimit: 8000000,
  });

  console.log("Added 3");

  await studio.updateScript(projectId, 4, script[4], {
    gasLimit: 8000000,
  });

  console.log("Added 4");

  console.log(`Added script to project ${projectId}`);
};

export default AddScript;
