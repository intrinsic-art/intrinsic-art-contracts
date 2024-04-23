import { BigNumber, ethers } from "ethers";
import ProjectConfig from "../ProjectConfigType";

const projectConfig: ProjectConfig = {
  artworkConstructorData: {
    name: "Metta",
    symbol: "METTA",
    artistAddress: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
    royaltySalesReceiverTestnet: "0x6bd62FeB486Bf699Ac04eD6DC09dE36D11720509",
    royaltySalesReceiverMainnet: "0x911a213d2e290eEeab5857f980A8d4AA92D3C157"
  },
  traitsConstructorData: {
    primarySalesReceiverTestnet: "0x6bd62FeB486Bf699Ac04eD6DC09dE36D11720509",
    primarySalesReceiverMainnet: "0xe2e2Cd71249dcaC4183Ca1086cFffD2C59096318",
    traitsSetupData: {
      traitTypeNames: [
        "View",
        "Mode",
        "Cell Dynamic",
        "Cell Design",
        "Color Mode",
      ],
      traitTypeValues: [
        "nodes",
        "mode",
        "cellDynamic",
        "cellDesign",
        "colorMode",
      ],
      traitNames: [
        "Macro",
        "Medium",
        "Full",
        "Wide",
        "Ephemeral",
        "Enduring",
        "Veiled",
        "Ephemeral Frenzy",
        "Enduring Frenzy",
        "Discreet",
        "Adjacent",
        "Interwoven",
        "Lines & Walls",
        "Startrail",
        "Popcorn",
        "Shards",
        "Invisible",
        "Tri-X",
        "Synchronized",
        "Agree To Disagree",
        "Gradient"
      ],
      traitValues: [
        "5",
        "20",
        "60",
        "125",
        "0",
        "1",
        "2",
        "3",
        "4",
        "0",
        "1",
        "2",
        "0",
        "1",
        "2",
        "3",
        "4",
        "0",
        "1",
        "2",
        "3",
      ],
      traitTypeIndexes: [
        0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4
      ],
      traitMaxSupplys: [
        BigNumber.from(48),
        BigNumber.from(76),
        BigNumber.from(76),
        BigNumber.from(56),
        BigNumber.from(72),
        BigNumber.from(64),
        BigNumber.from(56),
        BigNumber.from(40),
        BigNumber.from(24),
        BigNumber.from(64),
        BigNumber.from(120),
        BigNumber.from(72),
        BigNumber.from(72),
        BigNumber.from(64),
        BigNumber.from(56),
        BigNumber.from(36),
        BigNumber.from(28),
        BigNumber.from(56),
        BigNumber.from(88),
        BigNumber.from(72),
        BigNumber.from(40),
      ],
    },
  },
  setupDataTestnet: {
    auctionExponential: false,
    auctionStartTime: Math.trunc(Date.now() / 1000) + 600,
    auctionEndTime: 1714104000,
    auctionStartPrice: ethers.utils.parseEther("0.01"),
    auctionEndPrice: ethers.utils.parseEther("0.002"),
    auctionPriceSteps: 2,
    traitsSaleStartTime: 1714104000,
    whitelistStartTime: Math.trunc(Date.now() / 1000) + 600,
    whitelistAddresses: ["0xAa9D46AE079851116967c6573f961B304095C34a", "0xA3a8D06505C85049D57F7fcF00432Ca7A7800055", "0x02d53D2C706252814D7264edb7FAf15686939702"],
    whitelistAmounts: [10, 10, 10]
  },
  setupDataMainnet: {
    auctionExponential: false,
    auctionStartTime: 1714496400,
    auctionEndTime: 1714500000,
    auctionStartPrice: ethers.utils.parseEther("0.01"),
    auctionEndPrice: ethers.utils.parseEther("0.002"),
    auctionPriceSteps: 9,
    traitsSaleStartTime: 1714500000,
    whitelistStartTime: 1714323600,
    whitelistAddresses: [],
    whitelistAmounts: []
  },
};

export default projectConfig;
