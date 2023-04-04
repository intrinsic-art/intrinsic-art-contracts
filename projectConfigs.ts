import { ethers } from "ethers";

interface ProjectConfig {
  studioConstructorData: {
    name: string;
    symbol: string;
    baseURI: string;
    scriptJSON: string;
    artistAddress: string;
    owner: string;
  };
  traitsConstructorData: {
    uri: string;
    owner: string;
    platformRevenueClaimer: string;
    artistRevenueClaimer: string;
  };
  createTraitsData: {
    traitTypeNames: string[];
    traitTypeValues: string[];
    traitNames: string[];
    traitValues: string[];
    traitTypeIndexes: number[];
    traitMaxRevenues: ethers.BigNumber[];
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
    studioConstructorData: {
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
      artistAddress: "0xAa9D46AE079851116967c6573f961B304095C34a",
      owner: "0xAa9D46AE079851116967c6573f961B304095C34a",
    },
    traitsConstructorData: {
      uri: "https://api.intrinsic.art/",
      owner: "0xAa9D46AE079851116967c6573f961B304095C34a",
      platformRevenueClaimer: "0xAa9D46AE079851116967c6573f961B304095C34a",
      artistRevenueClaimer: "0xAa9D46AE079851116967c6573f961B304095C34a",
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
      traitMaxRevenues: [
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
      ],
    },
    scheduleAuctionData: {
      auctionStartTime: Math.trunc(Date.now() / 1000) + 10,
      auctionEndTime: Math.trunc(Date.now() / 1000) + 10,
      auctionStartPrice: ethers.utils.parseEther("0.001"),
      auctionEndPrice: ethers.utils.parseEther("0.001"),
    },
    scripts: [
      `let seed,imageDimension;function setup(){seed=parseInt(tokenData.hash.slice(0,16),16),imageDimension=Math.min(windowWidth,windowHeight),createCanvas(imageDimension,imageDimension),getArt()}function getArt(){let a,n,r,i,g,s,o,t,c;switch(complexity){case"minimal":t=range(1,4);break;case"balanced":t=range(16,24);break;case"complex":t=range(40,48)}switch(colorMode(HSB,360,100,100,100),push(),palette){case"warm":c=range(270,450)%360;break;case"cool":c=range(91,269);break;case"mixed":c=range(0,360)}background(c,rangeFloor(60,100),rangeFloor(80,100)),r=range(-1,1),i=range(-.5,.5),g=range(-1,1),s=range(-1,1),n=range(.05,.8)*imageDimension,o=0;for(let e=0;e<t;e++){switch(push(),palette){case"warm":c=range(270,450)%360;break;case"cool":c=range(91,269);break;case"mixed":`,
      `c=(c+range(140,220))%360}switch(a=color(c,100,100,15),stroke(a),strokeWeight(.001*imageDimension),angleMode(DEGREES),organization){case"chaotic":r=range(-1,1),i=range(-.5,.5),g=range(-1,1),s=range(-1,1),n=range(.05,.8)*imageDimension,o=range(0,.01);break;case"ordered":break;case"emergent":r=range(-1,1),i=range(-.5,.5),g=range(-1,1),s=range(-1,1),n=range(.05,.8)*imageDimension}translate(range(0,imageDimension),range(0,imageDimension));for(let e=0;e<2*imageDimension;e++)push(),rotate(e*r*range(1-2*o,1+2*o)),line(0,0,0,n*range(1-o,1+o)),pop(),rotate(i),translate(g*range(1-o,1+o),s*range(1-o,1+o));pop()}return canvas.toDataURL()}function rnd(){return seed^=seed<<13,seed^=seed>>17,seed^=seed<<5,(seed<0?1+~seed:seed)%1e3/1e3}function range(e,a){return void 0===a&&(a=e,e=0),rnd()*(a-e)+e}function rangeFloor(e,a){return void 0===a&&(a=e,e=0),Math.floor(range(e,a))}`,
    ],
  },
];

export default projectConfigs;
