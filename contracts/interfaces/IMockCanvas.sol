//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IMockCanvas {
    function initialize(
        string memory _name,
        string memory _symbol,
        string memory _script
    ) external;

    function safeMint(address to) external;

    function setTokenURI(uint256 tokenId, string memory uri) external;

    function setScript(string memory _script) external;
}
