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
    traitsSaleStartTime: number;
  };
  scripts: string[];
}

export default ProjectConfig;
