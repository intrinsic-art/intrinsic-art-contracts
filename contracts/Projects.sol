//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IArtwork.sol";
import "./interfaces/ITraits.sol";
import "./interfaces/IProjects.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract Projects is IProjects, Ownable {
    event ProjectCreated(uint256 projectId);
    
    IArtwork public artwork;
    ITraits public traits;
    string public baseURI;

    mapping(address => bool) internal admins;
    mapping(uint256 => ProjectData) internal projects;

    modifier onlyAdmin {
        require(
            admins[msg.sender],
            "P01"
        );
        _;
    }

    modifier notLocked(uint256 _projectId) {
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
        string[] memory _traitTypeNames,
        string[] memory _traitTypeValues,
        string[][] memory _traitNames,
        string[][] memory _traitValues,
        uint256[][][] memory _traitAmounts,
        address[] calldata _recipients
    ) external onlyAdmin {
        uint256 projectId = artwork.createProject(address(this), _maxSupply);

        projects[projectId].artistAddress = _artistAddress;
        projects[projectId].metadata = _metadata;
        projects[projectId].traitTypeNames = _traitTypeNames;
        projects[projectId].traitTypeValues = _traitTypeValues;
        projects[projectId].traitTokenIds = traits.createTraits2D(
            _traitNames,
            _traitValues,
            _traitAmounts,
            _recipients
        );

        emit ProjectCreated(projectId);
    }

    function createAndUpdateTraits(
        uint256 _projectId,
        uint256[] calldata _traitTypeIndexes,
        uint256[] calldata _traitIndexes,
        string[] memory _traitNames,
        string[] memory _traitValues,
        uint256[][] calldata _traitAmounts,
        address[] calldata _traitRecipients
    ) external onlyAdmin notLocked(_projectId) {
        require(_traitTypeIndexes.length == _traitIndexes.length, "P03");
        require(_traitTypeIndexes.length == _traitNames.length, "P03");

        updateTraits(
            _projectId,
            _traitTypeIndexes,
            _traitIndexes,
            traits.createTraits(
            _traitNames,
            _traitValues,
            _traitAmounts,
            _traitRecipients
        )
        );
    }

    function updateTraits(
        uint256 _projectId,
        uint256[] calldata _traitTypeIndexes,
        uint256[] calldata _traitIndexes,
        uint256[] memory _traitTokenIds
    ) public onlyAdmin notLocked(_projectId) {
        for (uint256 i; i < _traitTypeIndexes.length; i++) {
            projects[_projectId].traitTokenIds[_traitTypeIndexes[i]][
                    _traitIndexes[i]
                ] = _traitTokenIds[i];
        }
    }

    function updateMetadata(uint256 _projectId, string calldata _metadata)
        external
        onlyAdmin notLocked(_projectId)
    {
        projects[_projectId].metadata = _metadata;
    }

    function updateScript(
        uint256 _projectId,
        uint256 _scriptIndex,
        string calldata _script
    ) external onlyAdmin notLocked(_projectId) {
        projects[_projectId].scripts[_scriptIndex] = (_script);
    }

    function updateTraitTypes(
        uint256 _projectId,
        string[] memory _traitTypeNames,
        string[] memory _traitTypeValues
    ) external onlyAdmin notLocked(_projectId) {
        require(
            _traitTypeNames.length == _traitTypeValues.length,
            "P04"
        );

        projects[_projectId].traitTypeNames = _traitTypeNames;
        projects[_projectId].traitTypeValues = _traitTypeValues;
    }

    function lockProject(uint256 _projectId)
        external
        onlyAdmin notLocked(_projectId) 
    {
        require(
            projects[_projectId].traitTypeNames.length ==
                projects[_projectId].traitTokenIds.length,
            "P03"
        );

        projects[_projectId].locked = true;
    }

    function updateBaseURI(string calldata _baseURI) external onlyOwner {
      baseURI = _baseURI;
    }

    function addAdmins(address[] calldata _admins)
        external
        onlyOwner
    {
        for (uint256 i; i < _admins.length; i++) {
            admins[_admins[i]] = true;
        }
    }

    function removeAdmins(address[] calldata _admins)
        external
        onlyOwner
    {
        for (uint256 i; i < _admins.length; i++) {
            admins[_admins[i]] = false;
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

    function getProjectTraitTypeNames(uint256 _projectId) external view returns (string[] memory) {
      return projects[_projectId].traitTypeNames;
    }

    function getProjectTraitTypeValues(uint256 _projectId) external view returns (string[] memory) {
      return projects[_projectId].traitTypeValues;
    }

    function getProjectTraitTokenIds(uint256 _projectId) external view returns (uint256[][] memory) {
      return projects[_projectId].traitTokenIds;
    }

    function getProjectMetadata(uint256 _projectId) external view returns (string memory) {
      return projects[_projectId].metadata;
    }

    function getIsAdmin(address _admin) external view returns (bool) {
      return admins[_admin];
    }

    function getProjectTraitNames(uint256 _projectId)
        public
        view
        returns (string[][] memory traitNames)
    {
        uint256 traitTypesLength = projects[_projectId]
            .traitTypeNames
            .length;
        traitNames = new string[][](traitTypesLength);

        for (uint256 i; i < traitTypesLength; i++) {
            uint256 innerTraitsLength = projects[_projectId]
                .traitTokenIds[i]
                .length;
            string[] memory innerTraitNames = new string[](innerTraitsLength);
            for (uint256 j; j < innerTraitsLength; j++) {
                innerTraitNames[j] = traits.getTraitName(
                    projects[_projectId].traitTokenIds[i][j]
                );
            }
            traitNames[i] = innerTraitNames;
        }
    }

    function getProjectTraitValues(uint256 _projectId)
        public
        view
        returns (string[][] memory traitValues)
    {
        uint256 traitTypeLength = projects[_projectId]
            .traitTypeNames
            .length;
        traitValues = new string[][](traitTypeLength);

        for (uint256 i; i < traitTypeLength; i++) {
            uint256 innerTraitsLength = projects[_projectId]
                .traitTokenIds[i]
                .length;
            string[] memory innerTraitValues = new string[](innerTraitsLength);
            for (uint256 j; j < innerTraitsLength; j++) {
                innerTraitValues[j] = traits.getTraitValue(
                    projects[_projectId].traitTokenIds[i][j]
                );
            }
            traitValues[i] = innerTraitValues;
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
