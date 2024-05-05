import { BigNumber, ethers } from "ethers";
import ProjectConfig from "../ProjectConfigType";

const projectConfig: ProjectConfig = {
  artworkConstructorData: {
    name: "Tack Line Torn",
    symbol: "TACK-LINE-TORN",
    artistAddress: "0x5400DB91661Ad2b2a5664cAaF81C5Cae8AafF514",
    royaltySalesReceiverTestnet: "0x5c64dEe7379fC1724AD6e450B1658010B24b01c6",
    royaltySalesReceiverMainnet: "0x5c64dEe7379fC1724AD6e450B1658010B24b01c6",
  },
  traitsConstructorData: {
    primarySalesReceiverTestnet: "0x8B643840cF60282a2a6F09dB8493c513014B6585",
    primarySalesReceiverMainnet: "0x8B643840cF60282a2a6F09dB8493c513014B6585",
    traitsSetupData: {
      traitTypeNames: ["Palette", "Force", "Status"],
      traitTypeValues: ["palette", "force", "status"],
      traitNames: [
        "Wild Compass",
        "Aurora",
        "Dawn Whisper",
        "Tempest Surge",
        "Gale",
        "Gust",
        "Breeze",
        "Adrift",
        "Riven",
        "Docked"
      ],
      traitValues: [
        "WildCompass",
        "Aurora",
        "DawnWhisper",
        "TempestSurge",
        "Gale",
        "Gust",
        "Breeze",
        "Adrift",
        "Riven",
        "Docked"
      ],
      traitTypeIndexes: [0, 0, 0, 0, 1, 1, 1, 2, 2, 2],
      traitMaxSupplys: [
        BigNumber.from(90),
        BigNumber.from(90),
        BigNumber.from(90),
        BigNumber.from(90),
        BigNumber.from(120),
        BigNumber.from(120),
        BigNumber.from(120),
        BigNumber.from(120),
        BigNumber.from(120),
        BigNumber.from(120),
      ],
    },
  },
  setupDataTestnet: {
    auctionExponential: false,
    auctionStartTime: Math.trunc(Date.now() / 1000) + 3600,
    auctionEndTime: Math.trunc(Date.now() / 1000) + 3600,
    auctionStartPrice: ethers.utils.parseEther("0.001"),
    auctionEndPrice: ethers.utils.parseEther("0.001"),
    auctionPriceSteps: 2,
    traitsSaleStartTime: Math.trunc(Date.now() / 1000) + 3600,
    whitelistStartTime: Math.trunc(Date.now() / 1000) + 3600,
    whitelistAddresses: [],
    whitelistAmounts: []
  },
  setupDataMainnet: {
    auctionExponential: false,
    auctionStartTime: 1715274000,
    auctionEndTime: 1715274000,
    auctionStartPrice: ethers.utils.parseEther("0.001"),
    auctionEndPrice: ethers.utils.parseEther("0.001"),
    auctionPriceSteps: 2,
    traitsSaleStartTime: 1715274000,
    whitelistStartTime: 1715274000,
    whitelistAddresses: [],
    whitelistAmounts: []
  },
};

export default projectConfig;
