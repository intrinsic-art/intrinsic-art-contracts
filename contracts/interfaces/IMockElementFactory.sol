//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./IMockElement.sol";

interface IMockElementFactory {
    event ElementCreated( address elementImpl, string name, string symbol);
    function createElement(
        address elementImpl,
        string[] memory names,
        string[] memory symbols
    ) external;
}