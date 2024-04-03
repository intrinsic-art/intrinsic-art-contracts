// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

interface IBaseSetup {
    /**
     * Sets up the contract
     *
     * @param _data bytes containing setup data for initializing contract
     */
    function setup(bytes calldata _data) external;

    /**
     * Cancels a project and its auction
     * Contracts should revert if this is called and the auction has already started.
     */
    function cancel() external;
}