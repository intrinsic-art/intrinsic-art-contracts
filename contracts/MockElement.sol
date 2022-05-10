// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

//todo: check for duplicate categories
contract MockElement is ERC1155, Ownable, ERC1155Burnable, ERC1155Supply {
    using Counters for Counters.Counter;

    constructor() ERC1155("") {}

    Counters.Counter private _tokenIdCounter;
    struct FeatureInfo {
        string featureCategory;
        uint256[] featureTokenIds;
    }

    mapping(uint256 => string) public tokenIdToFeature;
    mapping(uint256 => mapping(string => string))
        public projectIdToFeatureToCategory; // Check for duplicate features
    mapping(uint256 => FeatureInfo[]) public projectIdToFeatureInfo; // check for duplicate categories

    /// @notice Function for easy readable features and categories based on an array of tokenIds
    function findidsToFeatureStrings(
        uint256[] memory featureIds,
        uint256 projectId
    )
        public
        view
        returns (string[] memory features, string[] memory categories)
    {
        features = new string[](featureIds.length);
        categories = new string[](featureIds.length);
        for (uint256 i = 0; i < featureIds.length; i++) {
            features[i] = tokenIdToFeature[featureIds[i]]; // tokenId to feature string
            categories[i] = projectIdToFeatureToCategory[projectId][
                features[i]
            ]; // feature string to category
        }
    }

    /// @dev returns the category of a feature
    /// @notice Should be used to assure different features
    /// from the same category are not wrapped together
    function findIdToCategory(uint256 projectId, uint256 featureId)
        public
        view
        returns (string memory categoryString)
    {
        string memory featureString = tokenIdToFeature[featureId];
        categoryString = projectIdToFeatureToCategory[projectId][featureString];
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyOwner {
        _mint(account, id, amount, data);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public onlyOwner {
        _mintBatch(to, ids, amounts, data);
    }

    /// @dev Artist should be able to create features
    /// @dev Creates token Ids w/ counter
    /// and assignes the tokenId w/ a feature
    /// @dev assigns a category to a feature
    /// therefore canvas contract can utilize
    /// to assure features from the same category are not
    /// wrapped together
    function createFeatures(
        uint256 projectId,
        string[] memory featureCategories,
        string[][] memory features
    ) public {
        // Looping through categories to assign mappings
        for (uint256 i; i < featureCategories.length; i++) {
            uint256[] memory ids = new uint256[](features[i].length);

            for (uint256 k; k < features[i].length; k++) {
                // Check for duplicate features
                string memory categoryString = projectIdToFeatureToCategory[
                    projectId
                ][features[i][k]];
                string memory emptyString;
                if (
                    keccak256(abi.encodePacked((categoryString))) !=
                    keccak256(abi.encodePacked((emptyString)))
                ) {
                    continue;
                }

                // Assign featureString to tokenId mapping
                _tokenIdCounter.increment();
                uint256 tokenId = _tokenIdCounter.current();
                tokenIdToFeature[tokenId] = features[i][k];

                // Assign CategoryString to featureString mapping
                projectIdToFeatureToCategory[projectId][
                    features[i][k]
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

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
