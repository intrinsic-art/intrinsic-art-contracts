// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ITraits.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Traits is ERC1155Upgradeable, ERC1155BurnableUpgradeable, ERC1155SupplyUpgradeable {
    event TraitCreated(
        address indexed studio,
        string indexed name,
        string indexed value
    );

    struct Trait {
        string name;
        string value;
        uint256 typeIndex;
        uint256 maxSupply;
    }

    address public studio;
    uint256 public nextTokenId = 1;
    uint256 traitTypesLength;
    // todo: move these into a struct array
    string[] traitTypeNames;
    string[] traitTypeValues;
    mapping(uint256 => Trait) public traits;

    modifier onlyStudio() {
        require(msg.sender == studio, "Only the studio can call this function");
        _;
    }

    function initialize(address _studio, string memory _uri) external initializer {
      __ERC1155_init(_uri);
      studio = _studio;
    }

    function createTrait(
        string calldata _name,
        string calldata _value,
        uint256 _typeIndex,
        uint256 _maxSupply
    ) private returns (uint256 tokenId) {
        tokenId = nextTokenId;
        nextTokenId++;

        traits[tokenId].name = _name;
        traits[tokenId].value = _value;
        traits[tokenId].typeIndex = _typeIndex;
        traits[tokenId].maxSupply = _maxSupply;
    }

    function createTraitsAndTypes(
        string[] memory _traitTypeNames,
        string[] memory _traitTypeValues,
        string[] calldata _traitNames,
        string[] calldata _traitValues,
        uint256[] calldata _traitTypeIndexes,
        uint256[] calldata _traitMaxSupplys
    ) external onlyStudio {
        require(_traitTypeNames.length == _traitTypeValues.length, "E02");

        require(_traitNames.length == _traitValues.length, "E02");
        require(_traitNames.length == _traitTypeIndexes.length, "E02");
        require(_traitNames.length == _traitMaxSupplys.length, "E02");

        traitTypeNames = _traitTypeNames;
        traitTypeValues = _traitTypeValues;

        // Loop through traits
        for (uint256 i; i < _traitNames.length; i++) {
            createTrait(
                _traitNames[i],
                _traitValues[i],
                _traitTypeIndexes[i],
                _traitMaxSupplys[i]
            );
        }
    }

    function mintBatch(
        address _to,
        uint256[] memory _tokenIds,
        uint256[] memory _amounts
    ) external onlyStudio {
        for (uint256 i; i < _tokenIds.length; i++) {
            require(
                totalSupply(_tokenIds[i]) + _amounts[i] <= traits[_tokenIds[i]].maxSupply,
                "Trait max supply reached"
            );
        }

        _mintBatch(_to, _tokenIds, _amounts, "");
    }

    function transferTraitsToCreateArtwork(
        address _caller,
        uint256[] calldata _traitTokenIds
    ) external onlyStudio {
        require(
            _traitTokenIds.length == traitTypeNames.length,
            "Incorrect number of traits specified"
        );

        uint256[] memory amounts = new uint256[](_traitTokenIds.length);
        for (uint256 i; i < _traitTokenIds.length; i++) {
            require(
                traits[_traitTokenIds[i]].typeIndex == i,
                "Invalid trait token IDs"
            );
            amounts[i] = 1;
        }

        // Transfer the traits from the caller to the Studio contract
        _safeBatchTransferFrom(
            _caller,
            address(studio),
            _traitTokenIds,
            amounts,
            ""
        );
    }

    function transferTraitsToDecomposeArtwork(
        address _caller,
        uint256[] calldata _traitTokenIds
    ) external onlyStudio {
        require(
            _traitTokenIds.length == traitTypeNames.length,
            "Incorrect number of traits specified"
        );

        uint256[] memory amounts = new uint256[](_traitTokenIds.length);
        for (uint256 i; i < _traitTokenIds.length; i++) {
            require(
                traits[_traitTokenIds[i]].typeIndex == i,
                "Invalid trait token IDs"
            );
            amounts[i] = 1;
        }

        // Transfer the traits from the Studio contract to the caller
        _safeBatchTransferFrom(
            address(studio),
            _caller,
            _traitTokenIds,
            amounts,
            ""
        );
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155Upgradeable, ERC1155SupplyUpgradeable) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function getTraitName(uint256 _tokenId)
        public
        view
        returns (string memory)
    {
        return traits[_tokenId].name;
    }

    function getTraitValue(uint256 _tokenId)
        public
        view
        returns (string memory)
    {
        return traits[_tokenId].value;
    }

    function getTraitTypeName(uint256 _tokenId) public view returns (string memory) {
      return traitTypeNames[traits[_tokenId].typeIndex];
    }

    function getTraitTypeValue(uint256 _tokenId) public view returns (string memory) {
      return traitTypeValues[traits[_tokenId].typeIndex];
    }

    function getTraits()
        public
        view
        returns (
            uint256[] memory _traitTokenIds,
            string[] memory _traitNames,
            string[] memory _traitValues,
            uint256[] memory _traitTypeIndexes,
            string[] memory _traitTypeNames,
            string[] memory _traitTypeValues
        )
    {
        uint256 traitCount = nextTokenId - 1;
        _traitTokenIds = new uint256[](traitCount);
        _traitNames = new string[](traitCount);
        _traitValues = new string[](traitCount);
        _traitTypeIndexes = new uint256[](traitCount);
        _traitTypeNames = new string[](traitCount);
        _traitTypeValues = new string[](traitCount);

        for (uint256 i = 0; i < traitCount; i++) {
            _traitTokenIds[i] = i + 1;
            _traitNames[i] = traits[i + 1].name;
            _traitValues[i] = traits[i + 1].value;
            _traitTypeIndexes[i] = traits[i + 1].typeIndex;
            _traitTypeNames[i] = traitTypeNames[traits[i + 1].typeIndex];
            _traitTypeValues[i] = traitTypeValues[traits[i + 1].typeIndex];
        }
    }
}
