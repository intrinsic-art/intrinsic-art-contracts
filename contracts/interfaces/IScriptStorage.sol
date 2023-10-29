// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

interface IScriptStorage {
  function getScript() external pure returns (string memory);
}