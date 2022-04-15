//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

import "../interfaces/IMockCanvas.sol";
import "./MockCanvasStorage.sol";
import "./MockCanvasArtist.sol";

// todo: deploy multiple projects in one transaction
// todo: add programtic tokenURI / concat strings
// todo: add payment system
// todo: add more artist function
// todo: add ramdomizer function 
// todo: wrapping elements into Canvas
// Will all tokens be sent to this address / track ownership
contract MockCanvas is
    IMockCanvas,
    MockCanvasStorage,
    MockCanvasArtist,
    Initializable,
    ERC721Upgradeable,
    ERC721BurnableUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _projectIdCounter;

    function initialize(
        string memory _name,
        string memory _symbol
    ) external initializer {
        __ERC721_init(_name, _symbol);
        __ERC721Burnable_init();
    }

    function addProject(
        string memory _projectName,
        address _artistAddress,
        uint256 _pricePerTokenInWei,
        uint256 _maxInvocations,
        bool _dynamic
    ) public {
        uint256 projectId = _projectIdCounter.current();
        _projectIdCounter.increment();
        projectIdToArtistAddress[projectId] = _artistAddress;
        projects[projectId].name = _projectName;
        projectIdToCurrencySymbol[projectId] = "ETH";
        projectIdToPricePerTokenInWei[projectId] = _pricePerTokenInWei;
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

    // function tokenURI(uint256 _tokenId) external
    //           view returns (string memory) {
    //     // if staticIpfsImageLink is present,
    //     // then return "{projectBaseIpfsURI}/{staticIpfsImageLink}"
    //     if (bytes(staticIpfsImageLink[_tokenId]).length > 0) {
    //         return Strings.strConcat(
    //           projects[tokenIdToProjectId[_tokenId]].projectBaseIpfsURI,
    //           staticIpfsImageLink[_tokenId]);
    //     }

    //     // if project is not dynamic and useIpfs is true,
    //     // then return "{projectBaseIpfsURI}/{ipfsHash}"
    //     if (!projects[tokenIdToProjectId[_tokenId]].dynamic
    //         && projects[tokenIdToProjectId[_tokenId]].useIpfs) {
    //         return Strings.strConcat(
    //           projects[tokenIdToProjectId[_tokenId]].projectBaseIpfsURI,
    //           projects[tokenIdToProjectId[_tokenId]].ipfsHash);
    //     }

    //     // else return "{projectBaseURI}/{_tokenId}"
    //     return Strings.strConcat(
    //       projects[tokenIdToProjectId[_tokenId]].projectBaseURI,
    //       Strings.uint2str(_tokenId));
    // }
}
