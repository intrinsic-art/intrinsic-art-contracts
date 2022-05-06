//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "../interfaces/IMockElement.sol";

contract MockCanvasWrapping {
    IMockElement public mockElement;

    // canvasContract => canvasId => element[]
    mapping(address => mapping(uint256 => uint256[])) public canvasIdToElements;

    function __Wrap_init(address _mockElement) internal {
        mockElement = IMockElement(_mockElement);
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
