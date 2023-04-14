// SPDX-License-Identifier: GNU GPLv3
pragma solidity =0.8.19;

import {ITraits} from "./interfaces/ITraits.sol";
import {IArtwork} from "./interfaces/IArtwork.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC1155Holder, ERC1155Receiver, IERC165} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

contract Artwork is IArtwork, IERC721Metadata, ERC721, ERC1155Holder, Ownable {
    using Strings for uint256;
    using Strings for address;

    bool public locked;
    address public artistAddress;
    ITraits public traits;
    string public baseURI;
    string public scriptJSON;
    string public constant VERSION = "1.0.0";
    uint256 public nextTokenId;
    mapping(uint256 => string) private scripts;
    mapping(uint256 => ArtworkData) private artworkData;
    mapping(address => uint256) private userNonces;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI,
        string memory _scriptJSON,
        address _artistAddress,
        address _owner
    ) ERC721(_name, _symbol) {
        baseURI = _baseURI;
        scriptJSON = _scriptJSON;
        artistAddress = _artistAddress;
        _transferOwnership(_owner);
    }

    function setTraits(address _traits) external onlyOwner {
        if (address(traits) != address(0)) revert TraitsAlreadySet();

        traits = ITraits(_traits);
    }

    function updateScript(
        uint256 _scriptIndex,
        string calldata _script
    ) external onlyOwner {
        if (locked) revert Locked();

        scripts[_scriptIndex] = (_script);
    }

    function updateBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;

        emit BaseURIUpdated(_baseURI);
    }

    function updateArtistAddress(address _artistAddress) external {
        if (msg.sender != artistAddress) revert OnlyArtist();

        artistAddress = _artistAddress;
        emit ArtistAddressUpdated(_artistAddress);
    }

    function lockProject() external onlyOwner {
        if (locked) revert Locked();

        locked = true;
    }

    function createArtwork(
        uint256[] calldata _traitTokenIds
    ) public returns (uint256 _artworkTokenId) {
        bytes32 _hash = keccak256(
            abi.encodePacked(address(this), msg.sender, userNonces[msg.sender])
        );
        _artworkTokenId = nextTokenId;
        nextTokenId++;
        artworkData[_artworkTokenId].hash = _hash;
        artworkData[_artworkTokenId].traitTokenIds = _traitTokenIds;
        userNonces[msg.sender]++;

        emit ArtworkCreated(_artworkTokenId, _traitTokenIds, _hash, msg.sender);

        traits.transferTraitsToCreateArtwork(msg.sender, _traitTokenIds);
        _safeMint(msg.sender, _artworkTokenId);
    }

    function decomposeArtwork(uint256 _artworkTokenId) public {
        if (msg.sender != _ownerOf(_artworkTokenId)) revert OnlyArtworkOwner();

        // Clear Artwork state
        uint256[] memory traitTokenIds = artworkData[_artworkTokenId]
            .traitTokenIds;
        artworkData[_artworkTokenId].hash = 0;
        artworkData[_artworkTokenId].traitTokenIds = new uint256[](0);

        emit ArtworkDecomposed(_artworkTokenId, msg.sender);

        uint256[] memory amounts = new uint256[](traitTokenIds.length);
        for (uint256 i; i < amounts.length; ) {
          amounts[i] = 1;
          unchecked {
            ++i;
          }
        }

        _burn(_artworkTokenId);
        traits.safeBatchTransferFrom(address(this), msg.sender, traitTokenIds, amounts, "");
    }

    function buyTraitsCreateArtwork(
        uint256[] calldata _traitTokenIdsToBuy,
        uint256[] calldata _traitQuantitiesToBuy,
        uint256[] calldata _traitTokenIdsToCreateArtwork
    ) external payable {
        traits.buyTraits{value: msg.value}(
            msg.sender,
            _traitTokenIdsToBuy,
            _traitQuantitiesToBuy
        );
        createArtwork(_traitTokenIdsToCreateArtwork);
    }

    function tokenURI(
        uint256 tokenId
    )
        public
        view
        override(ERC721, IERC721Metadata, IArtwork)
        returns (string memory)
    {
        _requireMinted(tokenId);

        return
            bytes(baseURI).length > 0
                ? string(
                    abi.encodePacked(
                        baseURI,
                        address(this).toHexString(),
                        "/",
                        tokenId.toString()
                    )
                )
                : "";
    }

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

        for (uint256 i; i < traitCount;) {
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

    function projectScripts() external view returns (string[] memory _scripts) {
        uint256 scriptCount = projectScriptCount();
        _scripts = new string[](scriptCount);

        for (uint256 i; i < scriptCount;) {
            _scripts[i] = scripts[i];

            unchecked {
              ++i;
            }
        }
    }

    function projectScriptCount() public view returns (uint256) {
        uint256 scriptIndex;

        while (
            keccak256(abi.encodePacked(scripts[scriptIndex])) !=
            keccak256(abi.encodePacked(""))
        ) {
            scriptIndex++;
        }

        return scriptIndex;
    }

    function projectTraits()
        external
        view
        returns (
            uint256[] memory _traitTokenIds,
            string[] memory _traitNames,
            string[] memory _traitValues,
            uint256[] memory _traitTypeIndexes,
            string[] memory _traitTypeNames,
            string[] memory _traitTypeValues,
            uint256[] memory _traitTotalSupplys,
            uint256[] memory _traitMaxSupplys
        )
    {
        (
            _traitTokenIds,
            _traitNames,
            _traitValues,
            _traitTypeIndexes,
            _traitTypeNames,
            _traitTypeValues,
            _traitTotalSupplys,
            _traitMaxSupplys
        ) = traits.traits();
    }

    function userNonce(address _user) external view returns (uint256) {
        return userNonces[_user];
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(IERC165, ERC721, ERC1155Receiver, IArtwork)
        returns (bool)
    {
        return
            interfaceId == type(IArtwork).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
