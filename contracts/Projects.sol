//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Canvas.sol";
import "./Element.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract Projects is Ownable {
    // todo: convert these to interfaces
    Canvas public canvas;
    Element public element;

    struct Metadata {
        string name;
        string description;
        string artistName;
        string website;
        string license;
        string aspectRatio;
    }

    struct ProjectData {
        bool locked;
        address artistAddress;
        string baseURI;
        mapping(uint256 => string) scripts;
        string[] elementCategoryLabels;
        string[] elementCategoryValues;
        uint256[][] elementTokenIds;
        Metadata metadata;
    }

    mapping(address => bool) public whitelistedArtists;
    mapping(uint256 => ProjectData) public projects;

    function addWhitelistedArtist(address _artist) external onlyOwner {
      whitelistedArtists[_artist] = true;
    }

    function removeWhitelistedArtist(address _artist) external onlyOwner {
      whitelistedArtists[_artist] = false;
    }

    function createProject(
        address _artistAddress,
        uint256 _maxSupply,
        string calldata _baseURI,
        Metadata memory _metadata,
        string[][] memory _elementLabels,
        string[][] memory _elementValues,
        uint256[][] memory _elementSupplys
    ) public returns (uint256 projectId, uint256[][] memory elementTokenIds) {
        projectId = canvas.createProject(
            address(this),
            _maxSupply
        );

        projects[projectId].baseURI = _baseURI;
        projects[projectId].artistAddress = _artistAddress;
        projects[projectId].metadata = _metadata;
        
        elementTokenIds = element.createElements(_elementLabels, _elementValues, _elementSupplys, address(this));

        // emit ProjectCreated(projectId);
    }

    function updateScript(uint256 _projectId, uint256 _scriptIndex, string calldata _script) external {
        require(
            msg.sender == projects[_projectId].artistAddress,
            "Only the artist can call this function"
        );

        projects[_projectId].scripts[_scriptIndex] = (_script);
    }
}