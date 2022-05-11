const Config = {
  AddProject: {
    projectName: "Phil's info",
    artistAddress: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    invocations: 1000000,
    dynamic: true,
  },
  safeMint: {
    to: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    projectId: 0,
  },
  createFeatures: {
    projectId: 1,
    featureCategories: [""],
    features: [""],
  },
  wrap: {
    owner: "",
    featureIds: [""],
    amounts: [""],
    canvasId: 1,
  },
  mintBatch: {
    to: "",
    ids: [],
    amounts: [],
    data: "",
  },
};

export default Config;
