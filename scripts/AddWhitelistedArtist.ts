import { HardhatRuntimeEnvironment } from "hardhat/types";

const AddWhitelistedArtist = async (
  hre: HardhatRuntimeEnvironment,
  studioAddress: string,
  artistAddress: string
): Promise<void> => {
  const studio = await hre.ethers.getContractAt("Studio", studioAddress);

  await studio.addWhitelistedArtists([artistAddress], {
    gasLimit: 8000000,
  });

  console.log(`Added whitelisted artist`);
};

export default AddWhitelistedArtist;
