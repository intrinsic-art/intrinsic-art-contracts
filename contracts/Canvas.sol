//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ICanvas.sol";
import "./interfaces/IGlobalStudio.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Canvas is
    ERC721,
    Ownable
{
    event ProjectCreated(uint256 indexed projectId, address indexed studio, uint256 maxSupply);
    event TokenMinted(uint256 indexed tokenId, address indexed _to);
    event StudioAdded(address indexed studio);
    event StudioRemoved(address indexed studio);

    struct ProjectData {
        address studio;
        uint256 supply;
        uint256 maxSupply;
    }

    uint256 nextProjectId = 1;
    mapping(uint256 => ProjectData) public projects;
    mapping(address => bool) public studios;

    constructor(address _owner) ERC721("Intrinsic.art Canvases", "INTR") {
      _transferOwnership(_owner);
    }

    function addStudio(address _studio) external onlyOwner {
        studios[_studio] = true;

        emit StudioAdded(_studio);
    }

    function removeStudio(address _studio) external onlyOwner {
        studios[_studio] = false;

        emit StudioRemoved(_studio);
    }

    function createProject(address _studio, uint256 _maxSupply)
        external
        returns (uint256 projectId)
    {
        require(
            studios[msg.sender],
            "C01"
        );
        require(
            _maxSupply < 1_000_000,
            "C02"
        );

        projectId = nextProjectId;

        projects[projectId].studio = _studio;
        projects[projectId].maxSupply = _maxSupply;

        nextProjectId++;

        emit ProjectCreated(projectId, _studio, _maxSupply);
    }

    function mint(uint256 _projectId, address _to)
        public
        returns (uint256 _tokenId)
    {
        require(
            msg.sender == projects[_projectId].studio,
            "C03"
        );
        require(
            projects[_projectId].supply < projects[_projectId].maxSupply,
            "C04"
        );

        _tokenId = _projectId * 1_000_000 + projects[_projectId].supply;

        projects[_projectId].supply++;

        _safeMint(_to, _tokenId);

        emit TokenMinted(_tokenId, _to);
    }

    function getProjectIdFromCanvasId(uint256 canvasId)
        public
        pure
        returns (uint256 projectId)
    {
        projectId = canvasId / 1_000_000;
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        return
            IGlobalStudio(projects[getProjectIdFromCanvasId(_tokenId)].studio)
                .getCanvasURI(_tokenId);
    }

    function getProjectMaxSupply(uint256 _projectId)
        external
        view
        returns (uint256)
    {
        return projects[_projectId].maxSupply;
    }

    function getProjectSupply(uint256 _projectId)
        external
        view
        returns (uint256)
    {
        return projects[_projectId].supply;
    }

    function getTokenElementLabels(uint256 _tokenId)
        external
        view
        returns (string[] memory)
    {
        return
            IGlobalStudio(projects[getProjectIdFromCanvasId(_tokenId)].studio)
                .getCanvasElementLabels(_tokenId);
    }

    function getTokenElementValues(uint256 _tokenId)
        external
        view
        returns (string[] memory)
    {
        return
            IGlobalStudio(projects[getProjectIdFromCanvasId(_tokenId)].studio)
                .getCanvasElementValues(_tokenId);
    }

    function getIsTokenWrapped(uint256 _tokenId) external view returns (bool) {
        return
            IGlobalStudio(projects[getProjectIdFromCanvasId(_tokenId)].studio)
                .getIsCanvasWrapped(_tokenId);
    }

    function getTokenHash(uint256 _tokenId) external view returns (bytes32) {
        return
            IGlobalStudio(projects[getProjectIdFromCanvasId(_tokenId)].studio)
                .getCanvasHash(_tokenId);
    }

    function getTokenElementCategoryLabels(uint256 _tokenId)
        external
        view
        returns (string[] memory)
    {
        uint256 projectId = getProjectIdFromCanvasId(_tokenId);
        return
            IGlobalStudio(projects[projectId].studio)
                .getProjectElementCategoryLabels(projectId);
    }

    function getProjectElementCategoryValues(uint256 _tokenId)
        external
        view
        returns (string[] memory)
    {
        uint256 projectId = getProjectIdFromCanvasId(_tokenId);
        return
            IGlobalStudio(projects[projectId].studio)
                .getProjectElementCategoryValues(projectId);
    }
}
