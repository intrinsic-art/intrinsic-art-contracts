//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/IStudio.sol";
import "./Canvas.sol";
import "./DutchAuction.sol";
import "./Element.sol";
import "./AMM.sol";

contract Studio is IStudio, Initializable, ERC1155Holder {
    // todo: convert these to interfaces
    Canvas public canvas;
    DutchAuction public dutchAuction;
    Element public element;
    AMM public amm;

    mapping(uint256 => ProjectData) public projects;
    mapping(uint256 => CanvasData) public canvases;
    mapping(address => uint256) public userNonces;

    modifier onlyArtist(uint256 projectId) {
        require(
            msg.sender == projects[projectId].artistAddress,
            "You are not the project's artist"
        );
        _;
    }

    /////////// Project Functions /////////////
    function initialize(
        address _canvas,
        address _dutchAuction,
        address _element,
        address _amm
    ) external initializer {
        canvas = Canvas(_canvas);
        dutchAuction = DutchAuction(_dutchAuction);
        element = Element(_element);
        amm = AMM(_amm);
    }

    function createProject(
        CreateProjectData memory _createProjectData,
        IDutchAuction.Auction memory _createAuction,
        CreateAMM memory _createAMM
    ) public returns (uint256 projectId, uint256[][] memory elementTokenIds) {
        projectId = canvas.createProject(
            address(this),
            address(dutchAuction),
            _createProjectData.maxInvocations
        );

        _updateProjectData(projectId, _createProjectData);

        dutchAuction.addAuction(projectId, _createAuction);

        elementTokenIds = _createElementsAndAMMs(
            projectId,
            _createProjectData.artistAddress,
            _createProjectData.featureLabels,
            _createAMM
        );

        emit ProjectCreated(projectId);
    }

    function addScript(uint256 _projectId, string calldata _script) public {
        require(
            msg.sender == projects[_projectId].artistAddress,
            "Only the artist can call this function"
        );

        projects[_projectId].scripts.push(_script);
    }

    function buyElements(
        uint256[] memory _elementTokenIds,
        uint256[] memory _elementAmounts,
        uint256[] memory _maxERC20sToSpend
    ) public {
        amm.batchBuyElements(
            _elementTokenIds,
            _elementAmounts,
            _maxERC20sToSpend,
            msg.sender,
            msg.sender
        );
    }

    function buyCanvases(uint256 _projectId, uint256 _quantity)
        public
        returns (uint256[] memory canvasIds)
    {
        canvasIds = dutchAuction.buyCanvases(
            _projectId,
            _quantity,
            msg.sender,
            msg.sender
        );
    }

    function wrap(uint256 _canvasId, uint256[] memory _elementIndexes) public {
        require(
            msg.sender == canvas.ownerOf(_canvasId),
            "You are not the owner of this canvas"
        );
        require(!canvases[_canvasId].wrapped, "Canvas is already wrapped");
        require(
            _elementIndexes.length ==
                projects[getProjectIdFromCanvasId(_canvasId)]
                    .featureCategoryLabels
                    .length,
            "Incorrect elements array length"
        );

        bytes32 newHash = keccak256(
            abi.encodePacked(msg.sender, userNonces[msg.sender])
        );

        canvases[_canvasId].hash = newHash;

        uint256[] memory elementTokenIds = new uint256[](
            _elementIndexes.length
        );

        for (uint256 i; i < _elementIndexes.length; i++) {
            elementTokenIds[i] = projects[getProjectIdFromCanvasId(_canvasId)]
                .featureTokenIds[i][_elementIndexes[i]];

            element.safeTransferFrom(
                msg.sender,
                address(this),
                elementTokenIds[i],
                1,
                ""
            );
        }

        canvases[_canvasId].wrapped = true;
        canvases[_canvasId].wrappedFeatureTokenIds = elementTokenIds;
        userNonces[msg.sender]++;

        emit CanvasWrapped(_canvasId, msg.sender, elementTokenIds);
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
            i < projects[projectId].featureCategoryLabels.length;
            i++
        ) {
            uint256 elementTokenId = canvases[_canvasId].wrappedFeatureTokenIds[
                i
            ];
            canvases[_canvasId].wrappedFeatureTokenIds[i] = 0;
            element.safeTransferFrom(
                address(this),
                msg.sender,
                elementTokenId,
                1,
                ""
            );
        }
    }

    function buyElementsAndWrap(
        uint256[] memory _elementTokenIdsToBuy,
        uint256[] memory _elementAmountsToBuy,
        uint256[] memory _maxERC20ToSpend,
        uint256[] memory _elementIndexesToWrap,
        uint256 _canvasId
    ) public {
        buyElements(
            _elementTokenIdsToBuy,
            _elementAmountsToBuy,
            _maxERC20ToSpend
        );
        wrap(_canvasId, _elementIndexesToWrap);
    }

    function buyCanvasAndElementsAndWrap(
        uint256 _projectId,
        uint256[] memory _elementTokenIdsToBuy,
        uint256[] memory _elementAmountsToBuy,
        uint256[] memory _maxERC20ToSpend,
        uint256[] memory _elementIndexesToWrap
    ) public {
        uint256[] memory canvasIds = buyCanvases(_projectId, 1);
        buyElements(
            _elementTokenIdsToBuy,
            _elementAmountsToBuy,
            _maxERC20ToSpend
        );
        wrap(canvasIds[0], _elementIndexesToWrap);
    }

    function _updateProjectData(
        uint256 projectId,
        CreateProjectData memory _createProjectData
    ) private {
        require(
            _createProjectData.featureCategoryLabels.length ==
                _createProjectData.featureLabels.length,
            "Invalid feature and feature category array lengths"
        );

        projects[projectId].name = _createProjectData.name;
        projects[projectId].description = _createProjectData.description;
        projects[projectId].artistAddress = _createProjectData.artistAddress;
        projects[projectId].artistName = _createProjectData.artistName;
        projects[projectId].website = _createProjectData.website;
        projects[projectId].license = _createProjectData.license;
        projects[projectId].baseURI = _createProjectData.baseURI;
        projects[projectId].scriptJSON = _createProjectData.scriptJSON;
        projects[projectId].scripts = _createProjectData.scripts;
        projects[projectId].name = _createProjectData.name;
        projects[projectId].featureCategoryLabels = _createProjectData
            .featureCategoryLabels;
    }

    function _createElementsAndAMMs(
        uint256 _projectId,
        address _artistAddress,
        string[][] memory _features,
        CreateAMM memory _createAMM
    ) private returns (uint256[][] memory elementTokenIds) {
        elementTokenIds = new uint256[][](_features.length);
        // Loop through categories
        for (uint256 i; i < _features.length; i++) {
            elementTokenIds[i] = element.createFeatures(
                _features[i],
                address(amm)
            );
            amm.createBondingCurves(
                elementTokenIds[i],
                _createAMM.constantA[i],
                _createAMM.constantB[i],
                _artistAddress,
                _createAMM.erc20Token,
                _createAMM.startTime
            );
        }

        projects[_projectId].featureTokenIds = elementTokenIds;
    }

    /////// View Functions ///////////

    function getCanvasWrappedTokenIds(uint256 _canvasId)
        public
        view
        returns (uint256[] memory)
    {
        return canvases[_canvasId].wrappedFeatureTokenIds;
    }

    function getCanvasWrappedFeatureLabels(uint256 _canvasId)
        public
        view
        returns (string[] memory featureLabels)
    {
        featureLabels = new string[](
            canvases[_canvasId].wrappedFeatureTokenIds.length
        );

        for (uint256 i; i < featureLabels.length; i++) {
            featureLabels[i] = element.getElementLabel(
                canvases[_canvasId].wrappedFeatureTokenIds[i]
            );
        }
    }

    function getUserNonce(address _user) public view returns (uint256) {
        return userNonces[_user];
    }

    // @notice Function for returning a project's feature prices
    function getProjectFeaturePrices(uint256 _projectId)
        public
        view
        returns (uint256[][] memory featurePrices)
    {
        uint256 featureCategoryLength = projects[_projectId]
            .featureCategoryLabels
            .length;
        featurePrices = new uint256[][](featureCategoryLength);

        for (uint256 i; i < featureCategoryLength; i++) {
            uint256 featuresLength = projects[_projectId]
                .featureTokenIds[i]
                .length;
            uint256[] memory innerFeaturePrices = new uint256[](featuresLength);
            for (uint256 j; j < featuresLength; j++) {
                uint256 featureTokenId = projects[_projectId].featureTokenIds[
                    i
                ][j];
                (uint256 featurePrice, , ) = amm.getBuyERC20AmountWithFee(
                    featureTokenId,
                    1
                );
                innerFeaturePrices[j] = featurePrice;
            }
            featurePrices[i] = innerFeaturePrices;
        }
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
        returns (string[] memory)
    {
        return projects[_projectId].scripts;
    }

    function getProjectFeatureCategoryLabels(uint256 _projectId)
        public
        view
        returns (string[] memory)
    {
        return projects[_projectId].featureCategoryLabels;
    }

    function getProjectFeatureTokenIds(uint256 _projectId)
        public
        view
        returns (uint256[][] memory)
    {
        return projects[_projectId].featureTokenIds;
    }

    function getProjectFeatureLabels(uint256 _projectId)
        public
        view
        returns (string[][] memory featureLabels)
    {
        uint256 featureCategoryLength = projects[_projectId]
            .featureCategoryLabels
            .length;
        featureLabels = new string[][](featureCategoryLength);

        for (uint256 i; i < featureCategoryLength; i++) {
            uint256 featuresLength = projects[_projectId]
                .featureTokenIds[i]
                .length;
            string[] memory innerFeatureLabels = new string[](featuresLength);
            for (uint256 j; j < featuresLength; j++) {
                innerFeatureLabels[j] = element.getElementLabel(
                    projects[_projectId].featureTokenIds[i][j]
                );
            }
            featureLabels[i] = innerFeatureLabels;
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
