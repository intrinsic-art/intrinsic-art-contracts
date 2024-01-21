// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IPaymentSplitter {
    event PayeeAdded(address account, uint256 shares);
    event PaymentReleased(address to, uint256 amount);
    event ERC20PaymentReleased(
        IERC20 indexed token,
        address to,
        uint256 amount
    );

    error InvalidArrayLengths();
    error NoPayees();
    error NoShares();
    error NoPaymentDue();
    error ZeroAddress();
    error DuplicatePayee();
    error ZeroShares();

    /**
     * Triggers a transfer to msg.sender of the amount of Ether they are owed
     */
    function releaseETH() external;

    /**
     * Triggers a transfer to msg.sender of the amount of the specified token they are owed
     */
    function releaseERC20(IERC20 token) external;

    /**
     * Getter for the total shares held by payees
     *
     * @return uint256 total shares held by payees
     */
    function totalShares() external view returns (uint256);

    /**
     * Getter for the total amount of ETH already released
     *
     * @return uint256 total amount of ETH released
     */
    function totalReleasedETH() external view returns (uint256);

    /**
     * Getter for the total amount of specified token released
     *
     * @return uint256 total amount of specified token released
     */
    function totalReleasedERC20(IERC20 token) external view returns (uint256);

    /**
     * Getter for the amount of shares held by an account
     *
     * @return uint256 amount of shares held by the account
     */
    function shares(address account) external view returns (uint256);

    /**
     * Getter for the amount of ETH already released to a payee
     *
     * @return uint256 amount of ETH released to the specified account
     */
    function releasedETH(address account) external view returns (uint256);

    /**
     * Getter for the amount of the specified token released to a payee
     *
     * @return uint256 amount of the specified token released to a payee
     */
    function releasedERC20(
        IERC20 token,
        address account
    ) external view returns (uint256);

    /**
     * Getter for the address of the payee for the specified index
     *
     * @return address the address of the payee
     */
    function payee(uint256 index) external view returns (address);

    /**
     * Getter for all payees and their respective shares
     *
     * @return payees_ array of all payee addresses
     * @return shares_ array of all payee share amounts
     */
    function payees()
        external
        view
        returns (address[] memory payees_, uint256[] memory shares_);

    /**
     * Getter for the amount of payee's releasable ETH
     *
     * @return uint256 amount of releasable ETH
     */
    function releasableETH(address account) external view returns (uint256);

    /**
     * Getter for the amount of specified token releasable for the account
     *
     * @param token the address of the token
     * @param account the address of the payee
     *
     * @return uint256 the amount of token releasable to the payee
     */
    function releasableERC20(
        IERC20 token,
        address account
    ) external view returns (uint256);
}
