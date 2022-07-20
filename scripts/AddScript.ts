import { HardhatRuntimeEnvironment } from "hardhat/types";
import script from "../helpers/script";

const AddScript = async (
  hre: HardhatRuntimeEnvironment,
  studioAddress: string,
  projectId: string
): Promise<void> => {
  const studio = await hre.ethers.getContractAt("Studio", studioAddress);

  await studio.addScript(projectId, script[0], {
    gasLimit: 30000000,
  });

  console.log("Added 0");

  await studio.addScript(projectId, script[1], {
    gasLimit: 30000000,
  });

  console.log("Added 1");

  await studio.addScript(projectId, script[2], {
    gasLimit: 30000000,
  });

  console.log("Added 2");

  await studio.addScript(projectId, script[3], {
    gasLimit: 30000000,
  });

  console.log("Added 3");

  await studio.addScript(projectId, script[4], {
    gasLimit: 30000000,
  });

  console.log("Added 4");

  console.log(`Added script to project ${projectId}`);
};

export default AddScript;
