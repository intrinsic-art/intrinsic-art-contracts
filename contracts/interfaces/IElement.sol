//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IElement {
    struct Feature {
        string label;
        address minter;
    }

    function createFeature(string calldata _label, address _minter)
        external
        returns (uint256 tokenId);

    function createFeatures(
        string[] calldata _labels,
        address _minter
    ) external returns (uint256[] memory tokenIds);

    function mint(
        address _to,
        uint256 _id,
        uint256 _amount
    ) external;

    function mintBatch(
        address _to,
        uint256[] memory _ids,
        uint256[] memory _amounts
    ) external;

    function getElementLabel(uint256 _tokenId) external view returns (string memory);
}
