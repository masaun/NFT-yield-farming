// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { IBEP20 } from "./bsc/IBEP20.sol";
//import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/EnumerableSet.sol";
import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { BEP20GovernanceToken } from "./mock-bsc-tokens/BEP20GovernanceToken.sol";


/**
 * @notice - NFTYieldFarming (BEP20 version on BSC) is the master contract of GovernanceToken. This contract can make GovernanceToken.
 */
contract NFTYieldFarmingOnBSC is Ownable {
    using SafeMath for uint256;
    //using SafeERC20 for IERC20;

    // Info of each user.
    struct UserInfo {
        uint256 amount;     // How many LP tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.
    }

    // Info of each NFT pool.
    struct NFTPoolInfo {
        IERC721 nftToken;    /// NFT token as a target to stake
        IBEP20 lpToken;      /// LP token (BEP20) to be staked
        uint256 allocPoint;  /// How many allocation points assigned to this pool. GovernanceTokens to distribute per block.
        uint256 lastRewardBlock; // Last block number that GovernanceTokens distribution occurs.
        uint256 accGovernanceTokenPerShare; // Accumulated GovernanceTokens per share, times 1e12. See below.
    }
    
    // The Governance Token (BEP20 version)
    BEP20GovernanceToken public governanceToken;
    
    // Dev address. (Admin address)
    address public devaddr;
    
    // Block number when bonus GovernanceToken period ends.
    uint256 public bonusEndBlock;
    
    // GovernanceToken tokens created per block.
    uint256 public governanceTokenPerBlock;
    
    // Bonus muliplier for early GovernanceToken makers.
    uint256 public constant BONUS_MULTIPLIER = 10;
    
    // Info of each pool.
    NFTPoolInfo[] public nftPoolInfo;
    
    // Info of each user that stakes LP tokens.
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    
    // Total allocation poitns. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint = 0;
    
    // The block number when GovernanceToken mining starts.
    uint256 public startBlock;
    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);

    constructor(
        BEP20GovernanceToken _governanceToken,
        address _devaddr,  /// Admin address
        uint256 _governanceTokenPerBlock,
        uint256 _startBlock,
        uint256 _bonusEndBlock
    ) public {
        governanceToken = _governanceToken;
        devaddr = _devaddr;
        governanceTokenPerBlock = _governanceTokenPerBlock;
        bonusEndBlock = _bonusEndBlock;
        startBlock = _startBlock;
    }

    function nftPoolLength() external view returns (uint256) {
        return nftPoolInfo.length;
    }

    // Add a new lp to the pool. Can only be called by the owner.
    // XXX DO NOT add the same LP token more than once. Rewards will be messed up if you do.
    function addNFTPool(
        IERC721 _nftToken,   /// NFT token as a target to stake
        IBEP20 _lpToken,     /// LP token (BEP20) to be staked
        uint256 _allocPoint,
        bool _withUpdate
    ) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }

        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        nftPoolInfo.push(
            NFTPoolInfo({
                nftToken: _nftToken,
                lpToken: _lpToken,
                allocPoint: _allocPoint,
                lastRewardBlock: lastRewardBlock,
                accGovernanceTokenPerShare: 0
            })
        );

        totalAllocPoint = totalAllocPoint.add(_allocPoint);
    }

    // Return reward multiplier over the given _from to _to block.
    function getMultiplier(uint256 _from, uint256 _to)
        public
        view
        returns (uint256)
    {
        if (_to <= bonusEndBlock) {
            return _to.sub(_from).mul(BONUS_MULTIPLIER);
        } else if (_from >= bonusEndBlock) {
            return _to.sub(_from);
        } else {
            return
                bonusEndBlock.sub(_from).mul(BONUS_MULTIPLIER).add(
                    _to.sub(bonusEndBlock)
                );
        }
    }

    // View function to see pending GovernanceTokens on frontend.
    function pendingGovernanceToken(uint256 _pid, address _user)
        external
        view
        returns (uint256)
    {
        NFTPoolInfo storage pool = nftPoolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];

        uint256 accGovernanceTokenPerShare = pool.accGovernanceTokenPerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier =
                getMultiplier(pool.lastRewardBlock, block.number);
            uint256 governanceTokenReward =
                multiplier.mul(governanceTokenPerBlock).mul(pool.allocPoint).div(
                    totalAllocPoint
                );
            accGovernanceTokenPerShare = accGovernanceTokenPerShare.add(
                governanceTokenReward.mul(1e12).div(lpSupply)
            );
        }

        return user.amount.mul(accGovernanceTokenPerShare).div(1e12).sub(user.rewardDebt);
    }

    // Update reward vairables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        uint256 length = nftPoolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    // Update reward variables of the given pool to be up-to-date.
    function updatePool(uint256 _pid) public {
        NFTPoolInfo storage pool = nftPoolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (lpSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
        uint256 governanceTokenReward =
            multiplier.mul(governanceTokenPerBlock).mul(pool.allocPoint).div(
                totalAllocPoint
            );
        governanceToken.mint(devaddr, governanceTokenReward.div(10));  /// [Note]: mint method can be used by 
        governanceToken.mint(address(this), governanceTokenReward);    /// [Note]: mint method can be used by only owner
        pool.accGovernanceTokenPerShare = pool.accGovernanceTokenPerShare.add(
            governanceTokenReward.mul(1e12).div(lpSupply)
        );
        pool.lastRewardBlock = block.number;
    }

    // Deposit (Stake) LP tokens to the NFTYieldFarming contract for GovernanceToken allocation.
    function deposit(uint256 _pid, uint256 _amount) public {
        NFTPoolInfo storage pool = nftPoolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        updatePool(_pid);
        if (user.amount > 0) {
            uint256 pending =
                user.amount.mul(pool.accGovernanceTokenPerShare).div(1e12).sub(
                    user.rewardDebt
                );
            safeGovernanceTokenTransfer(msg.sender, pending);
        }
        pool.lpToken.transferFrom(  /// [Note]: Using BEP20
            address(msg.sender),
            address(this),
            _amount
        );
        user.amount = user.amount.add(_amount);
        user.rewardDebt = user.amount.mul(pool.accGovernanceTokenPerShare).div(1e12);
        emit Deposit(msg.sender, _pid, _amount);
    }

    // Withdraw (Un-Stake) LP tokens from the NFTYieldFarming contract.
    function withdraw(uint256 _pid, uint256 _amount) public {
        NFTPoolInfo storage pool = nftPoolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(user.amount >= _amount, "withdraw: not good");
        updatePool(_pid);
        uint256 pending =
            user.amount.mul(pool.accGovernanceTokenPerShare).div(1e12).sub(
                user.rewardDebt
            );
        safeGovernanceTokenTransfer(msg.sender, pending);
        user.amount = user.amount.sub(_amount);
        user.rewardDebt = user.amount.mul(pool.accGovernanceTokenPerShare).div(1e12);
        pool.lpToken.transfer(address(msg.sender), _amount);  /// [Note]: Using BEP20
        emit Withdraw(msg.sender, _pid, _amount);
    }

    // Safe GovernanceToken transfer function, just in case if rounding error causes pool to not have enough GovernanceToken.
    function safeGovernanceTokenTransfer(address _to, uint256 _amount) internal {
        uint256 governanceTokenBal = governanceToken.balanceOf(address(this));
        if (_amount > governanceTokenBal) {
            governanceToken.transfer(_to, governanceTokenBal);
        } else {
            governanceToken.transfer(_to, _amount);
        }
    }


    ///-----------------------------------------
    /// Change an admin address
    ///-----------------------------------------

    // Update dev address by the previous dev.
    function dev(address _devaddr) public {
        require(msg.sender == devaddr, "dev: wut?");
        devaddr = _devaddr;
    }
}
