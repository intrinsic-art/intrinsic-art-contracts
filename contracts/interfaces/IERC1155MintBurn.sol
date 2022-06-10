//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC1155MintBurn {
    function mint(
        address account,
        uint256 id,
        uint256 amount
    ) external;

    function burn(
        address account,
        uint256 id,
        uint256 value
    ) external;

    function totalSupply(uint256 id) external view returns (uint256);
}
