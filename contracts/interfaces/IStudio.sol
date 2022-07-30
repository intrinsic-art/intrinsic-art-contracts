//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IStudio {
    event CanvasWrapped(
        uint256 indexed canvasId,
        address indexed wrapper,
        uint256[] elementIds
    );

    event CanvasUnwrapped(
        uint256 indexed canvasId,
        address indexed unwrapped
    )

    struct ProjectData {
        string name;
        string description;
        address artistAddress;
        string artistName;
        string website;
        string license;
        string baseURI;
        string scriptJSON;
        uint256 scriptCount;
        mapping(uint256 => string) scripts;
        string[] featureCategoryLabels;
        uint256[][] featureTokenIds;
    }

    struct CreateProjectData {
        string name;
        string description;
        address artistAddress;
        string artistName;
        string website;
        string license;
        string baseURI;
        string scriptJSON;
        uint256 scriptCount;
        uint256 maxInvocations;
        string[] featureCategoryLabels;
        string[][] featureLabels;
    }

    struct CanvasData {
        bool wrapped;
        uint256[] wrappedFeatureTokenIds;
        bytes32 hash;
    }

    struct CreateAMM {
        uint256 startTime;
        address erc20Token;
        uint256[][] constantA;
        uint256[][] constantB;
    }

    event ProjectCreated(uint256 indexed projectId);
}
