//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./MockCanvasStorage.sol";

contract MockCanvasArtist is MockCanvasStorage {
    modifier onlyArtist(uint256 projectId) {
        require(msg.sender == projectIdToArtistAddress[projectId]);
        _;
    }

    function initProject(
        string calldata name,
        string calldata artist,
        string calldata description,
        string calldata website,
        string calldata license,
        uint256 state,
        uint256 projectId,
        bool dynamic, // whether project dynamic(rendered after mint) or static
        string calldata projectBaseURI, // if project is dynamic, tokenUri will be "{projectBaseUri}/{tokenId}"
        bool useIpfs, // if project is static, will use IPFS
        string calldata projectBaseIpfsURI, // tokenUri will be "{projectBaseIpfsURI}/{ipfsHash}"
        string calldata ipfsHash
    ) public onlyArtist(projectId){
        projects[projectId].name = name;
        projects[projectId].artist = artist;
        projects[projectId].description = description;
        projects[projectId].website = website;
        projects[projectId].license = license;
        projects[projectId].state = state;
        projects[projectId].dynamic = dynamic;
        projects[projectId].projectBaseURI = projectBaseURI;
        projects[projectId].useIpfs = useIpfs;
        projects[projectId].projectBaseIpfsURI = projectBaseIpfsURI;
        projects[projectId].ipfsHash = ipfsHash;
    }

    function updateScripts(
        uint256 projectId,
        string[] memory scripts,
        uint256[] memory scriptIndex,
        string memory scriptJSON,
        bool useHashString
    ) public onlyArtist(projectId){
        require(scripts.length == scriptIndex.length);
        for (uint256 i; i < scripts.length; i++) {
            projects[projectId].scriptCount += 1;
            projects[projectId].scripts[scriptIndex[i]] = scripts[i];
        }
        projects[projectId].scriptJSON = scriptJSON;
        projects[projectId].useHashString = useHashString;
    }
}