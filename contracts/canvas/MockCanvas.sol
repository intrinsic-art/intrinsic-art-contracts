//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "../MockElement.sol";

contract MockCanvas is Initializable, ERC721BurnableUpgradeable, ERC1155Holder {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using Strings for string;
    modifier onlyArtist(uint256 projectId) {
        require(msg.sender == projectIdToArtistAddress[projectId]);
        _;
    }
    modifier onlyOwner(uint256 canvasId) {
        require(
            ownerOf(canvasId) == msg.sender,
            "You are not the owner of this Canvas"
        );
        _;
    }

    /////// Project Storage ///////
    CountersUpgradeable.Counter private _projectIdCounter;
    enum State {
        Active,
        Paused,
        Locked
    }
    struct Project {
        // Project Information
        string name;
        string artist;
        string description;
        string website;
        string license;
        uint256 state;
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

    // All projects share the same NFT contract
    // This means that the mint/token counting system are the same
    // ex. project one mints 1,2,3 tokenID - project 2 mints 4,5,6
    // Therefore all tokenId mappings are global rather than within the struct
    mapping(uint256 => uint256) public tokenIdToProjectId;
    mapping(uint256 => uint256[]) internal projectIdToTokenIds;
    mapping(uint256 => bytes32) public tokenIdTohash;
    mapping(bytes32 => uint256) public hashToTokenId;
    mapping(uint256 => string) public staticIpfsImageLink;

    /////// Wrapping Storage /////////
    MockElement public mockElement;
    mapping(uint256 => mapping(uint256 => uint256))
        public canvasIdToFeatureToBalances;
    mapping(uint256 => uint256[]) public canvasIdToFeatures;
    mapping(uint256 => mapping(uint256 => uint256))
        public canvasIdToFeatureArrayIndex;
    mapping(uint256 => mapping(string => uint256))
        public canvasIdToCategoryToFeatureId;

    /////// Category Storage /////////
    struct FeatureInfo {
        string featureCategory;
        uint256[] featureTokenIds;
    }
    mapping(uint256 => mapping(uint256 => string))
        public projectIdToFeatureIdToCategory; // Check for duplicate features
    mapping(uint256 => FeatureInfo[])
        public projectIdToFeatureInfo; // check for duplicate categories

    /////////// Project Functions /////////////
    function initialize(address elementContract) external initializer {
        __ERC721_init("Elements", "PROTON");
        __ERC721Burnable_init();
        mockElement = MockElement(elementContract);
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

    function safeMint(address to, uint256 _projectId)
        public
        returns (uint256 tokenId)
    {
        require(
            (projects[_projectId].invocations + 1) <=
                projects[_projectId].maxInvocations
        );
        projects[_projectId].invocations += 1;
        tokenId = (_projectId * 1_000_000) + projects[_projectId].invocations;
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

    //////// Artist Functions //////////
    function updateProject(
        string memory name,
        string memory artist,
        string memory description,
        string memory website,
        string memory license,
        uint256 state,
        uint256 projectId,
        bool dynamic, // whether project dynamic(rendered after mint) or static
        string memory projectBaseURI, // if project is dynamic, tokenUri will be "{projectBaseUri}/{tokenId}"
        bool useIpfs, // if project is static, will use IPFS
        string memory projectBaseIpfsURI, // tokenUri will be "{projectBaseIpfsURI}/{ipfsHash}"
        string memory ipfsHash
    ) public onlyArtist(projectId) {
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
    ) public onlyArtist(projectId) {
        require(scripts.length == scriptIndex.length);
        for (uint256 i; i < scripts.length; i++) {
            projects[projectId].scriptCount += 1;
            projects[projectId].scripts[scriptIndex[i]] = scripts[i];
        }
        projects[projectId].scriptJSON = scriptJSON;
        projects[projectId].useHashString = useHashString;
    }

    ////////// Wrapping Functions ///////////
    function wrap(
        address owner,
        uint256[] memory featureIds,
        uint256[] memory amounts,
        uint256 canvasId
    ) public onlyOwner(canvasId) {
        for (uint256 i; i < featureIds.length; i++) {
            string memory featureCategory = findIdToCategory(
                tokenIdToProjectId[canvasId],
                featureIds[i]
            );
            // If the assigned feature == current feature then just update balance
            if (
                canvasIdToCategoryToFeatureId[canvasId][featureCategory] !=
                featureIds[i]
            ) {
                // If there is a feature assigned to a category
                // Move on to the next index, Do not wrap features w/ same category
                if (
                    canvasIdToCategoryToFeatureId[canvasId][featureCategory] > 0
                ) {
                    continue;
                }

                // Assign a feature to a category
                canvasIdToCategoryToFeatureId[canvasId][
                    featureCategory
                ] = featureIds[i];

                // Push the feature to the array of features/canvasId
                canvasIdToFeatures[canvasId].push(featureIds[i]);

                // Track the current index for easy lookup
                canvasIdToFeatureArrayIndex[canvasId][featureIds[i]] =
                    canvasIdToFeatures[canvasId].length -
                    1;
            }
            // update balances of features
            canvasIdToFeatureToBalances[canvasId][featureIds[i]] += amounts[i];
        }
        mockElement.safeBatchTransferFrom(
            owner,
            address(this),
            featureIds,
            amounts,
            ""
        );
    }

    function unWrap(
        address receiver,
        uint256[] memory featureIds,
        uint256[] memory amounts,
        uint256 canvasId
    ) public onlyOwner(canvasId) {
        for (uint256 i; i < featureIds.length; i++) {
            // If there is not a balance/ a feature is not wrapped - continue
            if (canvasIdToFeatureToBalances[canvasId][featureIds[i]] == 0) {
                continue;
            }

            canvasIdToFeatureToBalances[canvasId][featureIds[i]] -= amounts[i];
            // if the canvas balance == 0 then remove it
            if (canvasIdToFeatureToBalances[canvasId][featureIds[i]] == 0) {
                uint256 featureIndex = canvasIdToFeatureArrayIndex[canvasId][
                    featureIds[i]
                ];
                uint256 arrayLength = canvasIdToFeatures[canvasId].length;
                // Save the last index at the current index being removed
                canvasIdToFeatures[canvasId][featureIndex] = canvasIdToFeatures[
                    canvasId
                ][arrayLength - 1];
                canvasIdToFeatures[canvasId].pop();

                // assign the 0 index to the current category
                string memory featureCategory = findIdToCategory(
                    tokenIdToProjectId[canvasId],
                    featureIds[i]
                );
                canvasIdToCategoryToFeatureId[canvasId][featureCategory] = 0;
            }
        }
        mockElement.safeBatchTransferFrom(
            address(this),
            receiver,
            featureIds,
            amounts,
            ""
        );
    }

    ////////// Creating Features /////////
    /// @dev Artist should be able to create features
    /// @dev Creates token Ids w/ counter
    /// and assignes the tokenId w/ a feature
    /// @dev assigns a category to a feature
    /// therefore canvas contract can utilize
    /// to assure features from the same category are not
    /// wrapped together
    function createFeaturesAndCategories(
        uint256 projectId,
        string[] memory featureCategories,
        string[][] memory features
    ) public {
        // Looping through categories to assign mappings
        for (uint256 i; i < featureCategories.length; i++) {
            uint256[] memory ids = new uint256[](features[i].length);

            for (uint256 k; k < features[i].length; k++) {
                // Assign featureString to tokenId mapping
                uint256 tokenId = mockElement.createFeature(features[i][k]);
                projectIdToFeatureIdToCategory[projectId][
                    tokenId
                ] = featureCategories[i];
                // Assign ids @k index to current tokenId
                ids[k] = tokenId;
            }

            // Assign featureStruct to a projectId
            projectIdToFeatureInfo[projectId].push(
                FeatureInfo(featureCategories[i], ids)
            );
        }
    }

    /////// View Functions ///////////
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

    /// canavs ==> features / categories
    function getCanvasFeaturesAndCategories(uint256 canvasId)
        public
        view
        returns (string[] memory features, string[] memory categories)
    {
        uint256 projectId = tokenIdToProjectId[canvasId];
        uint256[] memory featureIds = canvasIdToFeatures[canvasId];

        features = new string[](featureIds.length);
        categories = new string[](featureIds.length);
        for (uint256 i = 0; i < featureIds.length; i++) {
            features[i] = mockElement.tokenIdToFeature(featureIds[i]); // tokenId to feature string
            categories[i] = projectIdToFeatureIdToCategory[projectId][
                featureIds[i]
            ]; // feature string to category
        }
    }

    /// @dev returns the category of a feature
    /// @notice Should be used to assure different features
    /// from the same category are not wrapped together
    function findIdToCategory(uint256 projectId, uint256 featureId)
        public
        view
        returns (string memory categoryString)
    {
        categoryString = projectIdToFeatureIdToCategory[projectId][featureId];
    }

            string featureCategory;
        uint256[] featureTokenIds;

    /// @notice Function for returning a project's feature info
    function findProjectCategoryAndFeatures(uint256 projectId)
        public
        view
        returns (FeatureInfo[] memory featureStructs)
    {
        featureStructs = new FeatureInfo[](projectIdToFeatureInfo[projectId].length);
        for(uint i; i < projectIdToFeatureInfo[projectId].length; i++) {
            featureStructs[i] = projectIdToFeatureInfo[projectId][i];
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721Upgradeable, ERC1155Receiver)
        returns (bool)
    {
        return
            interfaceId == type(IERC1155Receiver).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
