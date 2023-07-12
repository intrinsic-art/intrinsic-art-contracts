import { BigNumber, ethers } from "ethers";

interface ProjectConfig {
  artworkConstructorData: {
    royaltyFeeNumerator: BigNumber;
    name: string;
    symbol: string;
    baseURI: string;
    scriptJSON: string;
    owner: string;
    royaltyPayees: string[];
    royaltyShares: BigNumber[];
  };
  traitsConstructorData: {
    royaltyFeeNumerator: BigNumber;
    uri: string;
    owner: string;
    primarySalesPayees: string[];
    primarySalesShares: BigNumber[];
    royaltyPayees: string[];
    royaltyShares: BigNumber[];
  };
  createTraitsData: {
    traitTypeNames: string[];
    traitTypeValues: string[];
    traitNames: string[];
    traitValues: string[];
    traitTypeIndexes: number[];
    traitMaxSupplys: BigNumber[];
  };
  scheduleAuctionData: {
    auctionStartTime: number;
    auctionEndTime: number;
    auctionStartPrice: ethers.BigNumber;
    auctionEndPrice: ethers.BigNumber;
  };
  scripts: string[];
}

const projectConfigs: ProjectConfig[] = [
  {
    artworkConstructorData: {
      royaltyFeeNumerator: BigNumber.from(1000),
      name: "intrinsic.art Tack Line Torn",
      symbol: "INSC",
      baseURI: "https://api.intrinsic.art/",
      scriptJSON: `{
        "name": "Tack Line Torn",
        "description": "Tack Line Torn is a generative art project that takes the viewer on a visual journey through the chaos of a tearing sail tack line. In sailing, a tack line is crucial to the stability and direction of a vessel, and in this project, the once-reliable line is portrayed as it breaks apart in real-time. The piece is a representation of the unpredictable nature of life, as the path of fragmentation is unique with each viewing. The fragmented line symbolizes the loss of control and the fragility of stability, and invites the viewer to contemplate the beauty that can be found in the midst of destruction. Tack Line Torn is an immersive and thought-provoking generative art project that explores the themes of unpredictability, transience, and the beauty of chaos.",
        "artistName": "Phil Smith",
        "website": "https://tacklinetorn.com",
        "license": "MIT",
        "scriptLibrary": "p5.js",
        "scriptLibraryVersion": "1.0.0",
        "aspectRatio": "1"
      }`,
      owner: "0xAa9D46AE079851116967c6573f961B304095C34a",
      royaltyPayees: ["0xAa9D46AE079851116967c6573f961B304095C34a"],
      royaltyShares: [BigNumber.from(100)],
    },
    traitsConstructorData: {
      royaltyFeeNumerator: BigNumber.from(1000),
      uri: "https://api.intrinsic.art/",
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
        BigNumber.from(20),
        BigNumber.from(20),
        BigNumber.from(20),
        BigNumber.from(20),
        BigNumber.from(20),
        BigNumber.from(20),
        BigNumber.from(20),
        BigNumber.from(20),
        BigNumber.from(20),
      ],
    },
    scheduleAuctionData: {
      // auctionStartTime: Math.trunc(Date.now() / 1000) + 10,
      // auctionEndTime: Math.trunc(Date.now() / 1000) + 10,
      auctionStartTime: 1689267900,
      auctionEndTime: 1689268800,
      auctionStartPrice: ethers.utils.parseEther("0.1"),
      auctionEndPrice: ethers.utils.parseEther("0.01"),
    },
    scripts: [
      `let seed,imageDimension,referenceRatio,referenceDimension=1e3;function setup(){seed=parseInt(tokenData.hash.slice(0,16),16),referenceRatio=(imageDimension=Math.min(windowWidth,windowHeight))/referenceDimension,createCanvas(imageDimension,imageDimension),getArt()}function getArt(){let e,n,a,r,i,$,_,g,o;switch(complexity){case"minimal":g=range(1,4);break;case"balanced":g=range(16,24);break;case"complex":g=range(40,48)}switch(colorMode(HSB,360,100,100,100),push(),palette){case"warm":o=range(270,450)%360;break;case"cool":o=range(91,269);break;case"mixed":o=range(0,360)}background(o,rangeFloor(60,100),rangeFloor(80,100)),a=range(-1,1),r=range(-.5,.5),i=range(-1,1),$=range(-1,1),n=range(.05,.8)*imageDimension,_=0;for(let t=0;t<g;t++){switch(push(),palette){case"warm":o=range(270,450)%360;break;case"cool":o=range(91,269);break;`,
      `case"mixed":o=(o+range(140,220))%360}switch(stroke(e=color(o,100,100,15)),strokeWeight(.001*imageDimension),angleMode(DEGREES),organization){case"chaotic":a=range(-1,1),r=range(-.5,.5),i=range(-1,1),$=range(-1,1),n=range(.05,.8)*imageDimension,_=range(0,.01);break;case"ordered":break;case"emergent":a=range(-1,1),r=range(-.5,.5),i=range(-1,1),$=range(-1,1),n=range(.05,.8)*imageDimension}translate(range(0,imageDimension),range(0,imageDimension));for(let c=0;c<2*referenceDimension;c++)push(),rotate(c*a*range(1-2*_,1+2*_)),line(0,0,0,n*range(1-_,1+_)),pop(),rotate(r),translate(i*referenceRatio*range(1-_,1+_),$*referenceRatio*range(1-_,1+_));pop()}return canvas.toDataURL()}function rnd(){return seed^=seed<<13,seed^=seed>>17,((seed^=seed<<5)<0?1+~seed:seed)%1e3/1e3}function range(e,n){return void 0===n&&(n=e,e=0),rnd()*(n-e)+e}function rangeFloor(e,n){return void 0===n&&(n=e,e=0),Math.floor(range(e,n))}`,
    ],
  },
];

export default projectConfigs;
