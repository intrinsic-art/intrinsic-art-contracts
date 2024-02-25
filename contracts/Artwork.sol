// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

import {ITraits} from "./interfaces/ITraits.sol";
import {IArtwork} from "./interfaces/IArtwork.sol";
import {IStringStorage} from "./interfaces/IStringStorage.sol";
import {IProjectRegistry} from "./interfaces/IProjectRegistry.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {ERC2981Upgradeable} from "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import {PaymentSplitter} from "./PaymentSplitter.sol";
import {IERC721MetadataUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721MetadataUpgradeable.sol";
import {ERC1155HolderUpgradeable, ERC1155ReceiverUpgradeable, IERC165Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";

/**
 * Implements ERC-721 standard for artwork tokens, and
 * functionality for minting artwork and reclaiming traits
 */
contract Artwork is
    IArtwork,
    IERC721MetadataUpgradeable,
    ERC2981Upgradeable,
    ERC721Upgradeable,
    ERC1155HolderUpgradeable,
    PaymentSplitter
{
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
    uint256 public whitelistStartTime;

    mapping(uint256 => ArtworkData) private artworkData;
    mapping(bytes32 => bool) private hashUsed;
    mapping(address => uint256) public whitelistMintsRemaining;

    modifier onlyProjectRegistry() {
        if (msg.sender != address(projectRegistry))
            revert OnlyProjectRegistry();
        _;
    }

    /** @inheritdoc IArtwork*/
    function setup(bytes calldata _data) external initializer {
        if (msg.sender != address(projectRegistry))
            revert OnlyProjectRegistry();

        (
            string memory _name,
            string memory _symbol,
            address _artistAddress,
            address _projectRegistry,
            uint96 _royaltyFeeNumerator,
            address[] memory _royaltyPayees,
            uint256[] memory _royaltyShares,
            StringStorageData memory _metadataJSONStringStorage,
            StringStorageData memory _scriptStringStorage,
            address _traits,
            WhitelistData memory _whitelistData
        ) = abi.decode(_data, (string, string, address, address, uint96, address[], uint256[], StringStorageData, StringStorageData, address, WhitelistData));

        __ERC721_init(_name, _symbol);
        __ERC2981_init();
        __PaymentSplitter_init(_royaltyPayees, _royaltyShares);

        artistAddress = _artistAddress;
        projectRegistry = IProjectRegistry(_projectRegistry);
        metadataJSONStringStorage = _metadataJSONStringStorage;
        scriptStringStorage = _scriptStringStorage;

        // Set EIP-2981 royalties to be sent to this contract
        _setDefaultRoyalty(address(this), _royaltyFeeNumerator);

        traits = ITraits(_traits);

        _updateWhitelist(
            _whitelistData
        );
    }

    /** @inheritdoc IArtwork*/
    function updateWhitelist(
        WhitelistData memory _whitelistData
    ) external onlyProjectRegistry {
        if (traits.auctionStartTime() <= block.timestamp)
            revert AuctionIsLive();

        _updateWhitelist(
            _whitelistData
        );
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
                _saltNonce
            )
        );

        if (hashUsed[_hash]) revert HashAlreadyUsed();

        _artworkTokenId = nextTokenId++;
        artworkData[_artworkTokenId].hash = _hash;
        artworkData[_artworkTokenId].traitTokenIds = _traitTokenIds;
        hashUsed[_hash] = true;

        traits.transferTraitsToMintArtwork(msg.sender, _traitTokenIds);
        _safeMint(msg.sender, _artworkTokenId);

        emit ArtworkMinted(_artworkTokenId, _traitTokenIds, _hash, msg.sender);
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

        traits.mintTraitsWhitelistOrProof(msg.sender, _traitTokenIds);

        uint256 tokenId = mintArtwork(_traitTokenIds, _saltNonce);

        emit ProofArtworkMinted(tokenId, msg.sender);
    }

    /** @inheritdoc IArtwork*/
    function mintArtworkWhitelist(
        uint256[] calldata _traitTokenIds,
        uint256 _saltNonce
    ) external {
        if (block.timestamp < whitelistStartTime) revert WhitelistStartTime();
        if (whitelistMintsRemaining[msg.sender] == 0)
            revert NoWhitelistMints();

        whitelistMintsRemaining[msg.sender]--;

        traits.mintTraitsWhitelistOrProof(msg.sender, _traitTokenIds);

        uint256 tokenId = mintArtwork(_traitTokenIds, _saltNonce);

        emit WhitelistArtworkMinted(tokenId, msg.sender);
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
    function tokenURI(
        uint256 _tokenId
    )
        public
        view
        override(ERC721Upgradeable, IERC721MetadataUpgradeable, IArtwork)
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
    function isHashUsed(bytes32 _hash) external view returns (bool) {
        return hashUsed[_hash];
    }

    /** @inheritdoc IArtwork*/
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(IERC165Upgradeable, ERC721Upgradeable, ERC1155ReceiverUpgradeable, IArtwork, ERC2981Upgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IArtwork).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * Updates whitelist data
     *
     * @param _whitelistData struct containing the whitelist start time, whitelist addresses, and whitelist amounts
     */
    function _updateWhitelist(
        WhitelistData memory _whitelistData
    ) private {
        if (_whitelistData.addresses.length != _whitelistData.amounts.length)
            revert InvalidArrayLengths();

        whitelistStartTime = _whitelistData.startTime;

        for (uint256 i; i < _whitelistData.addresses.length; ) {
            whitelistMintsRemaining[
                _whitelistData.addresses[i]
            ] = _whitelistData.amounts[i];

            unchecked {
                ++i;
            }
        }

        emit WhitelistUpdated(
            _whitelistData.startTime,
            _whitelistData.addresses,
            _whitelistData.amounts
        );
    }
}
