// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

//todo:naming conventions and canvas organization artblocks/individual contracts
contract MockElement is ERC1155, Ownable, ERC1155Burnable, ERC1155Supply {
    using Counters for Counters.Counter;

    constructor() ERC1155("") {}

    Counters.Counter private _tokenIdCounter;
    struct FeatureInfo {
        string featureCategory;
        uint256[] featureTokenIds;
    }
    // tokenId => FeatureString
    mapping(uint256 => string) public tokenIdToFeature;

    // Need to know the feature string => feature Category
    mapping(address => mapping(string => string)) public featureToCategory;
    // CanvasContract => FeatureInfo
    mapping(address => FeatureInfo[]) public projectFeatures;
    // current mapping makes it difficult to know duplicates 

    // todo: init featureToCategory
    // Should return the category with just the featureId
    function findIdToCategory(address canvasContract, uint id) public view returns(string memory) {
      string memory featureString = tokenIdToFeature[id];
      return featureToCategory[canvasContract][featureString];
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

    //todo:checking for duplicate features/categories
    //todo:One canvas contract
    function createElements(
        address canvasContract,
        string[] memory featureCategories,
        string[][] memory features
    ) public {
        for (uint256 i; i < featureCategories.length; i++) {
            uint256[] memory ids = new uint256[](features[i].length);

            // Assign feature string to tokenId
            for (uint256 k; k < features[i].length; k++) {
                _tokenIdCounter.increment();
                uint256 tokenId = _tokenIdCounter.current();
                tokenIdToFeature[tokenId] = features[i][k];
                // set feature categories
                featureToCategory[canvasContract][features[i][k]] = featureCategories[i];
                ids[k] = tokenId;
            }

            // Assign FeatureStruct to CanvasContract
            projectFeatures[canvasContract].push(
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
