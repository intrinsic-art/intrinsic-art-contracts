import { BigNumber } from "ethers";

interface ProjectConfig {
  artworkConstructorData: {
    name: string;
    symbol: string;
    artistAddress: string;
    royaltySalesReceiver: string;
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
    primarySalesReceiver: string;
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
