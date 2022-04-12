import { MockNFT } from "../typechain-types";
import { expect } from "chai";
import { ethers, deployments } from "hardhat";

describe("Mock NFT Contract", function () {
  let mockNFT: MockNFT;

  beforeEach(async function () {
    // Run deploy scripts
    await deployments.fixture();

    // Get deployed MockNFT contract
    mockNFT = await ethers.getContract("MockNFT");
  });

  it("Returns the correct test string", async () => {
    expect(await mockNFT.testString()).to.eq("TestString");
  });
});
