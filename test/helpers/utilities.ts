import { ethers } from "ethers";

export const artworkHash = (
  artworkAddress: string,
  userAddress: string,
  saltNonce: number
): string => {
  return ethers.utils.keccak256(
    ethers.utils.solidityPack(
      ["address", "address", "uint256"],
      [artworkAddress, userAddress, saltNonce]
    )
  );
};
