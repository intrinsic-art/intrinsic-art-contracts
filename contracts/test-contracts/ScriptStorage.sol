// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

import {IScriptStorage} from "../interfaces/IScriptStorage.sol";

contract ScriptStorage is IScriptStorage {
  string constant private script = "asdf";

  function getScript() external pure returns (string memory) {
    return script;
  }
}
