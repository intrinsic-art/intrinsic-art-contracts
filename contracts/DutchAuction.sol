// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./interfaces/IDutchAuction.sol";
import "./interfaces/IERC721Mint.sol";
import "./Canvas.sol";

contract DutchAuction is IDutchAuction, Initializable {
    using SafeERC20 for IERC20;

    mapping(uint256 => Auction) public projectIdToAuction;
    Canvas public canvas;
    address public studio;
    mapping(address => mapping(address => uint256))
        public artistToERC20Balances;

    modifier onlyStudio() {
        require(
            msg.sender == studio,
            "Only the Studio contract can call this function"
        );
        _;
    }

    function initialize(address _canvas, address _studio) external initializer {
        canvas = Canvas(_canvas);
        studio = _studio;
    }

    function addAuction(uint256 _projectId, Auction memory _auction)
        external
        onlyStudio
    {
        require(
            projectIdToAuction[_projectId].erc20Token == address(0),
            "Dutch Auction already initialized"
        );
        require(
            _auction.startPrice >= _auction.endPrice,
            "Start price must be greater than or equal end price"
        );
        require(
            _auction.endTime >= _auction.startTime,
            "End time must be after start time"
        );

        projectIdToAuction[_projectId] = Auction(
            _auction.startTime,
            _auction.endTime,
            _auction.startPrice,
            _auction.endPrice,
            _auction.artistAddress,
            _auction.erc20Token
        );

        emit AuctionAdded(
            msg.sender,
            _projectId,
            _auction.startTime,
            _auction.endTime,
            _auction.startPrice,
            _auction.endPrice,
            _auction.artistAddress
        );
    }

    // todo: this should return array of canvas IDs that were bought
    function buyCanvases(
        uint256 _projectId,
        uint256 _quantity,
        address _spender,
        address _recipient
    ) external onlyStudio returns (uint256[] memory canvasIds) {
        canvasIds = new uint256[](_quantity);

        require(
            block.timestamp >= projectIdToAuction[_projectId].startTime,
            "Auction has not started yet"
        );
        uint256 canvasesTotalPrice = getCanvasPrice(_projectId) * _quantity;

        // Safe transfer to the revenue claimer?
        IERC20(projectIdToAuction[_projectId].erc20Token).safeTransferFrom(
            _spender,
            address(this),
            canvasesTotalPrice
        );

        for (uint256 i; i < _quantity; i++) {
            canvasIds[i] = canvas.mint(_projectId, _recipient);
        }

        artistToERC20Balances[projectIdToAuction[_projectId].artistAddress][
            projectIdToAuction[_projectId].erc20Token
        ] += canvasesTotalPrice;

        emit CanvasesBought(_projectId, _quantity, canvasesTotalPrice);
    }

    function getCanvasPrice(uint256 _projectId)
        public
        view
        returns (uint256 canvasPrice)
    {
        if (block.timestamp < projectIdToAuction[_projectId].startTime) {
            // Auction hasn't started yet
            canvasPrice = projectIdToAuction[_projectId].startPrice;
        } else if (block.timestamp > projectIdToAuction[_projectId].endTime) {
            // Auction has ended
            canvasPrice = projectIdToAuction[_projectId].endPrice;
        } else {
            // Auction is active
            canvasPrice =
                projectIdToAuction[_projectId].startPrice -
                (
                    (((block.timestamp -
                        projectIdToAuction[_projectId].startTime) *
                        (projectIdToAuction[_projectId].startPrice -
                            projectIdToAuction[_projectId].endPrice)) /
                        (projectIdToAuction[_projectId].endTime -
                            projectIdToAuction[_projectId].startTime))
                );
        }
    }
}
