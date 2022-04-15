//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract MockCanvasStorage {
    enum State{ Active, Paused, Locked}
    struct Project {
        // Project Information
        string name;
        string artist;
        string description;
        string website;
        string license;
        uint state;

        // number of NFTs minted for this project
        uint256 invocations;
        uint256 maxInvocations;

        // Javascript scripts used to generate the images
        uint256 scriptCount; // number of scripts
        mapping(uint256 => string) scripts; // store each script as a string
        string scriptJSON; // script metadata such as what libraries it depends on
        bool useHashString; // if true, hash is used as an input to generate the image

        // Rendering images
        bool dynamic; // whether project dynamic(rendered after mint) or static
        string projectBaseURI; // if project is dynamic, tokenUri will be "{projectBaseUri}/{tokenId}"
        bool useIpfs; // if project is static, will use IPFS
        string projectBaseIpfsURI; // tokenUri will be "{projectBaseIpfsURI}/{ipfsHash}"
        string ipfsHash;
    }
    mapping(uint256 => Project) projects;

    mapping(uint256 => address) public projectIdToArtistAddress;
    mapping(uint256 => string) public projectIdToCurrencySymbol;
    // mapping(uint256 => address) public projectIdToCurrencyAddress;
    mapping(uint256 => uint256) public projectIdToPricePerTokenInWei;
    // mapping(uint256 => address) public projectIdToAdditionalPayee;
    // mapping(uint256 => uint256) public projectIdToAdditionalPayeePercentage;
    // mapping(uint256 => uint256)
    //     public projectIdToSecondaryMarketRoyaltyPercentage;

    // All projects share the same NFT contract
    // This means that the mint/token counting system are the same
    // ex. project one mints 1,2,3 tokenID - project 2 mints 4,5,6
    // Therefore all tokenId mappings are global rather than within the struct
    mapping(uint256 => uint256) public tokenIdToProjectId;
    mapping(uint256 => uint256[]) internal projectIdToTokenIds;
    mapping(uint256 => bytes32) public tokenIdTohash;
    mapping(bytes32 => uint256) public hashToTokenId;
    mapping(uint256 => string) public staticIpfsImageLink;
}
