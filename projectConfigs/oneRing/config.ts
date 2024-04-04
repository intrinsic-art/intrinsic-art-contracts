import { BigNumber, ethers } from "ethers";
import ProjectConfig from "../ProjectConfigType";

const projectConfig: ProjectConfig = {
  artworkConstructorData: {
    name: "One Ring",
    symbol: "ONE-RING",
    artistAddress: "0x02d53D2C706252814D7264edb7FAf15686939702", //todo: update this back to heeey's address: 0x49f2495a1FB4fD0Fc90a10706B598B4594409A88
    royaltySalesReceiver: "0x6bd62FeB486Bf699Ac04eD6DC09dE36D11720509",
  },
  traitsConstructorData: {
    primarySalesReceiver: "0x6bd62FeB486Bf699Ac04eD6DC09dE36D11720509",
    traitsSetupData: {
      traitTypeNames: [
        "Background Hue",
        "Background Tone",
        "Ring Hue",
        "Ring Tone",
        "Ring Opacity",
      ],
      traitTypeValues: [
        "bH",
        "bT",
        "pH",
        "pT",
        "p0",
      ],
      traitNames: [
        "Red",
        "Orange",
        "Yellow",
        "Chartreuse",
        "Green",
        "Turquoise",
        "Cyan",
        "Cobalt",
        "Blue",
        "Violet",
        "Magenta",
        "Fuchsia",
        "Lighter",
        "Light",
        "Bright",
        "Brighter",
        "Dark",
        "Darker",
        "White",
        "Black",
        "Red",
        "Orange",
        "Yellow",
        "Chartreuse",
        "Green",
        "Turquoise",
        "Cyan",
        "Cobalt",
        "Blue",
        "Violet",
        "Magenta",
        "Fuchsia",
        "Lighter",
        "Light",
        "Bright",
        "Brighter",
        "Dark",
        "Darker",
        "White",
        "Black",
        "Transparent",
        "Semi-transparent",
        "Mid",
        "Semi-opaque",
        "Opaque",
      ],
      traitValues: [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "0",
        "1",
        "2",
        "3",
        "4",
      ],
      traitTypeIndexes: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        1, 1, 1, 1, 1, 1, 1, 1,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        3, 3, 3, 3, 3, 3, 3, 3,
        4, 4, 4, 4, 4,
      ],
      traitMaxSupplys: [
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(150),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(150),
        BigNumber.from(250),
        BigNumber.from(250),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(200),
        BigNumber.from(300),
        BigNumber.from(100),
        BigNumber.from(100),
        BigNumber.from(50),
        BigNumber.from(50),
        BigNumber.from(200),
        BigNumber.from(200),
        BigNumber.from(200),
        BigNumber.from(200),
        BigNumber.from(200), 
      ],
    },
  },
  setupData: {
    auctionExponential: false,
    auctionStartTime: Math.trunc(Date.now() / 1000) + 600,
    auctionEndTime: Math.trunc(Date.now() / 1000) + 600,
    // auctionStartTime: 1711465200,
    // auctionEndTime: 1711638000,
    auctionStartPrice: ethers.utils.parseEther("0.01"),
    auctionEndPrice: ethers.utils.parseEther("0.001"),
    auctionPriceSteps: 2,
    traitsSaleStartTime: Math.trunc(Date.now() / 1000) + 600,
    whitelistStartTime: Math.trunc(Date.now() / 1000) + 600,
    // traitsSaleStartTime: 1711465200,
    // whitelistStartTime: 1711465200,
    whitelistAddresses: ["0xAa9D46AE079851116967c6573f961B304095C34a", "0xA3a8D06505C85049D57F7fcF00432Ca7A7800055", "0x02d53D2C706252814D7264edb7FAf15686939702"],
    whitelistAmounts: [10, 10, 10]
  },
};

export default projectConfig;
