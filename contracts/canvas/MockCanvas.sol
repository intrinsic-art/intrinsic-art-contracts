//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "../interfaces/IMockCanvas.sol";
import "./MockCanvasStorage.sol";
import "./MockCanvasArtist.sol";

contract MockCanvas is
    IMockCanvas,
    MockCanvasStorage,
    MockCanvasArtist,
    Initializable,
    ERC721Upgradeable,
    ERC721BurnableUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using Strings for string;

    CountersUpgradeable.Counter private _projectIdCounter;

    function initialize()
        external
        initializer
    {
        __ERC721_init("Elements","PROTON");
        __ERC721Burnable_init();
    }

    function addProject(
        string memory _projectName,
        address _artistAddress,
        uint256 _maxInvocations,
        bool _dynamic
    ) public {
        uint256 projectId = _projectIdCounter.current();
        _projectIdCounter.increment();
        projectIdToArtistAddress[projectId] = _artistAddress;
        projects[projectId].name = _projectName;
        projects[projectId].state = uint256(State.Paused);
        projects[projectId].dynamic = _dynamic;
        projects[projectId].maxInvocations = _maxInvocations;
        if (!_dynamic) {
            projects[projectId].useHashString = false;
        } else {
            projects[projectId].useHashString = true;
        }
    }

    function safeMint(address to, uint256 _projectId) public {
        require(
            (projects[_projectId].invocations + 1) <=
                projects[_projectId].maxInvocations
        );
        projects[_projectId].invocations += 1;
        uint256 tokenId = (_projectId * 1_000_000) +
            projects[_projectId].invocations;
        bytes32 hash = keccak256(
            abi.encodePacked(
                block.number,
                blockhash(block.number - 1),
                msg.sender,
                block.timestamp
            )
        );
        tokenIdTohash[tokenId] = hash;
        hashToTokenId[hash] = tokenId;
        _safeMint(to, tokenId);
        tokenIdToProjectId[tokenId] = _projectId;
        projectIdToTokenIds[_projectId].push(tokenId);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        // if staticIpfsImageLink is present,
        // then return "{projectBaseIpfsURI}/{staticIpfsImageLink}"
        if (bytes(staticIpfsImageLink[_tokenId]).length > 0) {
            return
                string(
                    abi.encodePacked(
                        projects[tokenIdToProjectId[_tokenId]]
                            .projectBaseIpfsURI,
                        staticIpfsImageLink[_tokenId]
                    )
                );
        }

        // if project is not dynamic and useIpfs is true,
        // then return "{projectBaseIpfsURI}/{ipfsHash}"
        if (
            !projects[tokenIdToProjectId[_tokenId]].dynamic &&
            projects[tokenIdToProjectId[_tokenId]].useIpfs
        ) {
            return
                string(
                    abi.encodePacked(
                        projects[tokenIdToProjectId[_tokenId]]
                            .projectBaseIpfsURI,
                        projects[tokenIdToProjectId[_tokenId]].ipfsHash
                    )
                );
        }

        // else return "{projectBaseURI}/{_tokenId}"
        return
            string(
                abi.encodePacked(
                    projects[tokenIdToProjectId[_tokenId]].projectBaseURI,
                    Strings.toString(_tokenId)
                )
            );
    }
}
