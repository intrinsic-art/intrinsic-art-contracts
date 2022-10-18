//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IElement {
    struct Element {
        string label;
        string value;
    }

    function createElement(
        string calldata _label,
        string calldata _value,
        uint256 _supply,
        address _recipient
    ) external returns (uint256 tokenId);

    function createElements(
        string[][] calldata _labels,
        string[][] calldata _values,
        uint256[][] calldata _supplys,
        address _recipient
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
