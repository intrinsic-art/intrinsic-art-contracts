import { HardhatRuntimeEnvironment } from "hardhat/types";

const UpdateWhitelist = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  const {
    deployments: { deploy, execute },
    getNamedAccounts,
    getChainId,
  } = hre;

  const chainId = await getChainId();
  let testnet: boolean;
  if (chainId === "84532") {
    // Base Sepolia
    testnet = true;
  } else if (chainId === "8453") {
    // Base Mainnet
    testnet = false;
  } else {
    console.error("Invalid chain");
    return;
  }

  console.log("testnet: ", testnet);

  const { deployer } = await getNamedAccounts();

  const artwork = await hre.ethers.getContract("MettaArtwork");

  const updateWhitelistData = (
    await hre.ethers.getContractFactory("Artwork", deployer)
  ).interface.encodeFunctionData("updateWhitelist", [
    1714137950, // whitelistStartTime
    [
      "0xb56AE8A727Cf38f1F4716AeDa6749d2aF340d8F4",
    ],
    [1],
  ]);

  await execute(
    "ProjectRegistry",
    { log: true, from: deployer },
    "execute",
    [artwork.address],
    [0],
    [updateWhitelistData]
  );
};

export default UpdateWhitelist;
