// SPDX-License-Identifier: MIT
// Forked from OpenZeppelin PaymentSplitter.sol release-v4.8
pragma solidity =0.8.19;

import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {IPaymentSplitter} from "./interfaces/IPaymentSplitter.sol";

/**
 * This contract supports multiple payees with different share amounts
 * to receive payments in ETH and ERC20 tokens
 */
contract PaymentSplitter is IPaymentSplitter {
    uint256 private _totalShares;
    uint256 private _totalReleased;
    address[] private _payees;
    mapping(address => uint256) private _shares;
    mapping(address => uint256) private _released;
    mapping(IERC20 => uint256) private _erc20TotalReleased;
    mapping(IERC20 => mapping(address => uint256)) private _erc20Released;

    constructor(address[] memory payees_, uint256[] memory shares_) payable {
        if (payees_.length != shares_.length) revert InvalidArrayLengths();
        if (payees_.length == 0) revert NoPayees();

        for (uint256 i; i < payees_.length; ) {
            _addPayee(payees_[i], shares_[i]);

            unchecked {
                ++i;
            }
        }
    }

    receive() external payable {}

    /** @inheritdoc IPaymentSplitter*/
    function releaseETH() public {
        if (_shares[msg.sender] == 0) revert NoShares();

        uint256 payment = releasableETH(msg.sender);

        if (payment == 0) revert NoPaymentDue();

        // _totalReleased is the sum of all values in _released.
        // If "_totalReleased += payment" does not overflow, then "_released[account] += payment" cannot overflow.
        _totalReleased += payment;
        unchecked {
            _released[msg.sender] += payment;
        }

        Address.sendValue(payable(msg.sender), payment);
        emit PaymentReleased(msg.sender, payment);
    }

    /** @inheritdoc IPaymentSplitter*/
    function releaseERC20(IERC20 token) public {
        if (_shares[msg.sender] == 0) revert NoShares();

        uint256 payment = releasableERC20(token, msg.sender);

        if (payment == 0) revert NoPaymentDue();

        // _erc20TotalReleased[token] is the sum of all values in _erc20Released[token].
        // If "_erc20TotalReleased[token] += payment" does not overflow, then "_erc20Released[token][account] += payment"
        // cannot overflow.
        _erc20TotalReleased[token] += payment;
        unchecked {
            _erc20Released[token][msg.sender] += payment;
        }

        SafeERC20.safeTransfer(token, msg.sender, payment);
        emit ERC20PaymentReleased(token, msg.sender, payment);
    }

    /** @inheritdoc IPaymentSplitter*/
    function totalShares() public view returns (uint256) {
        return _totalShares;
    }

    /** @inheritdoc IPaymentSplitter*/
    function totalReleasedETH() public view returns (uint256) {
        return _totalReleased;
    }

    /** @inheritdoc IPaymentSplitter*/
    function totalReleasedERC20(IERC20 token) public view returns (uint256) {
        return _erc20TotalReleased[token];
    }

    /** @inheritdoc IPaymentSplitter*/
    function shares(address account) public view returns (uint256) {
        return _shares[account];
    }

    /** @inheritdoc IPaymentSplitter*/
    function releasedETH(address account) public view returns (uint256) {
        return _released[account];
    }

    /** @inheritdoc IPaymentSplitter*/
    function releasedERC20(
        IERC20 token,
        address account
    ) public view returns (uint256) {
        return _erc20Released[token][account];
    }

    /** @inheritdoc IPaymentSplitter*/
    function payee(uint256 index) public view returns (address) {
        return _payees[index];
    }

    /** @inheritdoc IPaymentSplitter*/
    function payees()
        public
        view
        returns (address[] memory payees_, uint256[] memory shares_)
    {
        payees_ = _payees;
        uint256 _payeesCount = _payees.length;
        shares_ = new uint256[](_payeesCount);

        for (uint256 i; i < _payeesCount; ) {
            shares_[i] = _shares[payees_[i]];

            unchecked {
                ++i;
            }
        }
    }

    /** @inheritdoc IPaymentSplitter*/
    function releasableETH(address account) public view returns (uint256) {
        uint256 totalReceived = address(this).balance + totalReleasedETH();
        return _pendingPayment(account, totalReceived, releasedETH(account));
    }

    /** @inheritdoc IPaymentSplitter*/
    function releasableERC20(
        IERC20 token,
        address account
    ) public view returns (uint256) {
        uint256 totalReceived = token.balanceOf(address(this)) +
            totalReleasedERC20(token);
        return
            _pendingPayment(account, totalReceived, releasedERC20(token, account));
    }

    /**
     * Add a new payee to the contract
     *
     * @param account The address of the payee to add
     * @param shares_ The number of shares owned by the payee
     */
    function _addPayee(address account, uint256 shares_) private {
        if (account == address(0)) revert ZeroAddress();
        if (shares_ == 0) revert ZeroShares();
        if (_shares[account] != 0) revert DuplicatePayee();

        _payees.push(account);
        _shares[account] = shares_;
        _totalShares = _totalShares + shares_;
        emit PayeeAdded(account, shares_);
    }

    /**
     * internal logic for computing the pending payment of an account given the token historical balances and
     * already released amounts
     *
     * @param account the address of the payee
     * @param totalReceived total amount of the asset received by this contract
     * @param alreadyReleased amount of the asset already released to the specified account
     * 
     * @return uint256 amount of the asset owed to the account
     */
    function _pendingPayment(
        address account,
        uint256 totalReceived,
        uint256 alreadyReleased
    ) private view returns (uint256) {
        return
            (totalReceived * _shares[account]) / _totalShares - alreadyReleased;
    }
}
