//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IMockElement {
    function setURI(string memory newuri) external;

    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external;

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) external;

    /**
     * @dev See {IERC1155-safeBatchTransferFrom}.
     */
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) external;

    function findIdToCategory(uint256 projectId, uint256 featureId)
        external
        view
        returns (string memory categoryString);

    function findidsToFeatureAndCategories(
        uint256[] memory featureIds,
        uint256 projectId
    )
        external
        view
        returns (string[] memory features, string[] memory categories);
}
