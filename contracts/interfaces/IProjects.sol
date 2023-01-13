//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IProjects {
    struct ProjectData {
        bool locked;
        address artistAddress;
        mapping(uint256 => string) scripts;
        string[] traitTypeNames;
        string[] traitTypeValues;
        uint256[][] traitTokenIds;
        uint256[] blankArtworkIds;
        string metadata;
        address auctionERC20;
        uint256 auctionStartTime;
        uint256 auctionEndTime;
        uint256 auctionStartPrice;
        uint256 auctionEndPrice;
    }
}