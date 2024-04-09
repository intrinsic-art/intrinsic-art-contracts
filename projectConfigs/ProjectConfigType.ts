import { BigNumber } from "ethers";

interface ProjectConfig {
  artworkConstructorData: {
    name: string;
    symbol: string;
    artistAddress: string;
    royaltySalesReceiverTestnet: string;
    royaltySalesReceiverMainnet: string;
  };
  traitsConstructorData: {
    primarySalesReceiverTestnet: string;
    primarySalesReceiverMainnet: string;
    traitsSetupData: {
      traitTypeNames: string[];
      traitTypeValues: string[];
      traitNames: string[];
      traitValues: string[];
      traitTypeIndexes: number[];
      traitMaxSupplys: BigNumber[];
    };
  };
  setupDataTestnet: {
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
  setupDataMainnet: {
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
