//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IStudio {
    struct ProjectData {
        string name;
        string description;
        address artistAddress;
        string artistName;
        string website;
        string license;
        string projectBaseURI;
        string scriptJSON;
        string[] scripts;
        FeatureCategory[] featureCategories;
    }

    struct CreateProjectData {
        string name;
        string description;
        address artistAddress;
        string artistName;
        string website;
        string license;
        string projectBaseURI;
        string scriptJSON;
        string[] scripts;
        uint256 maxInvocations;
        string[] featureCategoryLabels;
        string[][] featureLabels;
    }

    struct FeatureCategory {
        string label;
        uint256[] tokenIds;
    }

    struct CanvasData {
        bool wrapped;
        uint256[] wrappedFeatureTokenIds;
        bytes32 hash;
        mapping(address => uint256) userNonces;
    }

    struct CreateAuction {
        uint256 startTime;
        uint256 endTime;
        uint256 startPrice;
        uint256 endPrice;
        address erc721;
        address currency;
    }

    struct CreateAMM {
        uint256 startTime;
        uint256[][] constantA;
        uint256[][] constantB;
    }

    event ProjectCreated(uint256 projectId, address artist, uint256[] tokenIds);
    event ProjectUpdated(
        uint256 projectId,
        uint256 maxInvocations,
        string projectName,
        string artistName,
        string description
    );
    event MetaDataUpdated(
        uint256 projectId,
        string website,
        string license,
        string projectBaseURI
    );
    event ScriptsUpdated(
        uint256 projectId,
        string[] scripts,
        uint256[] scriptIndex,
        string scriptJSON
    );
    event FeatAndCatCreated(
        uint256 projectId,
        string[] featureCategories,
        string[][] features,
        uint256[] ids
    );
}
