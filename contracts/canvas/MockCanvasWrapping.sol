//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../MockElement.sol";

contract MockCanvasWrapping is Initializable {
    MockElement public mockElement;

    // canvasContract => canvasId => element[]
    mapping(address => mapping(uint => uint[])) public canvasIdToElements;

    function __Wrap_init(MockElement _mockElement)
        internal
        initializer
    {
      mockElement = _mockElement;
    }

    // todo: propoer amount handling
    function wrap(
        address owner,
        uint256[] memory elementIds,
        uint256[] memory amounts
    ) public {
        mockElement.safeBatchTransferFrom(
            owner,
            address(this),
            elementIds,
            amounts,
            ""
        );
    }

    function unWrap(
        address receiver,
        uint256[] memory elementIds,
        uint256[] memory amounts
    ) public {
        mockElement.safeBatchTransferFrom(
            address(this),
            receiver,
            elementIds,
            amounts,
            ""
        );
    }
}
