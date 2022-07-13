//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interfaces/ICanvas.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";

// import "@openzeppelin/contracts/utils/Strings.sol";

contract Canvas is ICanvas, Initializable, ERC721BurnableUpgradeable {
    ProjectData[] public projects;

    /////////// Canvas Functions /////////////
    function initialize() external initializer {
        __ERC721_init("Intrinsic.art Canvases", "INSC");
        __ERC721Burnable_init();
    }

    function mint(uint256 _projectId, address _to)
        public
        returns (uint256 tokenId)
    {
        require(
            (projects[_projectId].invocations) <=
                projects[_projectId].maxInvocations,
            "This project has sold out"
        );
        tokenId = (_projectId * 1_000_000) + projects[_projectId].invocations;
        projects[_projectId].invocations++;

        _safeMint(_to, tokenId);

        emit MintedToken(_to, _projectId, tokenId);
    }

    function createProject(
        address _studio,
        address _minter,
        uint256 _maxInvocations
    ) public returns (uint256 projectId) {
        require(
            _maxInvocations < 1_000_000,
            "Max invocations must be less than 1,000,000"
        );

        projectId = projects.length;

        ProjectData memory newProject = ProjectData({
            studio: _studio,
            minter: _minter,
            invocations: 0,
            maxInvocations: _maxInvocations
        });

        projects.push(newProject);
    }

    function getProjectIdFromCanvasId(uint256 canvasId)
        public
        pure
        returns (uint256 projectId)
    {
        projectId = canvasId / 1_000_000;
    }

    /////// View Functions ///////////
    // function tokenURI(uint256 _tokenId)
    //     public
    //     view
    //     override
    //     returns (string memory)
    // {
    //     return
    //         string(
    //             abi.encodePacked(
    //                 projects[getProjectIdFromCanvasId(_tokenId)].projectBaseURI,
    //                 Strings.toString(_tokenId)
    //             )
    //         );
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
