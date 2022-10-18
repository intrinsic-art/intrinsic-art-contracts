//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interfaces/ICanvas.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Canvas is ICanvas, Initializable, ERC721BurnableUpgradeable, OwnableUpgradeable {
    uint256 nextProjectId = 1;
    mapping(uint256 => ProjectData) public projects;
    mapping(address => bool) public studios;

    function initialize(address _owner) external initializer {
        __ERC721_init("Intrinsic.art Canvases", "INSC");
        __ERC721Burnable_init();
        _transferOwnership(_owner);
    }

    function addStudio(address _studio) external onlyOwner {
      studios[_studio] = true;
    }

    function removeStudio(address _studio) external onlyOwner {
      studios[_studio] = false;
    }

    function createProject(
        address _studio,
        uint256 _maxSupply
    ) external returns (uint256 projectId) {
        require(studios[msg.sender], "Only a Studio contract can create a project");
        require(
            _maxSupply < 1_000_000,
            "Max supply must be less than 1,000,000"
        );

        projectId = nextProjectId;

        projects[projectId].studio = _studio;
        projects[projectId].maxSupply = _maxSupply;

        nextProjectId++;
    }

    function mint(uint256 _projectId, address _to)
        public returns (uint256 _tokenId)
    {
        require(
            msg.sender == projects[_tokenId].studio,
            "Only the studio can call this function"
        );
        require(projects[_projectId].supply < projects[_projectId].maxSupply, "");

        projects[_projectId].supply++;

        _tokenId = projects[_projectId].supply;

        _safeMint(_to, _tokenId);

        // emit MintedToken(_to, projectId, tokenId);
    }

    function getProjectIdFromCanvasId(uint256 canvasId)
        public
        pure
        returns (uint256 projectId)
    {
        projectId = canvasId / 1_000_000;
    }

    // function tokenURI(uint256 _tokenId)
    //     public
    //     view
    //     override
    //     returns (string memory)
    // {
    //     return
    // }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721Upgradeable)
        returns (bool)
    {
        return
            interfaceId == type(ERC721BurnableUpgradeable).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
