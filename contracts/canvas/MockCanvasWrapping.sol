//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "../interfaces/IMockElement.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

/// @dev contract used to "wrap"/ transfer tokens to features to a canvas
/// @notice Render canvas features
/// canvasIdToFeatures provides you an array of features
/// Pass this array to the element contract
/// tokenIdToFeature provides you the feature string
/// projectIdToFeatureToCategory provides you the category string
contract MockCanvasWrapping is Initializable, ERC1155Holder, ERC721Upgradeable {
    IMockElement public mockElement;

    mapping(uint256 => mapping(uint256 => uint256))
        public canvasIdToFeatureToBalances;
    mapping(uint256 => uint256[]) public canvasIdToFeatures;
    mapping(uint256 => mapping(uint256 => uint256))
        public canvasIdToFeatureArrayIndex;
    mapping(uint256 => mapping(string => uint256))
        public canvasIdToCategoryToFeatureId;

    function __Wrap_init(address _mockElement) internal onlyInitializing {
        mockElement = IMockElement(_mockElement);
    }

    modifier onlyOwner(uint256 canvasId) {
        require(
            ownerOf(canvasId) == msg.sender,
            "You are not the owner of this Canvas"
        );
        _;
    }

    function wrap(
        address owner,
        uint256[] memory featureIds,
        uint256[] memory amounts,
        uint256 canvasId,
        uint256 projectId
    ) public onlyOwner(canvasId) {
        for (uint256 i; i < featureIds.length; i++) {
            string memory featureCategory = mockElement.findIdToCategory(
                projectId,
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
        mockElement.safeBatchTransferFrom(
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
        uint256 canvasId,
        uint256 projectId
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
                string memory featureCategory = mockElement.findIdToCategory(
                    projectId,
                    featureIds[i]
                );
                canvasIdToCategoryToFeatureId[canvasId][featureCategory] = 0;
            }
        }
        mockElement.safeBatchTransferFrom(
            address(this),
            receiver,
            featureIds,
            amounts,
            ""
        );
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
