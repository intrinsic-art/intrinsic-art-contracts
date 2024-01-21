import { BigNumber, ethers } from "ethers";
import ProjectConfig from "../ProjectConfigType";

const projectConfig: ProjectConfig = {
  artworkConstructorData: {
    name: "Metta",
    symbol: "METTA",
    artistAddress: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
    royaltyFeeNumerator: BigNumber.from(750),
    royaltyPayees: ["0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653", "0xAa9D46AE079851116967c6573f961B304095C34a"],
    royaltyShares: [BigNumber.from(500), BigNumber.from(250)],
  },
  traitsConstructorData: {
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
        BigNumber.from(96),
        BigNumber.from(152),
        BigNumber.from(152),
        BigNumber.from(112),
        BigNumber.from(144),
        BigNumber.from(128),
        BigNumber.from(112),
        BigNumber.from(80),
        BigNumber.from(48),
        BigNumber.from(128),
        BigNumber.from(240),
        BigNumber.from(144),
        BigNumber.from(144),
        BigNumber.from(128),
        BigNumber.from(112),
        BigNumber.from(72),
        BigNumber.from(56),
        BigNumber.from(176),
        BigNumber.from(144),
        BigNumber.from(112),
        BigNumber.from(80)
      ],
    },
    primarySalesPayees: ["0xAa9D46AE079851116967c6573f961B304095C34a"],
    primarySalesShares: [BigNumber.from(100)],
    royaltyPayees: ["0xAa9D46AE079851116967c6573f961B304095C34a"],
    royaltyShares: [BigNumber.from(100)],
  },
  setupData: {
    auctionExponential: true,
    auctionStartTime: Math.trunc(Date.now() / 1000) + 600,
    auctionEndTime: Math.trunc(Date.now() / 1000) + 864000,
    auctionStartPrice: ethers.utils.parseEther("0.1"),
    auctionEndPrice: ethers.utils.parseEther("0.01"),
    auctionPriceSteps: 720,
    traitsSaleStartTime: Math.trunc(Date.now() / 1000) + 600,
    whitelistStartTime: Math.trunc(Date.now() / 1000) + 600,
    whitelistAddresses: ["0xAa9D46AE079851116967c6573f961B304095C34a", "0xA3a8D06505C85049D57F7fcF00432Ca7A7800055", "0x02d53D2C706252814D7264edb7FAf15686939702"],
    whitelistAmounts: [10, 10, 10]
  },
};

export default projectConfig;
