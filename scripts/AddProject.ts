import { HardhatRuntimeEnvironment } from "hardhat/types";
import Config from "../helpers/Config";

const AddProject = async (
  hre: HardhatRuntimeEnvironment,
  coloringBookAddress: string
): Promise<void> => {
  const coloringBook = await hre.ethers.getContractAt(
    "ColoringBook",
    coloringBookAddress
  );

  await coloringBook.addProject(
    Config.AddProject.createProject,
    Config.AddProject.createMetaData,
    Config.AddProject.createScripts,
    Config.AddProject.createAuction,
    Config.AddProject.createFeatAndCat,
    Config.AddProject.createAMM
  );
  console.log(`Project Name ${Config.AddProject.createProject.projectName}`);
  console.log(`Project Name ${Config.AddProject.createProject.artistName}`);
  console.log(`Project Name ${Config.AddProject.createProject.description}`);
};

export default AddProject;
