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
  createAuctionData: {
    startTime: 1000,
    endTime: 1000000000000,
    startPrice: ethers.utils.parseEther("1"),
    endPrice: ethers.utils.parseEther("0.1"),
    // artistAddress: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8", // localhost
    artistAddress: "0x7930DdA80157Fcc47ba9c3836398c82d89C16416", // Goerli
    // erc20Token: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707", // localhost
    erc20Token: "0x4bAA305f6cfE512960356F8484f8a03898E3E140",
  },
  createAMMData: {
    startTime: 1000,
    // erc20Token: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707", // localhost
    erc20Token: "0x4bAA305f6cfE512960356F8484f8a03898E3E140",
    constantA: [
      [
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
      ],
      [
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
      ],
      [
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
      ],
      [
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
      ],
    ],
    constantB: [
      [
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
      ],
      [
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
      ],
      [
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
      ],
      [
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
      ],
    ],
  },
};

export default config2;
