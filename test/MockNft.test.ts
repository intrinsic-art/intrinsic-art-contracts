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

  it("Supports the expected ERC165 interface", async () => {
    expect(await mockNFT.testString()).to.eq("TestString");
  });
});
