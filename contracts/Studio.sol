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
        CreateAuction memory _createAuction,
        CreateAMM memory _createAMM
    ) public returns (uint256 projectId, uint256[][] memory elementTokenIds) {
        projectId = canvas.createProject(
            address(this),
            address(dutchAuction),
            _createProjectData.maxInvocations
        );

        _updateProjectData(projectId, _createProjectData);

        IDutchAuction.Auction memory _auction = IDutchAuction.Auction(
            _createAuction.startTime,
            _createAuction.endTime,
            _createAuction.startPrice,
            _createAuction.endPrice,
            _createProjectData.artistAddress,
            _createAuction.currency
        );
        dutchAuction.addAuction(projectId, _auction);

        elementTokenIds = _createElementsAndAMMs(
            projectId,
            _createProjectData.artistAddress,
            _createProjectData.featureLabels,
            _createAMM
        );

        // emit ProjectCreated(projectId, _createProject.artist, ids);
    }

    function buyElementsAndWrap(
        uint256[] memory _elementTokenIdsToBuy,
        uint256[] memory _elementAmountsToBuy,
        uint256[] memory _maxERC20ToSpend,
        uint256[] memory _elementIndexesToWrap,
        uint256 _canvasId
    ) public {
        _buyElements(
            _elementTokenIdsToBuy,
            _elementAmountsToBuy,
            _maxERC20ToSpend
        );
        _wrap(_canvasId, _elementIndexesToWrap);
    }

    function buyCanvasAndElementsAndWrap(
        uint256 _projectId,
        uint256[] memory _elementTokenIdsToBuy,
        uint256[] memory _elementAmountsToBuy,
        uint256[] memory _maxERC20ToSpend,
        uint256[] memory _elementIndexesToWrap
    ) public {
        uint256[] memory canvasIds = _buyCanvases(_projectId, 1);
        _buyElements(
            _elementTokenIdsToBuy,
            _elementAmountsToBuy,
            _maxERC20ToSpend
        );
        _wrap(canvasIds[0], _elementIndexesToWrap);
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
        projects[projectId].projectBaseURI = _createProjectData.projectBaseURI;
        projects[projectId].scriptJSON = _createProjectData.scriptJSON;
        projects[projectId].scripts = _createProjectData.scripts;
        projects[projectId].name = _createProjectData.name;

        for (
            uint256 i;
            i < _createProjectData.featureCategoryLabels.length;
            i++
        ) {
            projects[projectId].featureCategories[i].label = _createProjectData
                .featureCategoryLabels[i];
        }
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
            uint256[] memory innerElementTokenIds = new uint256[](
                _features[i].length
            );
            for (uint256 j; j < _features[i].length; j++) {
                // Assign featureString to tokenId mapping
                uint256 tokenId = element.createFeature(
                    _features[i][j],
                    address(amm)
                );

                innerElementTokenIds[j] = tokenId;

                projects[_projectId].featureCategories[i].tokenIds[j] = tokenId;

                amm.createBondingCurve(
                    tokenId,
                    _createAMM.constantA[i][j],
                    _createAMM.constantB[i][j],
                    _artistAddress,
                    address(element),
                    _createAMM.startTime
                );
            }
        }
    }

    ////////// Wrapping Functions ///////////

    function _wrap(uint256 _canvasId, uint256[] memory _elementIndexes)
        private
    {
        require(
            msg.sender == canvas.ownerOf(_canvasId),
            "You are not the owner of this canvas"
        );
        require(!canvases[_canvasId].wrapped, "Canvas is already wrapped");
        // require that element indexes array is the correct length

        canvases[_canvasId].hash = keccak256(
            abi.encodePacked(
                msg.sender,
                canvases[_canvasId].userNonces[msg.sender]
            )
        );
        canvases[_canvasId].userNonces[msg.sender]++;
        canvases[_canvasId].wrapped = true;

        for (uint256 i; i < _elementIndexes.length; i++) {
            uint256 elementTokenId = projects[
                getProjectIdFromCanvasId(_canvasId)
            ].featureCategories[i].tokenIds[_elementIndexes[i]];
            canvases[_canvasId].wrappedFeatureTokenIds[i] = elementTokenId;
            element.safeTransferFrom(
                msg.sender,
                address(this),
                elementTokenId,
                1,
                ""
            );
        }
    }

    function _unwrap(uint256 _canvasId) private {
        require(
            msg.sender == canvas.ownerOf(_canvasId),
            "You are not the owner of this canvas"
        );
        require(canvases[_canvasId].wrapped, "Canvas is not wrapped");

        canvases[_canvasId].hash = 0;
        canvases[_canvasId].wrapped = false;

        uint256 projectId = getProjectIdFromCanvasId(_canvasId);

        for (uint256 i; i < projects[projectId].featureCategories.length; i++) {
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

    function _buyElements(
        uint256[] memory _elementTokenIds,
        uint256[] memory _elementAmounts,
        uint256[] memory _maxERC20sToSpend
    ) private {
        amm.batchBuyElements(
            _elementTokenIds,
            _elementAmounts,
            _maxERC20sToSpend,
            msg.sender
        );
    }

    function _buyCanvases(uint256 _projectId, uint256 _quantity)
        private
        returns (uint256[] memory canvasIds)
    {
        canvasIds = dutchAuction.buyCanvases(_projectId, _quantity, msg.sender);
    }

    function getProjectIdFromCanvasId(uint256 canvasId)
        public
        pure
        returns (uint256 projectId)
    {
        projectId = canvasId / 1_000_000;
    }

    // function getProjectCategoryAndFeatureStrings(uint256 _projectId) public view returns();

    function getFeatureCategories(uint256 _projectId)
        public
        view
        returns (FeatureCategory[] memory)
    {
        return projects[_projectId].featureCategories;
    }

    /////// View Functions ///////////

    // @notice Function for returning a project's feature prices
    function getProjectFeaturePrices(uint256 _projectId)
        public
        view
        returns (uint256[][] memory featurePrices)
    {
        uint256 featureCategoryLength = projects[_projectId]
            .featureCategories
            .length;
        featurePrices = new uint256[][](featureCategoryLength);

        for (uint256 i; i < featureCategoryLength; i++) {
            uint256 featuresLength = projects[_projectId]
                .featureCategories[i]
                .tokenIds
                .length;
            uint256[] memory innerFeaturePrices = new uint256[](featuresLength);
            for (uint256 j; j < featuresLength; j++) {
                uint256 featureTokenId = projects[_projectId]
                    .featureCategories[i]
                    .tokenIds[j];
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
                    projects[getProjectIdFromCanvasId(_canvasTokenId)]
                        .projectBaseURI,
                    Strings.toString(_canvasTokenId)
                )
            );
    }
}
