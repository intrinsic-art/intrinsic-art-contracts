// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interfaces/IDutchAuction.sol";
import "./interfaces/IAMM.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract RewardsClaimer {
    struct PlatformRevenueClaimer {
        address claimerAddress;
        uint256 claimerWeight;
    }

    IDutchAuction public dutchAuctionContract;
    IAMM public ammContract;
    PlatformRevenueClaimer[] public platformRevenueClaimers;

    constructor(
        address _dutchAuctionAddress,
        address _ammAddress,
        address[] memory _platformRevenueClaimerAddresses,
        uint256[] memory _platformRevenueClaimerWeights
    ) {
        dutchAuctionContract = IDutchAuction(_dutchAuctionAddress);
        ammContract = IAMM(_ammAddress);

        _addPlatformRevenueClaimers(
            _platformRevenueClaimerAddresses,
            _platformRevenueClaimerWeights
        );
    }

    function addPlatformRevenueClaimers(
        address[] memory _platformRevenueClaimerAddresses,
        uint256[] memory _platformRevenueClaimerWeights
    ) external {
        _addPlatformRevenueClaimers(
            _platformRevenueClaimerAddresses,
            _platformRevenueClaimerWeights
        );
    }

    function _addPlatformRevenueClaimers(
        address[] memory _platformRevenueClaimerAddresses,
        uint256[] memory _platformRevenueClaimerWeights
    ) internal {
        require(
            _platformRevenueClaimerAddresses.length ==
                _platformRevenueClaimerWeights.length,
            "Unequal array lengths"
        );

        for (uint256 i; i < _platformRevenueClaimerAddresses.length; i++) {
            require(
                _platformRevenueClaimerAddresses[i] != address(0),
                "Address zero cannot be claimer"
            );
            require(
                _platformRevenueClaimerWeights[i] > 0,
                "Weight must be greater than zero"
            );

            platformRevenueClaimers.push(
                PlatformRevenueClaimer(
                    _platformRevenueClaimerAddresses[i],
                    _platformRevenueClaimerWeights[i]
                )
            );
        }
    }
}
