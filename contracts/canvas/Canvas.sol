//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../Element.sol";
import "./ColoringBook.sol";

contract Canvas is Initializable, ERC721BurnableUpgradeable, ERC1155Holder {
    using Strings for string;
    // Contracts Storage
    Element public element; 
    address public dutchAuction;
    ColoringBook public coloringBook;
    // TokenId Storage
    mapping(uint256 => uint256) public projectToInvocations;
    mapping(uint256 => uint256) public tokenIdToProjectId;
    mapping(uint256 => uint256[]) internal projectIdToTokenIds;
    mapping(uint256 => bytes32) public tokenIdTohash;
    mapping(bytes32 => uint256) public hashToTokenId;
    // Wrapping Storage
    mapping(uint256 => mapping(uint256 => uint256))
        public canvasIdToFeatureToBalances;
    mapping(uint256 => uint256[]) public canvasIdToFeatures;
    mapping(uint256 => mapping(uint256 => uint256))
        public canvasIdToFeatureArrayIndex;
    mapping(uint256 => mapping(string => uint256))
        public canvasIdToCategoryToFeatureId;

    modifier onlyOwner(uint256 canvasId) {
        require(
            ownerOf(canvasId) == msg.sender,
            "You are not the owner of this Canvas"
        );
        _;
    }

    /////////// Canvas Functions /////////////
    function initialize(
        address _element,
        address _dutchAuction,
        address _coloringBook
    ) external initializer {
        __ERC721_init("Elements", "PROTON");
        __ERC721Burnable_init();
        element = Element(_element);
        dutchAuction = _dutchAuction;
        coloringBook = ColoringBook(_coloringBook);
    }

    function safeMint(address _to, uint256 _projectId)
        public
        returns (uint256 tokenId)
    {
        (,uint maxInvocations,,,,,,,,) = coloringBook.projects(_projectId);
        require(
            msg.sender == dutchAuction,
            "Please use the Dutch Auction contract to mint a canvas"
        );
        require(
            (projectToInvocations[_projectId] + 1) <=
                maxInvocations,
            "This project has sold out"
        );
        projectToInvocations[_projectId] += 1;
        tokenId = (_projectId * 1_000_000) + projectToInvocations[_projectId];
        bytes32 hash = keccak256(
            abi.encodePacked(
                block.number,
                blockhash(block.number - 1),
                msg.sender,
                block.timestamp
            )
        );
        tokenIdTohash[tokenId] = hash;
        hashToTokenId[hash] = tokenId;
        _safeMint(_to, tokenId);
        tokenIdToProjectId[tokenId] = _projectId;
        projectIdToTokenIds[_projectId].push(tokenId);
    }

    ////////// Wrapping Functions ///////////
    function wrap(
        address owner,
        uint256[] memory featureIds,
        uint256[] memory amounts,
        uint256 canvasId
    ) public onlyOwner(canvasId) {
        for (uint256 i; i < featureIds.length; i++) {
            string memory featureCategory = findIdToCategory(
                tokenIdToProjectId[canvasId],
                featureIds[i]
            );
            // If the assigned feature == current feature then just update balance
            if (
                canvasIdToCategoryToFeatureId[canvasId][featureCategory] !=
                featureIds[i]
            ) {
                // If there is a feature assigned to a category
                // Move on to the next index, Do not wrap features w/ same category
                if (
                    canvasIdToCategoryToFeatureId[canvasId][featureCategory] > 0
                ) {
                    continue;
                }

                // Assign a feature to a category
                canvasIdToCategoryToFeatureId[canvasId][
                    featureCategory
                ] = featureIds[i];

                // Push the feature to the array of features/canvasId
                canvasIdToFeatures[canvasId].push(featureIds[i]);

                // Track the current index for easy lookup
                canvasIdToFeatureArrayIndex[canvasId][featureIds[i]] =
                    canvasIdToFeatures[canvasId].length -
                    1;
            }
            // update balances of features
            canvasIdToFeatureToBalances[canvasId][featureIds[i]] += amounts[i];
        }
        element.safeBatchTransferFrom(
            owner,
            address(this),
            featureIds,
            amounts,
            ""
        );
    }

    function unWrap(
        address receiver,
        uint256[] memory featureIds,
        uint256[] memory amounts,
        uint256 canvasId
    ) public onlyOwner(canvasId) {
        for (uint256 i; i < featureIds.length; i++) {
            // If there is not a balance/ a feature is not wrapped - continue
            if (canvasIdToFeatureToBalances[canvasId][featureIds[i]] == 0) {
                continue;
            }

            canvasIdToFeatureToBalances[canvasId][featureIds[i]] -= amounts[i];
            // if the canvas balance == 0 then remove it
            if (canvasIdToFeatureToBalances[canvasId][featureIds[i]] == 0) {
                uint256 featureIndex = canvasIdToFeatureArrayIndex[canvasId][
                    featureIds[i]
                ];
                uint256 arrayLength = canvasIdToFeatures[canvasId].length;
                // Save the last index at the current index being removed
                canvasIdToFeatures[canvasId][featureIndex] = canvasIdToFeatures[
                    canvasId
                ][arrayLength - 1];
                canvasIdToFeatures[canvasId].pop();

                // assign the 0 index to the current category
                string memory featureCategory = findIdToCategory(
                    tokenIdToProjectId[canvasId],
                    featureIds[i]
                );
                canvasIdToCategoryToFeatureId[canvasId][featureCategory] = 0;
            }
        }
        element.safeBatchTransferFrom(
            address(this),
            receiver,
            featureIds,
            amounts,
            ""
        );
    }

    /////// View Functions ///////////
    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        (,,,,,,string memory projectBaseURI,,,) = coloringBook.projects(tokenIdToProjectId[_tokenId]);
        
        return
            string(
                abi.encodePacked(
                    projectBaseURI,
                    Strings.toString(_tokenId)
                )
            );
    }

    /// @dev returns the category of a feature
    /// @notice Should be used to assure different features
    /// from the same category are not wrapped together
    function findIdToCategory(uint256 projectId, uint256 featureId)
        public
        view
        returns (string memory categoryString)
    {
        categoryString = coloringBook.projectIdToFeatureIdToCategory(projectId,featureId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721Upgradeable, ERC1155Receiver)
        returns (bool)
    {
        return
            interfaceId == type(IERC1155Receiver).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
