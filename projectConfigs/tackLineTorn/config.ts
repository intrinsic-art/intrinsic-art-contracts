import { BigNumber, ethers } from "ethers";
import ProjectConfig from "../ProjectConfigType";

const projectConfig: ProjectConfig = {
  artworkConstructorData: {
    name: "Tack Line Torn",
    symbol: "TLT",
    artistAddress: "0xAa9D46AE079851116967c6573f961B304095C34a",
    royaltyFeeNumerator: BigNumber.from(1000),
    royaltyPayees: ["0xAa9D46AE079851116967c6573f961B304095C34a"],
    royaltyShares: [BigNumber.from(100)],
  },
  traitsConstructorData: {
    traitsSetupData: {
      traitTypeNames: ["Palette", "Complexity", "Organization"],
      traitTypeValues: ["palette", "complexity", "organization"],
      traitNames: [
        "Mixed",
        "Warm",
        "Cool",
        "Complex",
        "Balanced",
        "Minimal",
        "Emergent",
        "Chaotic",
        "Ordered",
      ],
      traitValues: [
        "mixed",
        "warm",
        "cool",
        "complex",
        "balanced",
        "minimal",
        "emergent",
        "chaotic",
        "ordered",
      ],
      traitTypeIndexes: [0, 0, 0, 1, 1, 1, 2, 2, 2],
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
    whitelistAddresses: ["0xAa9D46AE079851116967c6573f961B304095C34a"],
    whitelistAmounts: [10]
  },
};

export default projectConfig;
