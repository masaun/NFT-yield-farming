// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockLPToken is ERC20 {
    constructor() public ERC20("Mock LP Token", "MLP-V1") {
        uint256 initialSupply = 1e8 * 1e18;  /// 1 milion MLP-V1
        _mint(msg.sender, initialSupply);
    }
}
