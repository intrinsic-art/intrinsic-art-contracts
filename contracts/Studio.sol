//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./StringConverter.sol";
import "./interfaces/ITraits.sol";
import "./interfaces/IStudio.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";

contract Studio is
    OwnableUpgradeable,
    ERC721Upgradeable,
    StringConverter,
    IStudio,
    ERC1155HolderUpgradeable
{
    using SafeERC20 for IERC20;

    ITraits public traits;
    string public baseURI;
    uint256 public constant auctionPlatformFeeNumerator = 100_000_000;
    uint256 public constant FEE_DENOMINATOR = 1_000_000_000;

    uint256 nextTokenId = 1;
    uint256 totalSupply;
    uint256 maxSupply;

    bool public locked;
    address public artistAddress;
    mapping(uint256 => string) scripts;

    string public metadata;
    uint256 public auctionStartTime;
    uint256 public auctionEndTime;
    uint256 public auctionStartPrice;
    uint256 public auctionEndPrice;
    uint256 public artistClaimableRevenues;
    uint256 public platformClaimableRevenues;

    struct ArtworkData {
        uint256[] traitTokenIds;
        bytes32 hash;
    }

    mapping(uint256 => ArtworkData) public artworkData;
    mapping(address => uint256) public userNonces;
    mapping(address => bool) internal admins;

    event ArtworkCreated(
        uint256 indexed artworkTokenId,
        uint256[] traitTokenIds,
        bytes32 hash,
        address indexed creator
    );
    event ArtworkDecomposed(
        uint256 indexed artworkTokenId,
        address indexed caller
    );
    event AuctionScheduled(
        uint256 auctionStartTime,
        uint256 auctionEndTime,
        uint256 auctionStartPrice,
        uint256 auctionEndPrice
    );
    event TraitsBought(
        address indexed buyer,
        uint256[] traitTokenIds,
        uint256[] traitQuantities
    );
    event PlatformRevenueClaimed(uint256 claimedRevenue);
    event ArtistRevenueClaimed(uint256 claimedRevenue);

    event ProjectCreated(string baseURI, address artistAddress, uint256 maxSupply, string metadata);

    modifier onlyAdmin() {
        require(admins[msg.sender], "P01");
        _;
    }

    modifier notLocked() {
        require(!locked, "P02");
        _;
    }

    function initialize(
        string memory _name,
        string memory _symbol,
        address _traits,
        address _owner,
        address[] calldata _admins
    ) external initializer {
        __ERC721_init(_name, _symbol);
        traits = ITraits(_traits);
        _transferOwnership(_owner);
        _addAdmins(_admins);
    }

    function createProject(
        string memory _baseURI,
        address _artistAddress,
        uint256 _maxSupply,
        string memory _metadata
    ) external onlyAdmin {
        baseURI = _baseURI;
        artistAddress = _artistAddress;
        maxSupply = _maxSupply;
        metadata = _metadata;

        emit ProjectCreated(_baseURI, _artistAddress, _maxSupply, _metadata);
    }

    function createTraits(
        string[] memory _traitTypeNames,
        string[] memory _traitTypeValues,
        string[] calldata _traitNames,
        string[] calldata _traitValues,
        uint256[] calldata _traitTypeIndexes,
        uint256[] calldata _traitMaxSupplys
    ) external onlyAdmin {
        traits.createTraitsAndTypes(
            _traitTypeNames,
            _traitTypeValues,
            _traitNames,
            _traitValues,
            _traitTypeIndexes,
            _traitMaxSupplys
        );
    }

    function scheduleAuction(
        uint256 _auctionStartTime,
        uint256 _auctionEndTime,
        uint256 _auctionStartPrice,
        uint256 _auctionEndPrice
    ) external onlyAdmin {
        require(locked, "M03");
        require(_auctionEndTime >= _auctionStartTime, "M05");
        require(_auctionEndPrice <= _auctionStartPrice, "M06");

        auctionStartTime = _auctionStartTime;
        auctionEndTime = _auctionEndTime;
        auctionStartPrice = _auctionStartPrice;
        auctionEndPrice = _auctionEndPrice;

        emit AuctionScheduled(
            _auctionStartTime,
            _auctionEndTime,
            _auctionStartPrice,
            _auctionEndPrice
        );
    }

    function updateMetadata(
        string calldata _metadata
    ) external onlyAdmin notLocked {
        metadata = _metadata;
    }

    function updateScript(
        uint256 _scriptIndex,
        string calldata _script
    ) external onlyAdmin notLocked {
        scripts[_scriptIndex] = (_script);
    }

    function lockProject() external onlyAdmin notLocked {
        locked = true;
    }

    function buyTraits(
        uint256[] calldata _traitTokenIds,
        uint256[] calldata _traitAmounts
    ) public payable {
        require(_traitTokenIds.length == _traitAmounts.length, "M01");

        uint256 totalQuantity;

        for (uint256 i; i < _traitAmounts.length; i++) {
            totalQuantity += _traitAmounts[i];
        }

        uint256 ethAmount = totalQuantity * getTraitAuctionPrice();

        require(msg.value >= ethAmount, "");

        traits.mintBatch(msg.sender, _traitTokenIds, _traitAmounts);

        uint256 platformRevenue = (ethAmount * auctionPlatformFeeNumerator) /
            FEE_DENOMINATOR;
        platformClaimableRevenues += platformRevenue;
        artistClaimableRevenues += ethAmount - platformRevenue;

        emit TraitsBought(msg.sender, _traitTokenIds, _traitAmounts);
    }

    function claimPlatformRevenue() external onlyOwner {
        uint256 claimedRevenue = platformClaimableRevenues;
        require(claimedRevenue > 0, "M07");

        platformClaimableRevenues = 0;

        // todo: update this
        IERC20(address(0)).safeTransfer(msg.sender, claimedRevenue);

        emit PlatformRevenueClaimed(claimedRevenue);
    }

    function claimArtistRevenue() external {
        uint256 claimedRevenue = artistClaimableRevenues;
        require(claimedRevenue > 0, "M07");

        artistClaimableRevenues = 0;

        IERC20(address(0)).safeTransfer(msg.sender, claimedRevenue);

        emit ArtistRevenueClaimed(claimedRevenue);
    }

    function updateBaseURI(string calldata _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    function addAdmins(address[] calldata _admins) external onlyOwner {
        _addAdmins(_admins);
    }

    function _addAdmins(address[] calldata _admins) private {
        for (uint256 i; i < _admins.length; i++) {
            admins[_admins[i]] = true;
        }
    }

    function removeAdmins(address[] calldata _admins) external onlyOwner {
        _removeAdmins(_admins);
    }

    function _removeAdmins(address[] calldata _admins) private {
        for (uint256 i; i < _admins.length; i++) {
            admins[_admins[i]] = false;
        }
    }

    function createArtwork(
        uint256[] calldata _traitTokenIds
    ) public returns (uint256 _artworkTokenId) {
        traits.transferTraitsToCreateArtwork(msg.sender, _traitTokenIds);

        // todo: Handle this supply in better way
        totalSupply++;

        _artworkTokenId = nextTokenId;
        nextTokenId++;

        require(totalSupply <= maxSupply, "Minted out");

        bytes32 newHash = keccak256(
            abi.encodePacked(msg.sender, userNonces[msg.sender])
        );

        artworkData[_artworkTokenId].hash = newHash;
        artworkData[_artworkTokenId].traitTokenIds = _traitTokenIds;
        userNonces[msg.sender]++;

        emit ArtworkCreated(
            _artworkTokenId,
            _traitTokenIds,
            newHash,
            msg.sender
        );

        _safeMint(msg.sender, _artworkTokenId);
    }

    function decomposeArtwork(uint256 _artworkTokenId) public {
        // todo: use internal version of this function
        require(msg.sender == ownerOf(_artworkTokenId), "S03");

        traits.transferTraitsToDecomposeArtwork(
            msg.sender,
            artworkData[_artworkTokenId].traitTokenIds
        );

        // Clear Artwork state
        artworkData[_artworkTokenId].hash = 0;
        artworkData[_artworkTokenId].traitTokenIds = new uint256[](0);

        // Burn this token
        _burn(_artworkTokenId);
        totalSupply--;

        emit ArtworkDecomposed(_artworkTokenId, msg.sender);
    }

    function buyTraitsCreateArtwork(
        uint256[] calldata _traitTokenIdsToBuy,
        uint256[] calldata _traitQuantitiesToBuy,
        uint256[] calldata _traitTokenIdsToCreateArtwork
    ) public payable {
        buyTraits(_traitTokenIdsToBuy, _traitQuantitiesToBuy);
        createArtwork(_traitTokenIdsToCreateArtwork);
    }

    function getArtworkURI(
        uint256 _artworkTokenId
    ) external view returns (string memory) {
        return string.concat(baseURI, toString(_artworkTokenId));
    }

    function getArtworkHash(
        uint256 _artworkId
    ) external view returns (bytes32) {
        return artworkData[_artworkId].hash;
    }

    function getArtworkTraits(
        uint256 _artworkTokenId
    )
        external
        view
        returns (
            uint256[] memory traitTokenIds,
            string[] memory traitNames,
            string[] memory traitValues,
            string[] memory traitTypeNames,
            string[] memory traitTypeValues
        )
    {
        uint256 traitCount = artworkData[_artworkTokenId].traitTokenIds.length;
        traitTokenIds = artworkData[_artworkTokenId].traitTokenIds;
        traitNames = new string[](traitCount);
        traitValues = new string[](traitCount);
        traitTypeNames = new string[](traitCount);
        traitTypeValues = new string[](traitCount);

        for (uint256 i; i < traitCount; i++) {
            traitNames[i] = traits.getTraitName(traitTokenIds[i]);
            traitValues[i] = traits.getTraitValue(traitTokenIds[i]);
            traitTypeNames[i] = traits.getTraitTypeName(traitTokenIds[i]);
            traitTypeValues[i] = traits.getTraitTypeValue(traitTokenIds[i]);
        }
    }

    function getProjectIsLocked() external view returns (bool) {
        return locked;
    }

    function getProjectArtist() external view returns (address) {
        return artistAddress;
    }

    function getProjectScripts()
        external
        view
        returns (string[] memory _scripts)
    {
        uint256 scriptCount = getProjectScriptCount();
        _scripts = new string[](scriptCount);

        for (uint256 i; i < scriptCount; i++) {
            _scripts[i] = scripts[i];
        }
    }

    function getProjectScriptCount() public view returns (uint256) {
        uint256 scriptIndex;

        while (
            keccak256(abi.encodePacked(scripts[scriptIndex])) !=
            keccak256(abi.encodePacked(""))
        ) {
            scriptIndex++;
        }

        return scriptIndex;
    }

    function getProjectMetadata() external view returns (string memory) {
        return metadata;
    }

    function getIsAdmin(address _admin) external view returns (bool) {
        return admins[_admin];
    }

    function getTraits()
        external
        view
        returns (
            uint256[] memory _traitTokenIds,
            string[] memory _traitNames,
            string[] memory _traitValues,
            uint256[] memory _traitTypeIndexes,
            string[] memory _traitTypeNames,
            string[] memory _traitTypeValues
        )
    {
        (
            _traitTokenIds,
            _traitNames,
            _traitValues,
            _traitTypeIndexes,
            _traitTypeNames,
            _traitTypeValues
        ) = traits.getTraits();
    }

    function getTraitAuctionPrice() public view returns (uint256 _price) {
        require(
            block.timestamp >= auctionStartTime,
            "Auction hasn't started yet"
        );
        if (block.timestamp > auctionEndTime) {
            // Auction has ended
            _price = auctionEndPrice;
        } else {
            // Auction is active
            _price =
                auctionStartPrice -
                (
                    (((block.timestamp - auctionStartTime) *
                        (auctionStartPrice - auctionEndPrice)) /
                        (auctionEndTime - auctionStartTime))
                );
        }
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721Upgradeable, ERC1155ReceiverUpgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IStudio).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
