//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IElement {
    function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes calldata _data) external;

    function balanceOf(address _owner, uint256 _id) external view returns (uint256);

    function createElement(
        string calldata _label,
        string calldata _value,
        uint256[] calldata _amounts,
        address[] calldata _recipients
    ) external returns (uint256 tokenId);

    function createElements(
        string[] calldata _labels,
        string[] calldata _values,
        uint256[][] calldata _amounts,
        address[] calldata _recipients
    ) external returns (uint256[] memory tokenIds);

    function createElements2D(
        string[][] calldata _labels,
        string[][] calldata _values,
        uint256[][][] calldata _amounts,
        address[] calldata _recipients
    ) external returns (uint256[][] memory tokenIds);

    function getElementLabel(uint256 _tokenId)
        external
        view
        returns (string memory);

    function getElementValue(uint256 _tokenId)
        external
        view
        returns (string memory);
}
