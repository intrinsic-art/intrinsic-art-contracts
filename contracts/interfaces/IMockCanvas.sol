//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IMockCanvas {
    function initialize(string memory _name, string memory _symbo) external;

    function addProject(
        string memory _projectName,
        address _artistAddress,
        uint256 _pricePerTokenInWei,
        uint256 _maxInvocations,
        bool _dynamic
    ) external;

    function safeMint(address to, uint256 _projectId) external;
}
