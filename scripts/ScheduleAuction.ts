import { HardhatRuntimeEnvironment } from "hardhat/types";
import projectConfigs from "./projectConfigs";

const ScheduleAuction = async (
  hre: HardhatRuntimeEnvironment,
  projectIndex: number,
  projectId: string,
  studioAddress: string
): Promise<void> => {
  const studio = await hre.ethers.getContractAt("Studio", studioAddress);

  console.log(
    "auction start time: ",
    projectConfigs[projectIndex].scheduleAuctionData.auctionStartTime
  );

  await studio.scheduleAuction(
    projectConfigs[projectIndex].scheduleAuctionData.auctionStartTime,
    projectConfigs[projectIndex].scheduleAuctionData.auctionEndTime,
    projectConfigs[projectIndex].scheduleAuctionData.auctionStartPrice,
    projectConfigs[projectIndex].scheduleAuctionData.auctionEndPrice,
    {
      gasLimit: 8000000,
    }
  );

  console.log(`Scheduled Auction`);
};

export default ScheduleAuction;
