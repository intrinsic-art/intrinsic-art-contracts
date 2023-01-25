//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITraits {
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _id,
        uint256 _value,
        bytes calldata _data
    ) external;

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) external;

    function balanceOf(address _owner, uint256 _id)
        external
        view
        returns (uint256);

    function createTraitsAndTypes(
        string[] memory _traitTypeNames,
        string[] memory _traitTypeValues,
        string[] calldata _traitNames,
        string[] calldata _traitValues,
        uint256[] calldata _traitTypeIndexes,
        uint256[] calldata _traitMaxSupplys
    ) external;

    function mintBatch(
        address _to,
        uint256[] memory _tokenIds,
        uint256[] memory _amounts
    ) external;

    function transferTraitsToCreateArtwork(
        address _caller,
        uint256[] calldata _traitTokenIds
    ) external;

    function transferTraitsToDecomposeArtwork(
        address _caller,
        uint256[] calldata _traitTokenIds
    ) external;

    function getTraitName(uint256 _tokenId)
        external
        view
        returns (string memory);

    function getTraitValue(uint256 _tokenId)
        external
        view
        returns (string memory);

    function getTraitTypeName(uint256 _tokenId) external view returns (string memory);

    function getTraitTypeValue(uint256 _tokenId) external view returns (string memory);

    function getTraits()
        external
        view
        returns (
            uint256[] memory _traitTokenIds,
            string[] memory _traitNames,
            string[] memory _traitValues,
            uint256[] memory _traitTypeIndexes,
            string[] memory _traitTypeNames,
            string[] memory _traitTypeValues
        );
}
