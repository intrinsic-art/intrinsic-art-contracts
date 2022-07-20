// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interfaces/IElement.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract Element is IElement, ERC1155, ERC1155Burnable, ERC1155Supply {
    uint256 public nextTokenId = 1;
    mapping(uint256 => Feature) public features;

    constructor() ERC1155("") {}

    function createFeature(string calldata _label, address _minter)
        public
        returns (uint256 tokenId)
    {
        tokenId = nextTokenId;
        nextTokenId++;

        features[tokenId].label = _label;
        features[tokenId].minter = _minter;
    }

    function createFeatures(
        string[] calldata _labels,
        address _minter
    ) public returns (uint256[] memory tokenIds) {
        tokenIds = new uint256[](_labels.length);

        for (uint256 i; i < _labels.length; i++) {
            tokenIds[i] = createFeature(_labels[i], _minter);
        }
    }

    function mint(
        address _to,
        uint256 _id,
        uint256 _amount
    ) public {
        require(msg.sender == features[_id].minter, "Only minter can mint");

        _mint(_to, _id, _amount, bytes(""));
    }

    function mintBatch(
        address _to,
        uint256[] memory _ids,
        uint256[] memory _amounts
    ) public {
        require(_ids.length == _amounts.length, "Invalid array lengths");
        for (uint256 i; i < _ids.length; i++) {
            mint(_to, _ids[i], _amounts[i]);
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

    function getElementLabel(uint256 _tokenId) public view returns (string memory) {
      return features[_tokenId].label;
    }
}
