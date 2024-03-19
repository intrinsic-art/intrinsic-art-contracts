// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

import {IStringStorage} from "../interfaces/IStringStorage.sol";

contract MockStringStorage is IStringStorage {
  // strings stored in separate variables instead of array
  // since solidity doesn't support constant string array variables
  string constant private _stringSlot0 = "Test JSON";
  string constant private _stringSlot1 ="Test Script";

  /** @inheritdoc IStringStorage*/
  function stringAtSlot(uint8 _slot) external pure returns (string memory) {
    if (_slot == 0) return _stringSlot0;
    if (_slot == 1) return _stringSlot1;
    revert EmptySlot();
  }
}
