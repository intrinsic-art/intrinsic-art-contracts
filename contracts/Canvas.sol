//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interfaces/ICanvas.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./Element.sol";
import "./ColoringBook.sol";
import "./AMM.sol";

contract Canvas is
    ICanvas,
    Initializable,
    ERC721BurnableUpgradeable,
    ERC1155Holder
{
    using Strings for string;
    // Contracts Storage
    Element public element;
    address public dutchAuction;
    ColoringBook public coloringBook;
    AMM public amm;
    // TokenId Storage
    mapping(uint256 => uint256) public projectToInvocations;
    mapping(uint256 => uint256) public tokenIdToProjectId;
    mapping(uint256 => uint256[]) public projectIdToTokenIds;
    mapping(uint256 => bytes32) public tokenIdTohash;
    mapping(bytes32 => uint256) public hashToTokenId;
    // Wrapping Storage
    mapping(uint256 => mapping(string => uint256))
        public canvasIdToCategoryToFeatureId;

    modifier onlyOwner(uint256 canvasId) {
        require(
            ownerOf(canvasId) == msg.sender,
            "You are not the owner of this Canvas"
        );
        _;
    }

    /////////// Canvas Functions /////////////
    function initialize(
        address _element,
        address _dutchAuction,
        address _coloringBook,
        address _amm
    ) external initializer {
        __ERC721_init("Elements", "PROTON");
        __ERC721Burnable_init();
        element = Element(_element);
        dutchAuction = _dutchAuction;
        coloringBook = ColoringBook(_coloringBook);
        amm = AMM(_amm);
    }

    function safeMint(address _to, uint256 _projectId)
        public
        returns (uint256 tokenId)
    {
        (, uint256 maxInvocations, , , , , , , , ) = coloringBook.projects(
            _projectId
        );
        require(
            msg.sender == dutchAuction,
            "Please use the Dutch Auction contract to mint a canvas"
        );
        require(
            (projectToInvocations[_projectId] + 1) <= maxInvocations,
            "This project has sold out"
        );
        projectToInvocations[_projectId] += 1;
        tokenId = (_projectId * 1_000_000) + projectToInvocations[_projectId];
        bytes32 hash = keccak256(abi.encodePacked(msg.sender));
        tokenIdTohash[tokenId] = hash;
        hashToTokenId[hash] = tokenId;
        _safeMint(_to, tokenId);
        tokenIdToProjectId[tokenId] = _projectId;
        projectIdToTokenIds[_projectId].push(tokenId);
        emit MintedToken(_to, _projectId, tokenId);
    }

    ////////// Wrapping Functions ///////////
    /// @dev includes:
    function createArt( // todo: this should be a struct
        address receiver,
        uint256[] memory featureIds,
        bool[] memory sell,
        uint256[] memory minERC20ToReceive,
        uint256 maxERC20ToSpend,
        uint256 canvasId
    ) public onlyOwner(canvasId) {
        uint256 projectId = tokenIdToProjectId[canvasId];
        (string[] memory categories, , ) = coloringBook
            .findProjectCategoryAndFeatureStrings(projectId);
        require(
            featureIds.length == categories.length,
            "Unequal features to categories"
        );

        for (uint256 i; i < categories.length; i++) {
            require(featureIds[i] > 0, "FeatureIds Cannot Be Zero");
            uint256 categoryToFeatureId = canvasIdToCategoryToFeatureId[
                canvasId
            ][categories[i]];
            // Skip if re-assigning same feature
            if (categoryToFeatureId == featureIds[i]) {
                continue;
            }

            require( // Category should include featureID
                keccak256(abi.encodePacked(categories[i])) ==
                    keccak256(
                        (
                            abi.encodePacked(
                                coloringBook.projectIdToFeatureIdToCategory(
                                    projectId,
                                    featureIds[i]
                                )
                            )
                        )
                    ),
                "Feature does not belong to category"
            );

            if (categoryToFeatureId > 0) {
                // Check if category is currently assined a feature > 0
                _unWrap( // unWrap previous Id
                    categories[i],
                    receiver,
                    sell[i],
                    categoryToFeatureId,
                    minERC20ToReceive[i],
                    canvasId
                );
            }
            _wrap(categories[i], featureIds[i], maxERC20ToSpend, canvasId); // Wrap new feature
        }
    }

    /// @notice unWrap underlying asset
    function unWrap(
        address receiver,
        uint256[] memory featureIds,
        bool[] memory sell,
        uint256[] memory minERC20ToReceive,
        uint256 canvasId
    ) public onlyOwner(canvasId) {
        for (uint256 i; i < featureIds.length; i++) {
            string memory category = findIdToCategory(
                tokenIdToProjectId[canvasId],
                featureIds[i]
            );
            _unWrap(
                category,
                receiver,
                sell[i],
                featureIds[i],
                minERC20ToReceive[i],
                canvasId
            );
        }
    }

    /////// View Functions ///////////
    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        (, , , , , , string memory projectBaseURI, , , ) = coloringBook
            .projects(tokenIdToProjectId[_tokenId]);

        return
            string(
                abi.encodePacked(projectBaseURI, Strings.toString(_tokenId))
            );
    }

    /// @dev returns the category of a feature
    /// @notice Should be used to assure different features
    /// from the same category are not wrapped together
    function findIdToCategory(uint256 projectId, uint256 featureId)
        public
        view
        returns (string memory categoryString)
    {
        categoryString = coloringBook.projectIdToFeatureIdToCategory(
            projectId,
            featureId
        );
    }

    function canvasToFeatures(uint canvasId) public view returns(string[] memory features) {
        (string[] memory categories, , ) = coloringBook
            .findProjectCategoryAndFeatureStrings(tokenIdToProjectId[canvasId]);
        features = new string[](categories.length);
        for(uint i; i<categories.length; i++) {
            uint tokenId = canvasIdToCategoryToFeatureId[canvasId][categories[i]];
            features[i] = element.tokenIdToFeature(tokenId);
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721Upgradeable, ERC1155Receiver)
        returns (bool)
    {
        return
            interfaceId == type(IERC1155Receiver).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    ///////////// Internal Function ///////////////
    /// @notice This functions completes the following:
    /// Check tokenId ownership
    /// Purchases token if user does not own token
    /// Wrap token - Within canvas
    /// Assign to category
    function _wrap(
        string memory category,
        uint256 featureId,
        uint256 maxERC20ToSpend,
        uint256 canvasId
    ) internal {
        if (
            element.balanceOf(msg.sender, featureId) == 0 // check ownership
        ) {
            amm.buyElements( // Buy elements user does not
                address(coloringBook),
                featureId,
                1,
                maxERC20ToSpend,
                address(this),
                msg.sender
            );
        } else {
            element.safeTransferFrom(
                msg.sender,
                address(this),
                featureId,
                1,
                ""
            );
        }

        // Assign a feature to a category
        canvasIdToCategoryToFeatureId[canvasId][category] = featureId;
        emit WrappedTokens(canvasId, featureId, 1);
    }

    /// @notice unWrap underlying asset
    function _unWrap(
        string memory category,
        address _receiver,
        bool _sell,
        uint256 _featureId,
        uint256 _minERC20ToReceive,
        uint256 _canvasId
    ) internal {
        canvasIdToCategoryToFeatureId[_canvasId][
            category // assign category => featureId = 0
        ] = 0;
        if (_sell) {
            // sell elements
            amm.sellElements(
                address(coloringBook),
                _featureId,
                1,
                _minERC20ToReceive,
                _receiver,
                address(this)
            );
        } else {
            // or transfer elements
            element.safeTransferFrom(
                address(this),
                _receiver,
                _featureId,
                1,
                ""
            );
        }
        emit UnWrappedTokens(_canvasId, _featureId, 1);
    }
}
