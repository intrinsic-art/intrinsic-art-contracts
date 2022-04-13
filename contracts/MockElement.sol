//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./interfaces/IMockElement.sol";

contract MockElement is IMockElement, Initializable, ERC721Upgradeable {
    function initialize(string calldata name, string calldata symbol)
        external
        initializer
    {
        __ERC721_init(name, symbol);
    }
}
