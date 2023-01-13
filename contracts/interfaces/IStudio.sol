//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IStudio {
    event ArtworkCreated(uint256 indexed artworkTokenId, address indexed creator);
    event ArtworkDecomposed(uint256 indexed artworkTokenId, address indexed caller);

    struct ArtworkData {
        bool created;
        uint256[] traitTokenIds;
        bytes32 hash;
    }
}