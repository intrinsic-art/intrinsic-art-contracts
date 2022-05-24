//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IMockElement {
    function setURI(string memory newuri) external;

    function mint(
        address account,
        uint256 id,
        uint256 amount
    ) external;

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) external;

    function createFeature(string calldata feature)
        external
        returns (uint256 tokenId);
}
