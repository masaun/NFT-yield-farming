// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import { BEP20Token } from "../bsc/BEP20Token.sol";

/**
 * @notice - This is the LP token contract as BEP20 version
 */
contract BEP20LPToken is BEP20Token {
    constructor() public BEP20Token("LP Token (BEP20 version)", "LP-BEP-V1", 18, 1e8*1e18) {
        uint256 initialSupply = 1e8 * 1e18;  /// 1 milion LP-BEP-V1
        _mint(msg.sender, initialSupply);
    }
}
