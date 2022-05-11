const Config = {
  AddProject: {
    projectName: "Phil's info",
    artistAddress: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    invocations: 1000000,
    dynamic: true,
  },
  safeMint: {
    to: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", // hardhat deployer
    projectId: 0,
  },
  createFeatures: {
    projectId: 0,
    featureCategories: [
      "featureKnots",
      "featureIveLostMyIdentity",
      "featureFacebookOfficial",
      "featureINeedSomeSpace",
      "featureSixtyNine",
      "featureMonochromatic",
      "featureGrayscale",
      "featureMyWorldTurnedUpsideDown",
    ],
    features: [
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
  mintBatch: {
    to: "",
    ids: [1, 2, 3, 4, 5, 6, 7, 8],
    amounts: [1, 1, 1, 1, 1, 1, 1, 1],
    data: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  },
  wrap: {
    owner: "",
    featureIds: [1, 2, 3, 4, 5, 6, 7, 8],
    amounts: [1, 1, 1, 1, 1, 1, 1, 1],
    canvasId: 1,
    projectId: 0,
  },
};

export default Config;
