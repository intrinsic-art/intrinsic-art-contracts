// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interfaces/IElement.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Element is IElement, ERC1155, ERC1155Burnable, ERC1155Supply, Ownable {
    uint256 public nextTokenId = 1;
    mapping(uint256 => Element) public elements;
    mapping(address => bool) public studios;

    modifier onlyStudio() {
      require(studios[msg.sender], "Only a Studio can call this function");
      _;
    }

    constructor(address _owner) ERC1155("") {
      _transferOwnership(_owner);
    }

    function addStudio(address _studio) public onlyOwner {
      studios[_studio] = true;
    }

    function removeStudio(address _studio) public onlyOwner {
      studios[_studio] = false;
    }

    function createElement(
        string calldata _label,
        string calldata _value,
        uint256 _supply,
        address _recipient
    ) public returns (uint256 tokenId) {
        tokenId = nextTokenId;
        nextTokenId++;

        elements[tokenId].label = _label;
        elements[tokenId].value = _value;

        _mint(_recipient, tokenId, _supply, bytes(""));
    }

    function createElements(
        string[][] calldata _labels,
        string[][] calldata _values,
        uint256[][] calldata _supplys,
        address _recipient
    ) public returns (uint256[][] memory tokenIds) {
        require(_labels.length == _values.length, "Incorrect array lengths");
        require(_labels.length == _supplys.length, "Incorrect array lengths");

        tokenIds = new uint256[][](_labels.length);

        for (uint256 i; i < _labels.length; i++) {
          uint256[] memory innerTokenIds = new uint256[](_labels[i].length);
          for(uint256 j; j < _labels[i].length; j++) {
            innerTokenIds[i] = createElement(
                _labels[i][j],
                _values[i][j],
                _supplys[i][j],
                _recipient
            );
          }
          tokenIds[i] = innerTokenIds;
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
