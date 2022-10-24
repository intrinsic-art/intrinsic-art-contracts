//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGlobalStudio {
    function getCanvasURI(uint256 _canvasTokenId)
        external
        view
        returns (string memory);

    function getCanvasElementLabels(uint256 _canvasId)
        external
        view
        returns (string[] memory elementLabels);

    function getCanvasElementValues(uint256 _canvasId)
        external
        view
        returns (string[] memory elementValues);

    function getIsCanvasWrapped(uint256 _canvasId) external view returns (bool);

    function getCanvasHash(uint256 _canvasId) external view returns (bytes32);

    function getProjectElementCategoryLabels(uint256 _projectId) external view returns (string[] memory);

    function getProjectElementCategoryValues(uint256 _projectId) external view returns (string[] memory);
}
