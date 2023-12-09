// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

import {ITraits} from "./interfaces/ITraits.sol";
import {IArtwork} from "./interfaces/IArtwork.sol";
import {IStringStorage} from "./interfaces/IStringStorage.sol";
import {IProjectRegistry} from "./interfaces/IProjectRegistry.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {PaymentSplitter} from "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {ERC1155Holder, ERC1155Receiver, IERC165} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

/**
 * Implements ERC-721 standard for artwork tokens, and
 * functionality for minting artwork and reclaiming traits
 */
contract Artwork is IArtwork, IERC721Metadata, ERC2981, ERC721, ERC1155Holder {
    using Strings for uint256;
    using Strings for address;

    bool public proofMinted;
    string public constant VERSION = "1.0";
    address public artistAddress;
    IProjectRegistry public projectRegistry;
    ITraits public traits;
    uint256 public nextTokenId;
    StringStorageData public metadataJSONStringStorage;
    StringStorageData public scriptStringStorage;

    mapping(uint256 => ArtworkData) private artworkData;
    mapping(address => uint256) private userNonces;

    constructor(
        string memory _name,
        string memory _symbol,
        address _artistAddress,
        address _projectRegistry,
        uint96 _royaltyFeeNumerator,
        address[] memory _royaltyPayees,
        uint256[] memory _royaltyShares,
        StringStorageData memory _metadataJSONStringStorage,
        StringStorageData memory _scriptStringStorage
    ) ERC721(_name, _symbol) {
        artistAddress = _artistAddress;
        projectRegistry = IProjectRegistry(_projectRegistry);
        address royaltySplitter = address(
            new PaymentSplitter(_royaltyPayees, _royaltyShares)
        );
        _setDefaultRoyalty(royaltySplitter, _royaltyFeeNumerator);

        metadataJSONStringStorage = _metadataJSONStringStorage;
        scriptStringStorage = _scriptStringStorage;
    }

    /** @inheritdoc IArtwork*/
    function setup(bytes calldata _data) external {
        if (msg.sender != address(projectRegistry))
            revert OnlyProjectRegistry();
        if (address(traits) != address(0)) revert AlreadySetup();

        address _traits = abi.decode(_data, (address));

        traits = ITraits(_traits);
    }

    /** @inheritdoc IArtwork*/
    function mintArtwork(
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

        traits.transferTraitsToMintArtwork(msg.sender, _traitTokenIds);
        _safeMint(msg.sender, _artworkTokenId);

        emit ArtworkMinted(_artworkTokenId, _traitTokenIds, _hash, msg.sender);
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
    function mintArtworkProof(
        uint256[] calldata _traitTokenIds,
        uint256 _saltNonce
    ) external {
        if (proofMinted) revert ProofAlreadyMinted();
        if (
            msg.sender != artistAddress &&
            msg.sender != address(projectRegistry)
        ) revert OnlyArtistOrProjectRegistry();

        proofMinted = true;

        traits.mintTraitsArtistProof(msg.sender, _traitTokenIds);

        mintArtwork(_traitTokenIds, _saltNonce);
    }

    /** @inheritdoc IArtwork*/
    function mintArtworkWhitelist(
        uint256[] calldata _traitTokenIds,
        uint256 _saltNonce
    ) external {
        traits.mintTraitsWhitelist(msg.sender, _traitTokenIds);

        mintArtwork(_traitTokenIds, _saltNonce);
    }

    /** @inheritdoc IArtwork*/
    function mintTraitsAndArtwork(
        uint256[] calldata _traitTokenIdsToBuy,
        uint256[] calldata _traitAmountsToBuy,
        uint256[] calldata _traitTokenIdsToCreateArtwork,
        uint256 _saltNonce
    ) external payable {
        traits.mintTraits{value: msg.value}(
            msg.sender,
            _traitTokenIdsToBuy,
            _traitAmountsToBuy
        );

        mintArtwork(_traitTokenIdsToCreateArtwork, _saltNonce);
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
    function metadataJSON() external view returns (string memory) {
        return
            IStringStorage(metadataJSONStringStorage.stringStorageAddress)
                .stringAtSlot(metadataJSONStringStorage.stringStorageSlot);
    }

    /** @inheritdoc IArtwork*/
    function script() external view returns (string memory) {
        return
            IStringStorage(scriptStringStorage.stringStorageAddress)
                .stringAtSlot(scriptStringStorage.stringStorageSlot);
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
