// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

interface IStringStorage {
  error EmptySlot();

  /**
   * Returns the string stored at the specific slot
   * Reverts if an invalid slot is provided
   *
   * @param _slot the slot to get the string at
   * @return string the string stored at the specified slot
   */
  function stringAtSlot(uint8 _slot) external pure returns (string memory);
}