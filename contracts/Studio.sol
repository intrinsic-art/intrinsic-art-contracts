//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "./interfaces/IStudio.sol";
import "./Marketplace.sol";
import "./StringConverter.sol";

contract Studio is IStudio, Marketplace, ERC721Holder, StringConverter {
    mapping(uint256 => CanvasData) public canvases;
    mapping(address => uint256) public userNonces;

    constructor(
        address _owner,
        address _canvas,
        address _element,
        uint256 _auctionStartDelay,
        string memory _baseURI
    ) {
        _transferOwnership(_owner);
        canvas = ICanvas(_canvas);
        element = IElement(_element);
        auctionStartDelay = _auctionStartDelay;
        baseURI = _baseURI;
    }

    function wrap(uint256 _projectId, uint256[] calldata _elementIndexes)
        public
        returns (uint256 _canvasTokenId)
    {
        require(
            _elementIndexes.length ==
                projects[_projectId].elementCategoryLabels.length,
            "S01"
        );

        if (
            canvas.getProjectSupply(_projectId) <
            canvas.getProjectMaxSupply(_projectId)
        ) {
            _canvasTokenId = canvas.mint(_projectId, msg.sender);
        } else {
            require(projects[_projectId].blankCanvasIds.length > 0, "S02");
            _canvasTokenId = projects[_projectId].blankCanvasIds[
                projects[_projectId].blankCanvasIds.length - 1
            ];
            projects[_projectId].blankCanvasIds.pop();
            canvas.safeTransferFrom(address(this), msg.sender, _canvasTokenId);
        }

        bytes32 newHash = keccak256(
            abi.encodePacked(msg.sender, userNonces[msg.sender])
        );

        canvases[_canvasTokenId].hash = newHash;

        uint256[] memory elementTokenIds = new uint256[](
            _elementIndexes.length
        );

        for (uint256 i; i < _elementIndexes.length; i++) {
            elementTokenIds[i] = projects[_projectId].elementTokenIds[i][
                _elementIndexes[i]
            ];

            element.safeTransferFrom(
                msg.sender,
                address(this),
                elementTokenIds[i],
                1,
                ""
            );
        }

        canvases[_canvasTokenId].wrapped = true;
        canvases[_canvasTokenId].wrappedElementTokenIds = elementTokenIds;
        userNonces[msg.sender]++;

        emit CanvasWrapped(_canvasTokenId, msg.sender);
    }

    function unwrap(uint256 _canvasId) public {
        require(msg.sender == canvas.ownerOf(_canvasId), "S03");
        require(canvases[_canvasId].wrapped, "S04");

        // Transfer elements to the user
        for (
            uint256 i;
            i < canvases[_canvasId].wrappedElementTokenIds.length;
            i++
        ) {
            element.safeTransferFrom(
                address(this),
                msg.sender,
                canvases[_canvasId].wrappedElementTokenIds[i],
                1,
                ""
            );
        }

        // Reset canvas state to blank canvas
        canvases[_canvasId].hash = 0;
        canvases[_canvasId].wrapped = false;
        canvases[_canvasId].wrappedElementTokenIds = new uint256[](0);

        // Transfer canvas from the user to this address
        canvas.safeTransferFrom(msg.sender, address(this), _canvasId);

        // Add the canvas ID to the array of blank canvses held by the studio
        projects[getProjectIdFromCanvasId(_canvasId)].blankCanvasIds.push(
            _canvasId
        );

        emit CanvasUnwrapped(_canvasId, msg.sender);
    }

    function buyElementsAndWrap(
        uint256[] calldata _tokenIdsToBuy,
        uint256[] calldata _tokenQuantitiesToBuy,
        uint256 _maxERC20ToSpend,
        uint256 _projectId,
        uint256[] calldata _elementIndexesToWrap
    ) public {
        buyElements(_tokenIdsToBuy, _tokenQuantitiesToBuy, _maxERC20ToSpend);
        wrap(_projectId, _elementIndexesToWrap);
    }

    function getCanvasURI(uint256 _canvasTokenId)
        external
        view
        returns (string memory)
    {
        return string.concat(baseURI, toString(_canvasTokenId));
    }

    function getCanvasHash(uint256 _canvasId) external view returns (bytes32) {
        return canvases[_canvasId].hash;
    }

    function getCanvasElementLabels(uint256 _canvasId)
        external
        view
        returns (string[] memory elementLabels)
    {
        uint256 elementLabelsLength = canvases[_canvasId]
            .wrappedElementTokenIds
            .length;
        elementLabels = new string[](elementLabelsLength);

        for (uint256 i; i < elementLabelsLength; i++) {
            elementLabels[i] = element.getElementLabel(
                canvases[_canvasId].wrappedElementTokenIds[i]
            );
        }
    }

    function getCanvasElementValues(uint256 _canvasId)
        external
        view
        returns (string[] memory elementValues)
    {
        uint256 elementValuesLength = canvases[_canvasId]
            .wrappedElementTokenIds
            .length;
        elementValues = new string[](elementValuesLength);

        for (uint256 i; i < elementValuesLength; i++) {
            elementValues[i] = element.getElementValue(
                canvases[_canvasId].wrappedElementTokenIds[i]
            );
        }
    }

    function getIsCanvasWrapped(uint256 _canvasId)
        external
        view
        returns (bool)
    {
        return canvases[_canvasId].wrapped;
    }
}
