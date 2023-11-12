// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

import {IScriptStorage} from "../interfaces/IScriptStorage.sol";

contract MockScriptStorage1 is IScriptStorage {
  string constant private script = "Test Script 1";

  function getScript() external pure returns (string memory) {
    return script;
  }
}
