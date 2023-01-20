import { HardhatRuntimeEnvironment } from "hardhat/types";

const AddAdmin = async (
  hre: HardhatRuntimeEnvironment,
  studioAddress: string,
  adminAddress: string
): Promise<void> => {
  const studio = await hre.ethers.getContractAt("Studio", studioAddress);

  await studio.addAdmins([adminAddress], {
    gasLimit: 8000000,
  });

  console.log(`Added admin`);
};

export default AddAdmin;
