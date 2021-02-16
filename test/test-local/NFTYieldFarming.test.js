/// Using local network
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

/// Openzeppelin test-helper
const { time } = require('@openzeppelin/test-helpers');

/// Artifact of smart contracts 
const NFTYieldFarming = artifacts.require("NFTYieldFarming");
const NFTToken = artifacts.require("MockNFTToken");  /// As a NFT token (ERC1155)
const LPToken = artifacts.require("MockLPToken");    /// As a LP token
const GovernanceToken = artifacts.require("GovernanceToken");  /// As a reward token and a governance token

/***
 * @dev - Execution COMMAND: $ truffle test ./test/test-local/NFTYieldFarming.test.js
 **/
contract("NFTYieldFarming", function(accounts) {
    /// Acccounts
    let deployer = accounts[0];
    let admin = accounts[1];
    let user1 = accounts[2];
    let user2 = accounts[3];

    /// Global contract instance
    let nftYieldFarming;
    let nftToken;
    let lpToken;
    let governanceToken;

    /// Global variable for each contract addresses
    let NFT_YIELD_FARMING;
    let NFT_TOKEN;
    let LP_TOKEN;
    let GOVERNANCE_TOKEN;

    describe("Check state in advance", () => {
        it("Check all accounts", async () => {
            console.log('\n=== accounts ===\n', accounts, '\n========================\n');
        }); 
    }); 

    describe("Setup smart-contracts", () => {
        it("Deploy the NFT token (ERC721) contract instance", async () => {
            nftToken = await NFTToken.new({ from: deployer });
            NFT_TOKEN = nftToken.address;
        });

        it("Deploy the LP token (ERC20) contract instance", async () => {
            lpToken = await LPToken.new({ from: deployer });
            LP_TOKEN = lpToken.address;
        });

        it("Deploy the Governance token (ERC20) contract instance", async () => {
            governanceToken = await GovernanceToken.new({ from: deployer });
            GOVERNANCE_TOKEN = governanceToken.address;
        });

        it("Deploy the NFTYieldFarming contract instance", async () => {
            const _devaddr = admin;  /// Admin address
            const _governanceTokenPerBlock = "100";
            const _startBlock = "100";
            const _bonusEndBlock = "1000";

            nftYieldFarming = await NFTYieldFarming.new(GOVERNANCE_TOKEN, _devaddr, _governanceTokenPerBlock, _startBlock, _bonusEndBlock, { from: deployer });
            NFT_YIELD_FARMING = nftYieldFarming.address;
        });

        it("Transfer ownership of the Governance token (ERC20) contract to the NFTYieldFarming contract", async () => {
            const newOwner = NFT_YIELD_FARMING;
            const txReceipt = await governanceToken.transferOwnership(newOwner, { from: deployer });
        });        
    });

    describe("Preparation for tests in advance", () => {
        it("Mint the NFT token (ERC721) to user1", async () => {
            const tokenURI = "https://testnft.example/token-id-8u5h2m.json";
            let txReceipt = await nftToken.mintTo(user1, tokenURI, { from: deployer });
        });

        it("Transfer the LP token (ERC20) from deployer to user1", async () => {
            const amount = web3.utils.toWei('1000', 'ether');
            let txReceipt1 = await lpToken.transfer(user1, amount, { from: deployer });
            let txReceipt2 = await lpToken.transfer(user2, amount, { from: deployer });
        });
    });

    describe("Process of the NFT yield farming (in case all staked-LP tokens are not withdrawn)", () => {
        it("Add a new NFT Pool as a target", async () => {
            const _nftToken = NFT_TOKEN;  /// NFT token as a target to stake
            const _lpToken = LP_TOKEN;    /// LP token to be staked
            const _allocPoint = "100";
            const _withUpdate = true;    
            let txReceipt = await nftYieldFarming.addNFTPool(_nftToken, _lpToken, _allocPoint, _withUpdate, { from: deployer });
        });

        it("Stake LP tokens to the NFT", async () => {
            const _nftPoolId = 0;
            const _stakeAmount = web3.utils.toWei('100', 'ether');  /// 100 LP Token

            let txReceipt1 = await lpToken.approve(NFT_YIELD_FARMING, _stakeAmount, { from: user1 });
            let txReceipt2 = await nftYieldFarming.deposit(_nftPoolId, _stakeAmount, { from: user1 });
        });

        it("Advance block to 1359", async () => {
            await time.advanceBlockTo("1359");

            let currentBlock = await time.latestBlock();
            console.log('=== currentBlock ===', String(currentBlock));

            assert.equal(
                currentBlock,
                "1359",
                "Current block should be 110"
            );
        });

        it("GovernanceToken balance should be more than 0", async () => {
            let governanceTokenBalance = await governanceToken.totalSupply({ from: user1 });
            console.log('=== governanceTokenBalance ===', String(governanceTokenBalance));
        });

        it("Un-stake and withdraw specified amount of LP tokens and receive reward tokens", async () => {
            const _nftPoolId = 0;
            const _unStakeAmount = web3.utils.toWei('50', 'ether');  /// 50 LP Token
            let txReceipt = await nftYieldFarming.withdraw(_nftPoolId, _unStakeAmount, { from: user1 });
        });
    });

});
