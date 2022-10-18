//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Canvas.sol";
import "./Element.sol";
import "./Marketplace.sol";

/* Project creation flow
*  1) Artist creates project & elements
*  2) Artist updates scripts
*  3) Artist verifies that everything looks good
*  4) Artist locks the project
*  5) Artist creates the markets
*/

contract Studio is Initializable, ERC1155Holder, Marketplace {
    struct CanvasData {
        bool wrapped;
        uint256[] wrappedElementTokenIds;
        bytes32 hash;
    }

    mapping(uint256 => CanvasData) public canvases;
    mapping(address => uint256) public userNonces;

    /////////// Project Functions /////////////
    function initialize(
        address _owner,
        address _canvas,
        address _element
    ) external initializer {
        _transferOwnership(_owner);
        canvas = Canvas(_canvas);
        element = Element(_element);
    }

    function wrap(uint256 _projectId, uint256[] calldata _elementIndexes) public returns (uint256 _canvasTokenId) {
        require(
            _elementIndexes.length ==
                projects[_projectId]
                    .elementCategoryLabels
                    .length,
            "Incorrect elements array length"
        );

        _canvasTokenId = canvas.mint(_projectId, msg.sender);

        bytes32 newHash = keccak256(
            abi.encodePacked(msg.sender, userNonces[msg.sender])
        );

        canvases[_canvasTokenId].hash = newHash;

        uint256[] memory elementTokenIds = new uint256[](
            _elementIndexes.length
        );

        for (uint256 i; i < _elementIndexes.length; i++) {
            elementTokenIds[i] = projects[_projectId]
                .elementTokenIds[i][_elementIndexes[i]];

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

        // emit CanvasWrapped(_canvasId, msg.sender, elementTokenIds);
    }

    function unwrap(uint256 _canvasId) public {
        require(
            msg.sender == canvas.ownerOf(_canvasId),
            "You are not the owner of this canvas"
        );
        require(canvases[_canvasId].wrapped, "Canvas is not wrapped");

        canvases[_canvasId].hash = 0;
        canvases[_canvasId].wrapped = false;

        uint256 projectId = getProjectIdFromCanvasId(_canvasId);

        for (
            uint256 i;
            i < projects[projectId].elementCategoryLabels.length;
            i++
        ) {
            uint256 elementTokenId = canvases[_canvasId].wrappedElementTokenIds[i];
            canvases[_canvasId].wrappedElementTokenIds[i] = 0;
            element.safeTransferFrom(
                address(this),
                msg.sender,
                elementTokenId,
                1,
                ""
            );
        }

        // emit CanvasUnwrapped(_canvasId, msg.sender);
    }

    function buyElementsAndWrap(
        uint256[] calldata _tokenIdsToBuy,
        uint256[] calldata _tokenQuantitiesToBuy,
        uint256 _maxERC20ToSpend,
        uint256 _projectId,
        uint256[] calldata _elementIndexesToWrap
    ) public {
        buyElements(
            _tokenIdsToBuy,
            _tokenQuantitiesToBuy,
            _maxERC20ToSpend
        );
        wrap(_projectId, _elementIndexesToWrap);
    }

    function getCanvasWrappedTokenIds(uint256 _canvasId)
        public
        view
        returns (uint256[] memory)
    {
        return canvases[_canvasId].wrappedElementTokenIds;
    }

    function getCanvasWrappedFeatureLabels(uint256 _canvasId)
        public
        view
        returns (string[] memory featureLabels)
    {
        featureLabels = new string[](
            canvases[_canvasId].wrappedElementTokenIds.length
        );

        for (uint256 i; i < featureLabels.length; i++) {
            featureLabels[i] = element.getElementLabel(
                canvases[_canvasId].wrappedElementTokenIds[i]
            );
        }
    }

    function getUserNonce(address _user) public view returns (uint256) {
        return userNonces[_user];
    }

    function getCanvasTokenURI(uint256 _canvasTokenId)
        public
        view
        returns (string memory)
    {
        return
            string(
                abi.encodePacked(
                    projects[getProjectIdFromCanvasId(_canvasTokenId)].baseURI,
                    Strings.toString(_canvasTokenId)
                )
            );
    }

    function getCanvasHash(uint256 _canvasId) public view returns (bytes32) {
        return canvases[_canvasId].hash;
    }

    function getProjectScripts(uint256 _projectId)
        public
        view
        returns (string[] memory _scripts)
    {
        uint256 scriptCount = getProjectScriptCount(_projectId);
        _scripts = new string[](scriptCount);

        for(uint256 i; i < scriptCount; i++) {
          _scripts[i] = projects[_projectId].scripts[i];
        }
    }

    function getProjectScriptCount(uint256 _projectId) public view returns (uint256) {
      uint256 scriptIndex;

      while(keccak256(abi.encodePacked(projects[_projectId].scripts[scriptIndex])) == keccak256(abi.encodePacked(""))) {
        scriptIndex++;
      }

      return scriptIndex;
    }

    function getProjectElementCategoryLabels(uint256 _projectId)
        public
        view
        returns (string[] memory)
    {
        return projects[_projectId].elementCategoryLabels;
    }

    function getProjectElementTokenIds(uint256 _projectId)
        public
        view
        returns (uint256[][] memory)
    {
        return projects[_projectId].elementTokenIds;
    }

    function getProjectElementLabels(uint256 _projectId)
        public
        view
        returns (string[][] memory elementLabels)
    {
        uint256 featureCategoryLength = projects[_projectId]
            .elementCategoryLabels
            .length;
        elementLabels = new string[][](featureCategoryLength);

        for (uint256 i; i < featureCategoryLength; i++) {
            uint256 featuresLength = projects[_projectId]
                .elementTokenIds[i]
                .length;
            string[] memory innerFeatureLabels = new string[](featuresLength);
            for (uint256 j; j < featuresLength; j++) {
                innerFeatureLabels[j] = element.getElementLabel(
                    projects[_projectId].elementTokenIds[i][j]
                );
            }
            elementLabels[i] = innerFeatureLabels;
        }
    }

    function getProjectIdFromCanvasId(uint256 canvasId)
        public
        pure
        returns (uint256 projectId)
    {
        projectId = canvasId / 1_000_000;
    }
}
