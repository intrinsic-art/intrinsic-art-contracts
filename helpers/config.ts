import { ethers } from "ethers";

const config = {
  createProjectData: {
    name: "Disentanglement",
    description: "Relationships",
    artistAddress: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    artistName: "Phil Smith",
    website: "https://disentanglement.com",
    license: "MIT",
    baseURI: "FakeURI",
    scriptJSON: "Test JSON",
    scripts: [],
    maxInvocations: 100,
    featureCategoryLabels: [
      "featureKnots",
      "featureIveLostMyIdentity",
      "featureFacebookOfficial",
      "featureINeedSomeSpace",
      "featureSixtyNine",
      "featureMonochromatic",
      "featureGrayscale",
      "featureMyWorldTurnedUpsideDown",
    ],
    featureLabels: [
      [
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
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
      ],
      ["true", "false"],
      ["true", "false"],
      ["true", "false"],
      ["true", "false"],
      ["true", "false"],
      ["true", "false"],
      ["true", "false"],
    ],
  },
  createAuctionData: {
    startTime: 1000,
    endTime: 1000000000000,
    startPrice: ethers.utils.parseEther("1"),
    endPrice: ethers.utils.parseEther("0.1"),
    artistAddress: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    erc20Token: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  },
  createAMMData: {
    startTime: 1000,
    erc20Token: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
    constantA: [
      [
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
        ethers.utils.parseUnits("5", 16),
      ],
      [ethers.utils.parseUnits("5", 16), ethers.utils.parseUnits("5", 16)],
      [ethers.utils.parseUnits("5", 16), ethers.utils.parseUnits("5", 16)],
      [ethers.utils.parseUnits("5", 16), ethers.utils.parseUnits("5", 16)],
      [ethers.utils.parseUnits("5", 16), ethers.utils.parseUnits("5", 16)],
      [ethers.utils.parseUnits("5", 16), ethers.utils.parseUnits("5", 16)],
      [ethers.utils.parseUnits("5", 16), ethers.utils.parseUnits("5", 16)],
      [ethers.utils.parseUnits("5", 16), ethers.utils.parseUnits("5", 16)],
    ],
    constantB: [
      [
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
      ],
      [
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
      ],
      [
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
      ],
      [
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
      ],
      [
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
      ],
      [
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
      ],
      [
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
      ],
      [
        ethers.utils.parseUnits("2.23606797", 8),
        ethers.utils.parseUnits("2.23606797", 8),
      ],
    ],
  },
};

export default config;
