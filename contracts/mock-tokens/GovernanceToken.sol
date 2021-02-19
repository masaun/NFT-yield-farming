// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";


/**
 * @notice - This is the ERC20 token which works as a reward token and a governance token
 */
contract GovernanceToken is ERC20, Ownable {
    constructor() public ERC20("Governance Token", "GOV") {
        // uint256 initialSupply = 1e8 * 1e18;  /// 1 milion MLP-V1
        // _mint(msg.sender, initialSupply);
    }

    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }

}
