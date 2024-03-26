import { BigNumber, ethers } from "ethers";
import ProjectConfig from "../ProjectConfigType";

const projectConfig: ProjectConfig = {
  artworkConstructorData: {
    name: "Tack Line Torn",
    symbol: "TACK-LINE-TORN",
    artistAddress: "0x96D96D8Aea29bB81aBa09EeBF9fdE02542350354",
    royaltyFeeNumerator: BigNumber.from(750),
    royaltyPayees: ["0x96D96D8Aea29bB81aBa09EeBF9fdE02542350354", "0xAa9D46AE079851116967c6573f961B304095C34a"],
    royaltyShares: [BigNumber.from(500), BigNumber.from(250)],
  },
  traitsConstructorData: {
    traitsSetupData: {
      traitTypeNames: ["Palette", "Complexity", "Organization"],
      traitTypeValues: ["palette", "complexity", "organization"],
      traitNames: [
        "Wild Compass",
        "Aurora",
        "Dawn Whisper",
        "Tempest Surge",
        "Complex",
        "Balanced",
        "Minimal",
        "Emergent",
        "Chaotic",
        "Ordered"
      ],
      traitValues: [
        "WildCompass",
        "Aurora",
        "DawnWhisper",
        "TempestSurge",
        "Complex",
        "Balanced",
        "Minimal",
        "Emergent",
        "Chaotic",
        "Ordered"
      ],
      traitTypeIndexes: [0, 0, 0, 0, 1, 1, 1, 2, 2, 2],
      traitMaxSupplys: [
        BigNumber.from(50),
        BigNumber.from(50),
        BigNumber.from(50),
        BigNumber.from(50),
        BigNumber.from(50),
        BigNumber.from(50),
        BigNumber.from(50),
        BigNumber.from(50),
        BigNumber.from(50),
        BigNumber.from(50),
      ],
    },
    primarySalesPayees: ["0xAa9D46AE079851116967c6573f961B304095C34a"],
    primarySalesShares: [BigNumber.from(100)],
  },
  setupData: {
    auctionExponential: false,
    // auctionStartTime: Math.trunc(Date.now() / 1000) + 600,
    // auctionEndTime: Math.trunc(Date.now() / 1000) + 600,
    auctionStartTime: 1711465200,
    auctionEndTime: 1711468800,
    auctionStartPrice: ethers.utils.parseEther("0.01"),
    auctionEndPrice: ethers.utils.parseEther("0.001"),
    auctionPriceSteps: 720,
    // traitsSaleStartTime: Math.trunc(Date.now() / 1000) + 600,
    // whitelistStartTime: Math.trunc(Date.now() / 1000) + 600,
    traitsSaleStartTime: 1711465200,
    whitelistStartTime: 1711465200,
    whitelistAddresses: ["0xAa9D46AE079851116967c6573f961B304095C34a", "0xA3a8D06505C85049D57F7fcF00432Ca7A7800055", "0x02d53D2C706252814D7264edb7FAf15686939702"],
    whitelistAmounts: [10, 10, 10]
  },
};

export default projectConfig;
