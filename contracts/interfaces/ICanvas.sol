//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface ICanvas {
    function initialize(address _owner) external;

    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable;

    function ownerOf(uint256 _tokenId) external view returns (address);

    function createProject(
        address _studio,
        uint256 _maxSupply
    ) external returns (uint256 projectId);

    function mint(uint256 _projectId, address _to)
       external returns (uint256 _tokenId);

    function getProjectIdFromCanvasId(uint256 canvasId)
        external
        pure
        returns (uint256 projectId);

    function getProjectMaxSupply(uint256 _projectId) external view returns (uint256);

    function getProjectSupply(uint256 _projectId) external view returns (uint256);

    event MintedToken(address receiver, uint256 projectid, uint256 tokenId);
    event WrappedTokens(uint256 canvasId, uint256 tokenIds, uint256 amounts);
    event UnWrappedTokens(uint256 canvasId, uint256 tokenIds, uint256 amounts);
}
