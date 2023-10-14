import { BigNumber, ethers } from "ethers";
import ProjectConfig from "../ProjectConfigType";

const projectConfig: ProjectConfig = {
  artworkConstructorData: {
    royaltyFeeNumerator: BigNumber.from(1000),
    name: "intrinsic.art Tack Line Torn",
    symbol: "INSC",
    baseURI: "https://historian.encryptafile.com/artwork/",
    scriptJSON: `{
        "name": "Tack Line Torn",
        "description": "Tack Line Torn is a generative art project that takes the viewer on a visual journey through the chaos of a tearing sail tack line. In sailing, a tack line is crucial to the stability and direction of a vessel, and in this project, the once-reliable line is portrayed as it breaks apart in real-time. The piece is a representation of the unpredictable nature of life, as the path of fragmentation is unique with each viewing. The fragmented line symbolizes the loss of control and the fragility of stability, and invites the viewer to contemplate the beauty that can be found in the midst of destruction. Tack Line Torn is an immersive and thought-provoking generative art project that explores the themes of unpredictability, transience, and the beauty of chaos.",
        "artistName": "Phil Smith",
        "website": "https://tacklinetorn.com",
        "license": "MIT",
        "scriptLibrary": "p5.js",
        "scriptLibraryVersion": "1.0.0",
        "aspectRatio": "1:1"
      }`,
    owner: "0xAa9D46AE079851116967c6573f961B304095C34a",
    royaltyPayees: ["0xAa9D46AE079851116967c6573f961B304095C34a"],
    royaltyShares: [BigNumber.from(100)],
  },
  traitsConstructorData: {
    royaltyFeeNumerator: BigNumber.from(1000),
    uri: "https://historian.encryptafile.com/traits/",
    owner: "0xAa9D46AE079851116967c6573f961B304095C34a",
    primarySalesPayees: ["0xAa9D46AE079851116967c6573f961B304095C34a"],
    primarySalesShares: [BigNumber.from(100)],
    royaltyPayees: ["0xAa9D46AE079851116967c6573f961B304095C34a"],
    royaltyShares: [BigNumber.from(100)],
  },
  createTraitsData: {
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
  scheduleAuctionData: {
    auctionStartTime: Math.trunc(Date.now() / 1000) + 10,
    auctionEndTime: Math.trunc(Date.now() / 1000) + 10,
    // auctionStartTime: 1696003200,
    // auctionEndTime: 1696006800,
    auctionStartPrice: ethers.utils.parseEther("0.1"),
    auctionEndPrice: ethers.utils.parseEther("0.01"),
    traitsSaleStartTime: Math.trunc(Date.now() / 1000) + 10,
    // traitsSaleStartTime: 1692897600,
  },
};

export default projectConfig;
