//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interfaces/ICanvas.sol";
import "./interfaces/IElement.sol";
import "./interfaces/IProjects.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract Projects is IProjects, Ownable {
    event ProjectCreated(uint256 projectId);
    
    ICanvas public canvas;
    IElement public element;
    string public baseURI;

    mapping(address => bool) internal whitelistedArtists;
    mapping(uint256 => ProjectData) internal projects;

    modifier updateProject(uint256 _projectId) {
        require(
            msg.sender == projects[_projectId].artistAddress,
            "P01"
        );
        require(
            !projects[_projectId].locked,
            "P02"
        );
        _;
    }

    function createProject(
        address _artistAddress,
        uint256 _maxSupply,
        string memory _metadata,
        string[] memory _elementCategoryLabels,
        string[] memory _elementCategoryValues,
        string[][] memory _elementLabels,
        string[][] memory _elementValues,
        uint256[][][] memory _elementAmounts,
        address[] calldata _recipients
    ) external {
        require(whitelistedArtists[msg.sender], "P03");
        whitelistedArtists[msg.sender] = false;

        uint256 projectId = canvas.createProject(address(this), _maxSupply);

        projects[projectId].artistAddress = _artistAddress;
        projects[projectId].metadata = _metadata;
        projects[projectId].elementCategoryLabels = _elementCategoryLabels;
        projects[projectId].elementCategoryValues = _elementCategoryValues;
        projects[projectId].elementTokenIds = element.createElements2D(
            _elementLabels,
            _elementValues,
            _elementAmounts,
            _recipients
        );

        emit ProjectCreated(projectId);
    }

    function createAndUpdateElements(
        uint256 _projectId,
        uint256[] calldata _elementCategoryIndexes,
        uint256[] calldata _elementIndexes,
        string[] memory _elementLabels,
        string[] memory _elementValues,
        uint256[][] calldata _elementAmounts,
        address[] calldata _elementRecipients
    ) external updateProject(_projectId) {
        require(_elementCategoryIndexes.length == _elementIndexes.length, "P04");
        require(_elementCategoryIndexes.length == _elementLabels.length, "P04");

        updateElements(
            _projectId,
            _elementCategoryIndexes,
            _elementIndexes,
            element.createElements(
            _elementLabels,
            _elementValues,
            _elementAmounts,
            _elementRecipients
        )
        );
    }

    function updateElements(
        uint256 _projectId,
        uint256[] calldata _elementCategoryIndexes,
        uint256[] calldata _elementIndexes,
        uint256[] memory _elementTokenIds
    ) public updateProject(_projectId) {
        for (uint256 i; i < _elementCategoryIndexes.length; i++) {
            projects[_projectId].elementTokenIds[_elementCategoryIndexes[i]][
                    _elementIndexes[i]
                ] = _elementTokenIds[i];
        }
    }

    function updateMetadata(uint256 _projectId, string calldata _metadata)
        external
        updateProject(_projectId)
    {
        projects[_projectId].metadata = _metadata;
    }

    function updateScript(
        uint256 _projectId,
        uint256 _scriptIndex,
        string calldata _script
    ) external updateProject(_projectId) {
        projects[_projectId].scripts[_scriptIndex] = (_script);
    }

    function updateElementCategories(
        uint256 _projectId,
        string[] memory _elementCategoryLabels,
        string[] memory _elementCategoryValues
    ) external updateProject(_projectId) {
        require(
            _elementCategoryLabels.length == _elementCategoryValues.length,
            "P04"
        );

        projects[_projectId].elementCategoryLabels = _elementCategoryLabels;
        projects[_projectId].elementCategoryValues = _elementCategoryValues;
    }

    function lockProject(uint256 _projectId)
        external
        updateProject(_projectId)
    {
        require(
            projects[_projectId].elementCategoryLabels.length ==
                projects[_projectId].elementTokenIds.length,
            "P04"
        );

        projects[_projectId].locked = true;
    }

    function updateBaseURI(string calldata _baseURI) external onlyOwner {
      baseURI = _baseURI;
    }

    function addWhitelistedArtists(address[] calldata _artists)
        external
        onlyOwner
    {
        for (uint256 i; i < _artists.length; i++) {
            whitelistedArtists[_artists[i]] = true;
        }
    }

    function removeWhitelistedArtists(address[] calldata _artists)
        external
        onlyOwner
    {
        for (uint256 i; i < _artists.length; i++) {
            whitelistedArtists[_artists[i]] = false;
        }
    }

    function getProjectIsLocked(uint256 _projectId) external view returns (bool) {
      return projects[_projectId].locked;
    }
    
    function getProjectArtist(uint256 _projectId) external view returns (address) {
      return projects[_projectId].artistAddress;
    }

    function getProjectScripts(uint256 _projectId)
        external
        view
        returns (string[] memory _scripts)
    {
        uint256 scriptCount = getProjectScriptCount(_projectId);
        _scripts = new string[](scriptCount);

        for(uint256 i; i < scriptCount; i++) {
          _scripts[i] = projects[_projectId].scripts[i];
        }
    }

    function getProjectScriptCount(uint256 _projectId) public view returns (uint256) {
      uint256 scriptIndex;

      while(keccak256(abi.encodePacked(projects[_projectId].scripts[scriptIndex])) != keccak256(abi.encodePacked(""))) {
        scriptIndex++;
      }

      return scriptIndex;
    }

    function getProjectElementCategoryLabels(uint256 _projectId) external view returns (string[] memory) {
      return projects[_projectId].elementCategoryLabels;
    }

    function getProjectElementCategoryValues(uint256 _projectId) external view returns (string[] memory) {
      return projects[_projectId].elementCategoryValues;
    }

    function getProjectElementTokenIds(uint256 _projectId) external view returns (uint256[][] memory) {
      return projects[_projectId].elementTokenIds;
    }

    function getProjectMetadata(uint256 _projectId) external view returns (string memory) {
      return projects[_projectId].metadata;
    }

    function getIsArtistWhitelisted(address _artist) external view returns (bool) {
      return whitelistedArtists[_artist];
    }

    function getProjectElementLabels(uint256 _projectId)
        public
        view
        returns (string[][] memory elementLabels)
    {
        uint256 elementCategoryLength = projects[_projectId]
            .elementCategoryLabels
            .length;
        elementLabels = new string[][](elementCategoryLength);

        for (uint256 i; i < elementCategoryLength; i++) {
            uint256 innerElementsLength = projects[_projectId]
                .elementTokenIds[i]
                .length;
            string[] memory innerElementLabels = new string[](innerElementsLength);
            for (uint256 j; j < innerElementsLength; j++) {
                innerElementLabels[j] = element.getElementLabel(
                    projects[_projectId].elementTokenIds[i][j]
                );
            }
            elementLabels[i] = innerElementLabels;
        }
    }

    function getProjectElementValues(uint256 _projectId)
        public
        view
        returns (string[][] memory elementValues)
    {
        uint256 elementCategoryLength = projects[_projectId]
            .elementCategoryLabels
            .length;
        elementValues = new string[][](elementCategoryLength);

        for (uint256 i; i < elementCategoryLength; i++) {
            uint256 innerElementsLength = projects[_projectId]
                .elementTokenIds[i]
                .length;
            string[] memory innerElementValues = new string[](innerElementsLength);
            for (uint256 j; j < innerElementsLength; j++) {
                innerElementValues[j] = element.getElementValue(
                    projects[_projectId].elementTokenIds[i][j]
                );
            }
            elementValues[i] = innerElementValues;
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
