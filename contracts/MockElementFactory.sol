//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "./interfaces/IMockElementFactory.sol";

contract MockElementFactory is IMockElementFactory{
    function createElement(
        address elementImpl,
        string[] memory names,
        string[] memory symbols
    ) external {
        require(names.length == symbols.length, "Arrays Not Equal");
        for(uint i; i<names.length; i++) {
            IMockElement clone = IMockElement(ClonesUpgradeable.clone(elementImpl));
            clone.initialize(names[i], symbols[i]);
            emit ElementCreated(elementImpl, names[i], symbols[i]);
        }
    }
}
