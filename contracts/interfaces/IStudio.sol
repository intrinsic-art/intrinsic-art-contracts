//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IStudio {
    event CanvasWrapped(uint256 indexed canvasTokenId, address indexed wrapper);
    event CanvasUnwrapped(uint256 indexed canvasId, address indexed unwrapper);

    struct CanvasData {
        bool wrapped;
        uint256[] wrappedElementTokenIds;
        bytes32 hash;
    }
}