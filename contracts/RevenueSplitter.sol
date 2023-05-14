// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

import {PaymentSplitter} from "@openzeppelin/contracts/finance/PaymentSplitter.sol";

contract RevenueSplitter is PaymentSplitter {
    constructor(
        address[] memory _payees,
        uint256[] memory _shares
    ) PaymentSplitter(_payees, _shares) {}

    error OnlyPayee();

    event PayeeUpdated(address oldPayee, address newPayee);

    function updatePayee(uint256 _payeeIndex) external {
      if(msg.sender != _payees[_payeeIndex]) revert OnlyPayee();
    }
}