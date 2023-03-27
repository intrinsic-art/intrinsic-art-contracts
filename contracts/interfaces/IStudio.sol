//SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface IStudio {
    struct ArtworkData {
        uint256[] traitTokenIds;
        bytes32 hash;
    }

    event ArtistAddressUpdated(address indexed artistAddress);
    event BaseURIUpdated(string baseURI);
    event ArtworkCreated(
        uint256 indexed artworkTokenId,
        uint256[] traitTokenIds,
        bytes32 hash,
        address indexed creator
    );
    event ArtworkDecomposed(
        uint256 indexed artworkTokenId,
        address indexed caller
    );

    function setTraits(address _traits) external;

    function updateScript(
        uint256 _scriptIndex,
        string calldata _script
    ) external;

    function updateBaseURI(string memory _baseURI) external;

    function lockProject() external;

    function createArtwork(
        uint256[] calldata _traitTokenIds
    ) external returns (uint256 _artworkTokenId);

    function decomposeArtwork(uint256 _artworkTokenId) external;

    function buyTraitsCreateArtwork(
        uint256[] calldata _traitTokenIdsToBuy,
        uint256[] calldata _traitQuantitiesToBuy,
        uint256[] calldata _traitTokenIdsToCreateArtwork
    ) external payable;

    function tokenURI(uint256 tokenId) external view returns (string memory);

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
        );

    function projectScripts() external view returns (string[] memory _scripts);

    function projectScriptCount() external view returns (uint256);

    function projectTraits()
        external
        view
        returns (
            uint256[] memory _traitTokenIds,
            string[] memory _traitNames,
            string[] memory _traitValues,
            uint256[] memory _traitTypeIndexes,
            string[] memory _traitTypeNames,
            string[] memory _traitTypeValues
        );

    function supportsInterface(bytes4 interfaceId) external view returns (bool);

    function locked() external view returns (bool);
}
