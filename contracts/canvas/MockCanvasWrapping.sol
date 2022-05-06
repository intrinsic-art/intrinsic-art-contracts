//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../interfaces/IMockElement.sol";

// todo: onlyOwner of canvas can call this function
contract MockCanvasWrapping is Initializable {
    IMockElement public mockElement;

    // canvasId => elementBalances
    mapping(uint256 => mapping(uint256 => uint256)) public balances;
    // canvasId => element[]
    mapping(uint256 => uint256[]) public canvasIdToElements;
    // cavasId => element => arrayIndex
    mapping(uint256 => mapping(uint256 => uint256))
        public canvasIdToElementIndex;
    // projectId => featureSet / features
    mapping(uint256 => string[][]) public projectIdToFeatures;

    function __Wrap_init(address _mockElement) internal onlyInitializing {
        mockElement = IMockElement(_mockElement);
    }

    function wrap(
        address owner,
        uint256[] memory elementIds,
        uint256[] memory amounts,
        uint256 canvasId
    ) public {
        require(elementIds.length == amounts.length);
        for (uint256 i; i < elementIds.length; i++) {
            if (balances[canvasId][elementIds[i]] > 0) {
                continue;
            }
            canvasIdToElementIndex[canvasId][
                elementIds[i]
            ] = canvasIdToElements[canvasId].length;
            canvasIdToElements[canvasId].push(elementIds[i]);
            balances[canvasId][elementIds[i]] += amounts[i];
        }
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
        uint256[] memory amounts,
        uint256 canvasId
    ) public {
        require(elementIds.length == amounts.length);
        for (uint256 i; i < elementIds.length; i++) {
            if (balances[canvasId][elementIds[i]] == 0) {
                continue;
            }
            uint256 arrayLength = canvasIdToElements[canvasId].length;
            uint256 elementIndex = canvasIdToElementIndex[canvasId][
                elementIds[i]
            ];
            uint256 lastElementId = canvasIdToElements[canvasId][
                arrayLength - 1
            ];

            canvasIdToElements[canvasId][elementIndex] = lastElementId;
            canvasIdToElements[canvasId].pop();
            balances[canvasId][elementIds[i]] -= amounts[i];
        }
        mockElement.safeBatchTransferFrom(
            address(this),
            receiver,
            elementIds,
            amounts,
            ""
        );
    }
}
