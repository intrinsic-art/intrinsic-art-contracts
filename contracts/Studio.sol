//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./interfaces/IStudio.sol";
import "./Auction.sol";
import "./StringConverter.sol";

contract Studio is IStudio, Auction, ERC721Holder, StringConverter {
    mapping(uint256 => ArtworkData) public artworkData;
    mapping(address => uint256) public userNonces;

    constructor(
        address _owner,
        address _artwork,
        address _traits,
        uint256 _auctionStartDelay,
        string memory _baseURI
    ) {
        _transferOwnership(_owner);
        artwork = IArtwork(_artwork);
        traits = ITraits(_traits);
        auctionStartDelay = _auctionStartDelay;
        baseURI = _baseURI;
    }

    function createArtwork(uint256 _projectId, uint256[] calldata _traitIndexes)
        public
        returns (uint256 _artworkTokenId)
    {
        require(
            _traitIndexes.length ==
                projects[_projectId].traitTypeNames.length,
            "S01"
        );

        if (
            artwork.getProjectSupply(_projectId) <
            artwork.getProjectMaxSupply(_projectId)
        ) {
            _artworkTokenId = artwork.mint(_projectId, msg.sender);
        } else {
            require(projects[_projectId].blankArtworkIds.length > 0, "S02");
            _artworkTokenId = projects[_projectId].blankArtworkIds[
                projects[_projectId].blankArtworkIds.length - 1
            ];
            projects[_projectId].blankArtworkIds.pop();
            artwork.safeTransferFrom(address(this), msg.sender, _artworkTokenId);
        }

        bytes32 newHash = keccak256(
            abi.encodePacked(msg.sender, userNonces[msg.sender])
        );

        artworkData[_artworkTokenId].hash = newHash;

        uint256[] memory traitTokenIds = new uint256[](
            _traitIndexes.length
        );

        for (uint256 i; i < _traitIndexes.length; i++) {
            traitTokenIds[i] = projects[_projectId].traitTokenIds[i][
                _traitIndexes[i]
            ];

            traits.safeTransferFrom(
                msg.sender,
                address(this),
                traitTokenIds[i],
                1,
                ""
            );
        }

        artworkData[_artworkTokenId].created = true;
        artworkData[_artworkTokenId].traitTokenIds = traitTokenIds;
        userNonces[msg.sender]++;

        emit ArtworkCreated(_artworkTokenId, msg.sender);
    }

    function decomposeArtwork(uint256 _artworkTokenId) public {
        require(msg.sender == artwork.ownerOf(_artworkTokenId), "S03");
        require(artworkData[_artworkTokenId].created, "S04");

        // Transfer traits to the user
        for (
            uint256 i;
            i < artworkData[_artworkTokenId].traitTokenIds.length;
            i++
        ) {
            traits.safeTransferFrom(
                address(this),
                msg.sender,
                artworkData[_artworkTokenId].traitTokenIds[i],
                1,
                ""
            );
        }

        // Clear Artwork state
        artworkData[_artworkTokenId].hash = 0;
        artworkData[_artworkTokenId].created = false;
        artworkData[_artworkTokenId].traitTokenIds = new uint256[](0);

        // Transfer artwork ERC-721 from the user to this address
        artwork.safeTransferFrom(msg.sender, address(this), _artworkTokenId);

        // Add the canvas ID to the array of blank canvses held by the studio
        projects[getProjectIdFromCanvasId(_artworkTokenId)].blankArtworkIds.push(
            _artworkTokenId
        );

        emit ArtworkDecomposed(_artworkTokenId, msg.sender);
    }

    function buyTraitsCreateArtwork(
        uint256 _projectId,
        uint256[] calldata _traitTypeIndexesToBuy,
        uint256[] calldata _traitIndexesToBuy,
        uint256[] calldata _traitQuantitiesToBuy,
        uint256[] calldata _traitIndexesToWrap
    ) public {
        buyTraits(
            _projectId,
            _traitTypeIndexesToBuy,
            _traitIndexesToBuy,
            _traitQuantitiesToBuy
        );
        createArtwork(_projectId, _traitIndexesToWrap);
    }

    function getArtworkURI(uint256 _artworkTokenId)
        external
        view
        returns (string memory)
    {
        return string.concat(baseURI, toString(_artworkTokenId));
    }

    function getArtworkHash(uint256 _artworkId) external view returns (bytes32) {
        return artworkData[_artworkId].hash;
    }

    function getArtworkTraitNames(uint256 _artworkTokenId)
        external
        view
        returns (string[] memory traitNames)
    {
        uint256 traitNamesLength = artworkData[_artworkTokenId]
            .traitTokenIds
            .length;
        traitNames = new string[](traitNamesLength);

        for (uint256 i; i < traitNamesLength; i++) {
            traitNames[i] = traits.getTraitName(
                artworkData[_artworkTokenId].traitTokenIds[i]
            );
        }
    }

    function getArtworkTraitValues(uint256 _artworkTokenId)
        external
        view
        returns (string[] memory traitValues)
    {
        uint256 traitValuesLength = artworkData[_artworkTokenId]
            .traitTokenIds
            .length;
        traitValues = new string[](traitValuesLength);

        for (uint256 i; i < traitValuesLength; i++) {
            traitValues[i] = traits.getTraitValue(
                artworkData[_artworkTokenId].traitTokenIds[i]
            );
        }
    }

    function getIsArtworkCreated(uint256 _artworkTokenId)
        external
        view
        returns (bool)
    {
        return artworkData[_artworkTokenId].created;
    }
}
