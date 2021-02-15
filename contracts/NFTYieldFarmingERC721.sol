// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.12;

import { IERC721 } from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { SafeMath } from '@openzeppelin/contracts/math/SafeMath.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';


/**
 * @notice - This is the NFT Yield Fariming contract (for ERC721-based NFT)
 */
contract NFTYieldFarming is Ownable {
    using SafeMath for uint256;
    
    struct UserInfo {
        uint256 amount;         // current staked LP
        uint256 lastUpdateAt;   // unix timestamp for last details update (when points calculated)
        uint256 points;         // total points collected before latest deposit
    }
    
    struct NFTInfo {
        address contractAddress;
        uint256 remaining;      // NFTs remaining to farm
        uint256 price;          // points required to claim NFT
    }
    
    uint256 public emissionRate;  // points generated per LP token per second staked
    IERC20 lpToken;               // token being staked
    
    NFTInfo[] public nftInfo;
    mapping(address => UserInfo) public userInfo;
    
    constructor(uint256 _emissionRate, IERC20 _lpToken) public {
        emissionRate = _emissionRate;
        lpToken = _lpToken;
    }
    
    /**
     * @notice - Add a new NFT token to the Pool (as a target to stake). Can only be called by the owner.
     * @notice - XXX DO NOT add the same NFT token more than once. Rewards will be messed up if you do.
     */
    function addNFT(
        address contractAddress,    // Only ERC721 NFT Supported!
        uint256 total,              // amount of NFTs deposited to farm (need to approve before)
        uint256 price
    ) external onlyOwner {
        nftInfo.push(NFTInfo({
            contractAddress: contractAddress,  /// ERC721 NFT contract address
            remaining: total,
            price: price
        }));
    }
    
    function stake(uint256 _amount) external {
        lpToken.transferFrom(
            msg.sender,
            address(this),
            _amount
        );
        
        UserInfo storage user = userInfo[msg.sender];
        
        // already deposited before
        if(user.amount != 0) {
            user.points = earned(msg.sender);
        }
        user.amount = user.amount.add(_amount);
        user.lastUpdateAt = now;
    }
    
    // claim nft if points threshold reached
    function claim(uint256 _nftIndex, uint256 _quantity) public {
        NFTInfo storage nft = nftInfo[_nftIndex];
        require(nft.remaining > 0, "All NFTs farmed");
        require(earned(msg.sender) >= nft.price.mul(_quantity), "Insufficient Points");
        UserInfo storage user = userInfo[msg.sender];
        
        // deduct points
        user.points = earned(msg.sender).sub(nft.price.mul(_quantity));
        user.lastUpdateAt = now;
        
        nft.remaining = nft.remaining.sub(_quantity);
    }
    
    /// Withdraw parts of LP tokens amount
    function withdraw(uint256 _amount) public {
        UserInfo storage user = userInfo[msg.sender];
        require(user.amount >= _amount, "Insufficient staked");
        
        // update userInfo
        user.points = earned(msg.sender);
        user.amount = user.amount.sub(_amount);
        user.lastUpdateAt = now;
        
        lpToken.transfer(
            msg.sender,
            _amount
        );
    }
    
    // withdraw all LP tokens
    function exit() external {
        withdraw(userInfo[msg.sender].amount);
    }
    
    function earned(address userAddress) public view returns (uint256) {
        UserInfo memory user = userInfo[userAddress];
        return user.points.add(pending(user));
    }
    
    function pending(UserInfo memory user) internal view returns (uint256) {
        uint256 blockTime = block.timestamp;
        return blockTime.sub(user.lastUpdateAt).mul(emissionRate).mul(user.amount);
 
    }
    
    function nftPoolLength() public view returns (uint256) {
        return nftInfo.length;
    }


}
