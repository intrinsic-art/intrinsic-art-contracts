//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IColoringBook {
    struct ProjectDetails {
        // Project Essentials
        address artist;
        uint256 maxInvocations;
        // MetaData
        string projectName;
        string artistName;
        string description;
        string website;
        string license;
        string projectBaseURI; // if project is dynamic, tokenUri will be "{projectBaseUri}/{tokenId}"
        // Javascript Scripts
        uint256 scriptCount; // number of scripts
        uint256[] scriptIndex;
        string scriptJSON; // script metadata such as what libraries it depends on
    }
    struct CreateProject {
        address artist;
        uint256 maxInvocations;
        string projectName;
        string artistName;
        string description;
    }
    struct CreateMetaData {
        string website;
        string license;
        string projectBaseURI;
    }
    struct CreateScripts {
        string[] scripts;
        uint256[] scriptIndex;
        string scriptJSON;
    }
    struct CreateFeaturesAndCategories {
        string[] featureCategories;
        string[][] features;
    }
    struct FeatureInfo {
        string featureCategory;
        uint256[] featureTokenIds;
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
        uint256[] constantA;
        uint256[] constantB;
    }
}
