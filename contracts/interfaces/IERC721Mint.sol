//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IERC721Mint {
    function safeMint(address _to, uint256 _projectId) external returns (uint256 tokenId);
}