// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

import {ITraits} from "./interfaces/ITraits.sol";
import {IArtwork} from "./interfaces/IArtwork.sol";
import {IScriptStorage} from "./interfaces/IScriptStorage.sol";
import {IProjectRegistry} from "./interfaces/IProjectRegistry.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {PaymentSplitter} from "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {ERC1155Holder, ERC1155Receiver, IERC165} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

/**
 * Implements ERC-721 standard for artwork tokens,
 * and provides functions for creating and decomposing artwork
 */
contract Artwork is IArtwork, IERC721Metadata, ERC2981, ERC721, ERC1155Holder {
    using Strings for uint256;
    using Strings for address;

    address public royaltySplitter;
    IProjectRegistry public projectRegistry;
    ITraits public traits;
    string public metadataJSON;
    string public constant VERSION = "1.0.0";
    uint256 public nextTokenId;
    address[] private _scriptStorageContracts;
    mapping(uint256 => ArtworkData) private artworkData;
    mapping(address => uint256) private userNonces;

    modifier onlyProjectRegistry() {
        if (msg.sender != address(projectRegistry))
            revert OnlyProjectRegistry();
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _metadataJSON,
        address _projectRegistry,
        address[] memory _scriptStorageAddresses,
        uint96 _royaltyFeeNumerator,
        address[] memory _royaltyPayees,
        uint256[] memory _royaltyShares
    ) ERC721(_name, _symbol) {
        metadataJSON = _metadataJSON;
        projectRegistry = IProjectRegistry(_projectRegistry);
        address _royaltySplitter = address(
            new PaymentSplitter(_royaltyPayees, _royaltyShares)
        );
        _setDefaultRoyalty(_royaltySplitter, _royaltyFeeNumerator);
        royaltySplitter = _royaltySplitter;

        _scriptStorageContracts = _scriptStorageAddresses;
    }

    /** @inheritdoc IArtwork*/
    function setup(bytes calldata _data) external onlyProjectRegistry {
        if (address(traits) != address(0)) revert AlreadySetup();

        address _traits = abi.decode(_data, (address));
  
        if (_traits == address(0)) revert ZeroAddress();

        traits = ITraits(_traits);
    }

    /** @inheritdoc IArtwork*/
    function createArtwork(
        uint256[] calldata _traitTokenIds,
        uint256 _saltNonce
    ) public returns (uint256 _artworkTokenId) {
        bytes32 _hash = keccak256(
            abi.encodePacked(
                address(this),
                msg.sender,
                userNonces[msg.sender],
                _saltNonce
            )
        );
        _artworkTokenId = nextTokenId++;
        artworkData[_artworkTokenId].hash = _hash;
        artworkData[_artworkTokenId].traitTokenIds = _traitTokenIds;
        userNonces[msg.sender]++;

        traits.transferTraitsToCreateArtwork(msg.sender, _traitTokenIds);
        _safeMint(msg.sender, _artworkTokenId);

        emit ArtworkCreated(_artworkTokenId, _traitTokenIds, _hash, msg.sender);
    }

    /** @inheritdoc IArtwork*/
    function reclaimTraits(uint256 _artworkTokenId) external {
        if (msg.sender != _ownerOf(_artworkTokenId)) revert OnlyArtworkOwner();

        // Clear Artwork state
        uint256[] memory traitTokenIds = artworkData[_artworkTokenId]
            .traitTokenIds;
        artworkData[_artworkTokenId].hash = 0;
        artworkData[_artworkTokenId].traitTokenIds = new uint256[](0);

        uint256[] memory amounts = new uint256[](traitTokenIds.length);
        for (uint256 i; i < amounts.length; ) {
            amounts[i] = 1;
            unchecked {
                ++i;
            }
        }

        _burn(_artworkTokenId);
        traits.safeBatchTransferFrom(
            address(this),
            msg.sender,
            traitTokenIds,
            amounts,
            ""
        );

        emit TraitsReclaimed(_artworkTokenId, msg.sender);
    }

    /** @inheritdoc IArtwork*/
    function buyTraitsCreateArtwork(
        uint256[] calldata _traitTokenIdsToBuy,
        uint256[] calldata _traitAmountsToBuy,
        uint256[] calldata _traitTokenIdsToCreateArtwork,
        uint256 _saltNonce
    ) external payable {
        traits.buyTraits{value: msg.value}(
            msg.sender,
            _traitTokenIdsToBuy,
            _traitAmountsToBuy
        );

        createArtwork(_traitTokenIdsToCreateArtwork, _saltNonce);
    }

    /** @inheritdoc IArtwork*/
    function tokenURI(
        uint256 _tokenId
    )
        public
        view
        override(ERC721, IERC721Metadata, IArtwork)
        returns (string memory)
    {
        _requireMinted(_tokenId);

        string memory baseURI = projectRegistry.baseURI();

        return
            bytes(baseURI).length != 0
                ? string(
                    abi.encodePacked(
                        baseURI,
                        address(this).toHexString(),
                        "/",
                        _tokenId.toString()
                    )
                )
                : "";
    }

    /** @inheritdoc IArtwork*/
    function artwork(
        uint256 _artworkTokenId
    )
        external
        view
        returns (
            uint256[] memory _traitTokenIds,
            string[] memory _traitNames,
            string[] memory _traitValues,
            string[] memory _traitTypeNames,
            string[] memory _traitTypeValues,
            bytes32 _hash
        )
    {
        _requireMinted(_artworkTokenId);

        uint256 traitCount = artworkData[_artworkTokenId].traitTokenIds.length;
        _traitTokenIds = artworkData[_artworkTokenId].traitTokenIds;
        _traitNames = new string[](traitCount);
        _traitValues = new string[](traitCount);
        _traitTypeNames = new string[](traitCount);
        _traitTypeValues = new string[](traitCount);

        for (uint256 i; i < traitCount; ) {
            (
                _traitNames[i],
                _traitValues[i],
                _traitTypeNames[i],
                _traitTypeValues[i]
            ) = traits.trait(_traitTokenIds[i]);

            unchecked {
                ++i;
            }
        }

        _hash = artworkData[_artworkTokenId].hash;
    }

    /** @inheritdoc IArtwork*/
    function scriptStorageContracts()
        external
        view
        returns (address[] memory _scripts)
    {
        return _scriptStorageContracts;
    }

    /** @inheritdoc IArtwork*/
    function scripts() external view returns (string[] memory _scripts) {
        uint256 _scriptCount = _scriptStorageContracts.length;
        _scripts = new string[](_scriptCount);

        for (uint256 i; i < _scriptCount; ) {
            _scripts[i] = IScriptStorage(_scriptStorageContracts[i])
                .getScript();

            unchecked {
                ++i;
            }
        }
    }

    /** @inheritdoc IArtwork*/
    function userNonce(address _user) external view returns (uint256) {
        return userNonces[_user];
    }

    /** @inheritdoc IArtwork*/
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(IERC165, ERC721, ERC1155Receiver, IArtwork, ERC2981)
        returns (bool)
    {
        return
            interfaceId == type(IArtwork).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
