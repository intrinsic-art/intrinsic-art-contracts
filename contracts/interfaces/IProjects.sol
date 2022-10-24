//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IProjects {
    struct ProjectData {
        bool locked;
        address artistAddress;
        mapping(uint256 => string) scripts;
        string[] elementCategoryLabels;
        string[] elementCategoryValues;
        uint256[][] elementTokenIds;
        uint256[] blankCanvasIds;
        string metadata;
    }
}