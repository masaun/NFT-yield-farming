// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import { BEP20Token } from "../bsc/BEP20Token.sol";


/**
 * @notice - This is the BEP20 token which works as a reward token and a governance token
 */
contract BEP20GovernanceToken is BEP20Token {
    constructor() public BEP20Token("Governance Token (BEP20 version)", "GOV", 18, 0) {
        // uint256 initialSupply = 1e8 * 1e18;  /// 1 milion MLP-V1
        // _mint(msg.sender, initialSupply);
    }

    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }

}
