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

  const artwork = await hre.ethers.getContract("TackLineTornArtwork");

  const updateWhitelistData = (
    await hre.ethers.getContractFactory("Artwork", deployer)
  ).interface.encodeFunctionData("updateWhitelist", [
    1714137950, // whitelistStartTime
    [
      "0xcaF6Fd54fB74C95B28F5e94952ca21B46E4071cc",
      "0xA9838826d5Ef448e8D01f603eE3725039fea6351",
      "0xa24c7f31Db3f3429c5c743320671d3Effb8532Cc",
      "0x7FcA66Be797cb5d2962878FE442f4Ac199B08844",
      "0xaFE6520e39B77158e15b3377c1528B590a887800",
      "0x1c44E263714766348F4014B1Fd65029531713C70",
      "0xE4C8EFd2ed3051b22Ea3eedE1AF266452b0E66E9",
      "0xE25ECd59478cE509232e37C2E0810fd4c655B8b4",
      "0xd0c3339848Fb597aBD46fA650E3E411715f0bfB8",
      "0x6bd62FeB486Bf699Ac04eD6DC09dE36D11720509",
      "0x02d53D2C706252814D7264edb7FAf15686939702",
    ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
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
