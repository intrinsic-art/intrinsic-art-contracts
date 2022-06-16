// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interfaces/IElement.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Element is IElement, ERC1155, ERC1155Burnable, ERC1155Supply {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    address public amm;

    constructor(address _amm) ERC1155("") {
        amm = _amm;
    }

    modifier onlyAMM() {
        require(amm == msg.sender, "You are not the AMM contract");
        _;
    }

    mapping(uint256 => string) public tokenIdToFeature;

    function createFeature(string calldata feature)
        public
        returns (uint256 tokenId)
    {
        _tokenIdCounter.increment();
        tokenId = _tokenIdCounter.current();
        tokenIdToFeature[tokenId] = feature;
    }

    function mint(
        address account,
        uint256 id,
        uint256 amount
    ) public onlyAMM {
        _mint(account, id, amount, bytes(""));
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) public onlyAMM {
        _mintBatch(to, ids, amounts, bytes(""));
    }

    // This needs to be removed - or use some internal function
    function setURI(string memory newuri) public {
        _setURI(newuri);
    }

    // The following functions are overrides required by Solidity.

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
}
