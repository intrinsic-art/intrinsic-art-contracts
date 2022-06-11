//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interfaces/IColoringBook.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "./Element.sol";
import "./interfaces/IDutchAuction.sol";
import "./AMM.sol";
import "hardhat/console.sol";

contract ColoringBook is IColoringBook, Initializable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    // Contract Storage
    Element public element;
    AMM public amm;
    IDutchAuction public dutchAuction;
    address public canvas;
    address public weth;
    // Project Storage
    CountersUpgradeable.Counter private _projectIdCounter;
    mapping(uint256 => ProjectDetails) public projects;
    mapping(uint256 => string[]) public scripts;
    // Feature - Category Storage
    mapping(uint256 => mapping(uint256 => string))
        public projectIdToFeatureIdToCategory; // Check for duplicate features
    mapping(uint256 => FeatureInfo[]) public projectIdToFeatureInfo; // check for duplicate categories

    modifier onlyArtist(uint256 projectId) {
        require(msg.sender == projects[projectId].artist);
        _;
    }

    /////////// Project Functions /////////////
    function initialize(
        address _element,
        address _amm,
        address _dutchAuction,
        address _canvas,
        address _weth
    ) external initializer {
        element = Element(_element);
        amm = AMM(_amm);
        dutchAuction = IDutchAuction(_dutchAuction);
        canvas = _canvas;
        weth = _weth;
    }

    function addProject(
        CreateProject memory _createProject,
        CreateMetaData memory _createMetaData,
        CreateScripts memory _createScripts,
        CreateAuction memory _createAuction,
        CreateFeaturesAndCategories memory _createFeaturesAndCategories,
        CreateAMM memory _createAMM
    ) public {
        require(
            _createAMM.constantA.length == _createAMM.constantB.length &&
                _createFeaturesAndCategories.features.length ==
                _createAMM.constantA.length,
            "Arrays not equal"
        );
        require(
            _createProject.maxInvocations < 1_000_000,
            "The max project size is 1_000_000"
        );
        uint256 projectId = _projectIdCounter.current();
        _projectIdCounter.increment();
        _updateProject(
            projectId,
            _createProject.artist,
            _createProject.maxInvocations,
            _createProject.projectName,
            _createProject.artistName,
            _createProject.description
        );
        _updateMetaData(
            projectId,
            _createMetaData.website,
            _createMetaData.license,
            _createMetaData.projectBaseURI
        );
        _updateScripts(
            projectId,
            _createScripts.scripts,
            _createScripts.scriptIndex,
            _createScripts.scriptJSON
        );
        // Create Dutch Autcion
        IDutchAuction.Auction memory _auction = IDutchAuction.Auction(
            projectId * 1_000_000,
            (projectId * 1_000_000) + _createProject.maxInvocations,
            _createAuction.startTime,
            _createAuction.endTime,
            _createAuction.startPrice,
            _createAuction.endPrice,
            _createProject.artist,
            canvas,
            weth
        );
        dutchAuction.addAuction(projectId, _auction);
        uint256[] memory ids = createFeaturesAndCategories(
            projectId,
            _createFeaturesAndCategories.featureCategories,
            _createFeaturesAndCategories.features
        );
        // Create AMM contract
        for (uint256 i; i < ids.length; i++) {
            amm.createBondingCurve(
                ids[i],
                _createAMM.constantA[i],
                _createAMM.constantB[i],
                _createProject.artist,
                canvas,
                _createAuction.startTime
            );
        }
    }

    //////// Artist Functions //////////
    function updateProject(
        uint256 _projectId,
        address _artist,
        uint256 _maxInvocations,
        string memory _projectName,
        string memory _artistName,
        string memory _description
    ) external onlyArtist(_projectId) {
        // check start time on Auction contract
        (, , uint256 startTime, , , , , , ) = dutchAuction.projectIdToAuction(
            address(this),
            _projectId
        );
        require(block.timestamp < startTime, "Project Already Started");
        _updateProject(
            _projectId,
            _artist,
            _maxInvocations,
            _projectName,
            _artistName,
            _description
        );
    }

    function updateMetaData(
        uint256 _projectId,
        string memory _website,
        string memory _license,
        string memory _projectBaseURI // if project is dynamic, tokenUri will be "{projectBaseUri}/{tokenId}"
    ) external onlyArtist(_projectId) {
        _updateMetaData(
            _projectId,
            _website,
            _license,
            _projectBaseURI // if project is dynamic, tokenUri will be "{projectBaseUri}/{tokenId}"
        );
    }

    function updateScripts(
        uint256 _projectId,
        string[] memory _scripts,
        uint256[] memory _scriptIndex,
        string memory _scriptJSON
    ) external onlyArtist(_projectId) {
        (, , uint256 startTime, , , , , , ) = dutchAuction.projectIdToAuction(
            address(this),
            _projectId
        );
        require(block.timestamp < startTime, "Project Already Started");
        _updateScripts(_projectId, _scripts, _scriptIndex, _scriptJSON);
    }

    //todo: check if this can be overriden/ should this be stopped during deployment
    /// @dev Artist should be able to create features
    /// @dev Creates token Ids w/ counter
    /// and assignes the tokenId w/ a feature
    /// @dev assigns a category to a feature
    /// therefore canvas contract can utilize
    /// to assure features from the same category are not
    /// wrapped together
    function createFeaturesAndCategories(
        uint256 projectId,
        string[] memory featureCategories,
        string[][] memory features
    ) public returns (uint256[] memory ids) {
        // Looping through categories to assign mappings
        for (uint256 i; i < featureCategories.length; i++) {
            ids = new uint256[](features[i].length);

            for (uint256 k; k < features[i].length; k++) {
                // Assign featureString to tokenId mapping
                uint256 tokenId = element.createFeature(features[i][k]);
                projectIdToFeatureIdToCategory[projectId][
                    tokenId
                ] = featureCategories[i];
                // Assign ids @k index to current tokenId
                ids[k] = tokenId;
            }

            // Assign featureStruct to a projectId
            projectIdToFeatureInfo[projectId].push(
                FeatureInfo(featureCategories[i], ids)
            );
        }
    }

    /////// View Functions ///////////
    /// @notice Function for returning a project's feature categories and feature strings
    function findProjectCategoryAndFeatureStrings(uint256 projectId)
        public
        view
        returns (
            string[] memory featureCategories,
            string[][] memory featureStrings
        )
    {
        uint256 featureCategoryLength = projectIdToFeatureInfo[projectId]
            .length;
        featureCategories = new string[](featureCategoryLength);
        featureStrings = new string[][](featureCategoryLength);

        for (uint256 i; i < featureCategoryLength; i++) {
            featureCategories[i] = projectIdToFeatureInfo[projectId][i]
                .featureCategory;

            uint256 featuresLength = projectIdToFeatureInfo[projectId][i]
                .featureTokenIds
                .length;
            string[] memory innerFeatureStrings = new string[](featuresLength);
            for (uint256 j; j < featuresLength; j++) {
                innerFeatureStrings[j] = element.tokenIdToFeature(
                    projectIdToFeatureInfo[projectId][i].featureTokenIds[j]
                );
            }
            featureStrings[i] = innerFeatureStrings;
        }
    }

    ///////// Internal Functions ////////////
    function _updateProject(
        uint256 _projectId,
        address _artist,
        uint256 _maxInvocations,
        string memory _projectName,
        string memory _artistName,
        string memory _description
    ) internal {
        projects[_projectId].artist = _artist;
        projects[_projectId].maxInvocations = _maxInvocations;
        projects[_projectId].projectName = _projectName;
        projects[_projectId].artistName = _artistName;
        projects[_projectId].description = _description;
    }

    function _updateMetaData(
        uint256 _projectId,
        string memory _website,
        string memory _license,
        string memory _projectBaseURI // if project is dynamic, tokenUri will be "{projectBaseUri}/{tokenId}"
    ) internal {
        projects[_projectId].website = _website;
        projects[_projectId].license = _license;
        projects[_projectId].projectBaseURI = _projectBaseURI;
    }

    function _updateScripts(
        uint256 _projectId,
        string[] memory _scripts,
        uint256[] memory _scriptIndex,
        string memory _scriptJSON
    ) internal {
        require(_scripts.length == _scriptIndex.length);
        for (uint256 i; i < _scripts.length; i++) {
            projects[_projectId].scriptCount += 1;
            if(projects[_projectId].scriptCount >  scripts[_projectId].length) {
                scripts[_projectId].push(_scripts[i]);
            } else {
                scripts[_projectId][_scriptIndex[i]] = _scripts[i];
            }
        }
        projects[_projectId].scriptJSON = _scriptJSON;
    }
}
