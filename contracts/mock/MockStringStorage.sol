// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

import {IStringStorage} from "../interfaces/IStringStorage.sol";

contract MockStringStorage is IStringStorage {
  string constant private _stringSlot1 = "Test Script 1";

  /** @inheritdoc IStringStorage*/
  function stringAtSlot(uint8 _slot) external pure returns (string memory) {
    if (_slot == 0) {
      return _stringSlot1;
    }

    revert EmptySlot();
  }
}
