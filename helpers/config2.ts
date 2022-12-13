import { ethers } from "ethers";

const config2 = {
  createProjectData: {
    name: "Tack Line Torn",
    description: "Tack Line Torn",
    // artistAddress: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", // localhost
    artistAddress: "0x6bd62FeB486Bf699Ac04eD6DC09dE36D11720509", // Goerli
    artistName: "Phil Smith",
    website: "https://disentanglement.com",
    license: "MIT",
    baseURI: "FakeURI",
    scriptJSON: "Test JSON",
    scriptCount: 2,
    maxInvocations: 100,
    featureCategoryLabels: [
      "Palette",
      "Complexity",
      "Organization",
      "Symmetry",
    ],
    featureLabels: [
      ["Warm", "Cool", "Mixed"],
      ["Minimal", "Balanced", "Complex"],
      ["Chaotic", "Ordered", "Emergent"],
      ["Mirror", "Rotational", "Asymmetric"],
    ],
  },
  auctionData: {
    erc20: "0xcc36474d1B091e3a678b7dB035007d4D4Af602f8",
    auctionStartTime: Math.trunc(Date.now() / 1000) + 10,
    auctionEndTime: Math.trunc(Date.now() / 1000) + 10,
    auctionStartPrice: ethers.utils.parseEther("1"),
    auctionEndPrice: ethers.utils.parseEther("1"),
  },
};

export default config2;
