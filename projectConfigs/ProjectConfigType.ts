import { BigNumber } from "ethers";

interface ProjectConfig {
  artworkConstructorData: {
    name: string;
    symbol: string;
    artistAddress: string;
    royaltyFeeNumerator: BigNumber;
    royaltyPayees: string[];
    royaltyShares: BigNumber[];
  };
  traitsConstructorData: {
    traitsSetupData: {
      traitTypeNames: string[];
      traitTypeValues: string[];
      traitNames: string[];
      traitValues: string[];
      traitTypeIndexes: number[];
      traitMaxSupplys: BigNumber[];
    };
    primarySalesPayees: string[];
    primarySalesShares: BigNumber[];
  };
  setupData: {
    auctionExponential: boolean;
    auctionStartTime: number;
    auctionEndTime: number;
    auctionStartPrice: BigNumber;
    auctionEndPrice: BigNumber;
    auctionPriceSteps: number;
    traitsSaleStartTime: number;
    whitelistStartTime: number;
    whitelistAddresses: string[];
    whitelistAmounts: number[];
  };
}

export default ProjectConfig;
