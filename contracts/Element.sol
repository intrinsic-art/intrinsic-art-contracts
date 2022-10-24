// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IElement.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Element is ERC1155, ERC1155Burnable, ERC1155Supply, Ownable {
    event ElementCreated(address indexed studio, string indexed label, string indexed value);
    event StudioAdded(address indexed studio);
    event StudioRemoved(address indexed studio);

    struct ElementData {
        string label;
        string value;
    }

    uint256 public nextTokenId = 1;
    mapping(uint256 => ElementData) public elements;
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

    function createElement(
        string calldata _label,
        string calldata _value,
        uint256[] calldata _amounts,
        address[] calldata _recipients
    ) public returns (uint256 tokenId) {
        require(studios[msg.sender], "E01");
        require(_amounts.length == _recipients.length, "E02");

        tokenId = nextTokenId;
        nextTokenId++;

        elements[tokenId].label = _label;
        elements[tokenId].value = _value;

        for(uint256 i; i < _amounts.length; i++) {
          _mint(_recipients[i], tokenId, _amounts[i], bytes(""));
        }

        emit ElementCreated(msg.sender, _label, _value);
    }

    function createElements(
        string[] calldata _labels,
        string[] calldata _values,
        uint256[][] calldata _amounts,
        address[] calldata _recipients
    ) public returns (uint256[] memory tokenIds) {
        require(_labels.length == _values.length, "E02");
        require(_labels.length == _amounts.length, "E02");

        tokenIds = new uint256[](_labels.length);

        for (uint256 i; i < _labels.length; i++) {
            tokenIds[i] = createElement(
                _labels[i],
                _values[i],
                _amounts[i],
                _recipients
            );
        }
    }

    function createElements2D(
        string[][] calldata _labels,
        string[][] calldata _values,
        uint256[][][] calldata _amounts,
        address[] calldata _recipients
    ) external returns (uint256[][] memory tokenIds) {
        require(_labels.length == _values.length, "E02");
        require(_labels.length == _amounts.length, "E02");

        tokenIds = new uint256[][](_labels.length);

        for (uint256 i; i < _labels.length; i++) {
            tokenIds[i] = createElements(_labels[i], _values[i], _amounts[i], _recipients);
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

    function getElementLabel(uint256 _tokenId)
        public
        view
        returns (string memory)
    {
        return elements[_tokenId].label;
    }

    function getElementValue(uint256 _tokenId)
        public
        view
        returns (string memory)
    {
        return elements[_tokenId].value;
    }
}
