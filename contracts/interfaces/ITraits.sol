//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITraits {
    function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes calldata _data) external;

    function balanceOf(address _owner, uint256 _id) external view returns (uint256);

    function createTrait(
        string calldata _name,
        string calldata _value,
        uint256[] calldata _amounts,
        address[] calldata _recipients
    ) external returns (uint256 tokenId);

    function createTraits(
        string[] calldata _names,
        string[] calldata _values,
        uint256[][] calldata _amounts,
        address[] calldata _recipients
    ) external returns (uint256[] memory tokenIds);

    function createTraits2D(
        string[][] calldata _names,
        string[][] calldata _values,
        uint256[][][] calldata _amounts,
        address[] calldata _recipients
    ) external returns (uint256[][] memory tokenIds);

    function getTraitName(uint256 _tokenId)
        external
        view
        returns (string memory);

    function getTraitValue(uint256 _tokenId)
        external
        view
        returns (string memory);
}
