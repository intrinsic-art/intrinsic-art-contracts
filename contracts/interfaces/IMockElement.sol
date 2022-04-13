//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IMockElement {
    function initialize(string memory name, string memory symbol) external;

    function safeMint(address to, string memory uri) external;
}
