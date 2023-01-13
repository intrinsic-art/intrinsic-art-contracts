// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ITraits.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Traits is ERC1155, ERC1155Burnable, ERC1155Supply, Ownable {
    event TraitCreated(address indexed studio, string indexed name, string indexed value);
    event StudioAdded(address indexed studio);
    event StudioRemoved(address indexed studio);

    struct TraitData {
        string name;
        string value;
    }

    uint256 public nextTokenId = 1;
    mapping(uint256 => TraitData) public traits;
    mapping(address => bool) public studios;

    constructor(address _owner) ERC1155("") {
        _transferOwnership(_owner);
    }

    function addStudio(address _studio) public onlyOwner {
        studios[_studio] = true;

        emit StudioAdded(_studio);
    }

    function removeStudio(address _studio) public onlyOwner {
        studios[_studio] = false;

        emit StudioRemoved(_studio);
    }

    function createTrait(
        string calldata _name,
        string calldata _value,
        uint256[] calldata _amounts,
        address[] calldata _recipients
    ) public returns (uint256 tokenId) {
        require(studios[msg.sender], "E01");
        require(_amounts.length == _recipients.length, "E02");

        tokenId = nextTokenId;
        nextTokenId++;

        traits[tokenId].name = _name;
        traits[tokenId].value = _value;

        for(uint256 i; i < _amounts.length; i++) {
          _mint(_recipients[i], tokenId, _amounts[i], bytes(""));
        }

        emit TraitCreated(msg.sender, _name, _value);
    }

    function createTraits(
        string[] calldata _names,
        string[] calldata _values,
        uint256[][] calldata _amounts,
        address[] calldata _recipients
    ) public returns (uint256[] memory tokenIds) {
        require(_names.length == _values.length, "E02");
        require(_names.length == _amounts.length, "E02");

        tokenIds = new uint256[](_names.length);

        for (uint256 i; i < _names.length; i++) {
            tokenIds[i] = createTrait(
                _names[i],
                _values[i],
                _amounts[i],
                _recipients
            );
        }
    }

    function createTraits2D(
        string[][] calldata _names,
        string[][] calldata _values,
        uint256[][][] calldata _amounts,
        address[] calldata _recipients
    ) external returns (uint256[][] memory tokenIds) {
        require(_names.length == _values.length, "E02");
        require(_names.length == _amounts.length, "E02");

        tokenIds = new uint256[][](_names.length);

        for (uint256 i; i < _names.length; i++) {
            tokenIds[i] = createTraits(_names[i], _values[i], _amounts[i], _recipients);
        }
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
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
}
