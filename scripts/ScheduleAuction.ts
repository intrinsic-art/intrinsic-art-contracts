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
    projectConfigs[projectIndex].auctionData.auctionStartTime
  );

  await studio.scheduleAuction(
    projectId,
    projectConfigs[projectIndex].auctionData.erc20,
    projectConfigs[projectIndex].auctionData.auctionStartTime,
    projectConfigs[projectIndex].auctionData.auctionEndTime,
    projectConfigs[projectIndex].auctionData.auctionStartPrice,
    projectConfigs[projectIndex].auctionData.auctionEndPrice,
    {
      gasLimit: 8000000,
    }
  );

  console.log(`Scheduled Auction`);
};

export default ScheduleAuction;
