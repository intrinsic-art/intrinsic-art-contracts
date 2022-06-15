//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface ICanvas {
    function initialize(
        address _element,
        address _dutchAuction,
        address _coloringBook
    ) external;

    function safeMint(address _to, uint256 _projectId)
        external
        returns (uint256 tokenId);

    function wrap(
        address owner,
        uint256[] memory featureIds,
        uint256[] memory amounts,
        uint256 canvasId
    ) external;

    function unWrap(
        address receiver,
        uint256[] memory featureIds,
        uint256[] memory amounts,
        uint256 canvasId
    ) external;

    /// @dev returns the category of a feature
    /// @notice Should be used to assure different features
    /// from the same category are not wrapped together
    function findIdToCategory(uint256 projectId, uint256 featureId)
        external
        view
        returns (string memory categoryString);

    event MintedToken(address receiver, uint256 projectid, uint256 tokenId);
    event WrappedTokens(
        uint256 canvasId,
        uint256[] tokenIds,
        uint256[] amounts
    );
}
