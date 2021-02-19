/// Using BSC testnet
const Web3 = require('web3');
const web3 = new Web3('https://data-seed-prebsc-2-s1.binance.org:8545'); /// [Note]: Endpoing is the BSC testnet

/// Openzeppelin test-helper
const { time } = require('@openzeppelin/test-helpers');

/// Artifact of smart contracts 
const NFTYieldFarming = artifacts.require("NFTYieldFarmingOnBSC");  /// on BSC
const NFTToken = artifacts.require("MockNFTToken");    /// As a NFT token (ERC721)
const LPToken = artifacts.require("BEP20LPToken");     /// As a LP token (BEP20)
//const LPToken = artifacts.require("MockLPToken");    /// As a LP token (ERC20)
const GovernanceToken = artifacts.require("BEP20GovernanceToken");  /// As a reward token and a governance token

/***
 * @dev - Execution COMMAND: 
 *        - $ npm run script:nft-yield-farming_bsc-testnet
 *        - $ truffle test ./test/test-bsc/NFTYieldFarming.test.js --network bsc_testnet
 **/
contract("NFTYieldFarming on BSC", function(accounts) {
    /// Acccounts
    let deployer = accounts[0];
    let admin = accounts[1];
    let user1 = accounts[2];
    let user2 = accounts[3];
    let user3 = accounts[4];

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
            // nftToken = await NFTToken.new({ from: deployer });
            // NFT_TOKEN = nftToken.address;
            // console.log('\n=== NFT_TOKEN ===', NFT_TOKEN);

            /// Using deployed contract address on BSC testnet
            NFT_TOKEN = "0x632f3a085Ea2C8e3a82127BC38e6281bA7C6c3e2";
            nftToken = await NFTToken.at(NFT_TOKEN);
        });

        it("Deploy the LP token (BEP20) contract instance", async () => {
            // lpToken = await LPToken.new({ from: deployer });
            // LP_TOKEN = lpToken.address;
            // console.log('\n=== LP_TOKEN ===', LP_TOKEN);

            /// Using deployed contract address on BSC testnet
            LP_TOKEN = "0x7E64DE6168C7498Db9484a9C3809db122b358BE3";
            lpToken = await LPToken.at(LP_TOKEN);
        });

        it("Deploy the Governance token (BEP20) contract instance", async () => {
            // governanceToken = await GovernanceToken.new({ from: deployer });
            // GOVERNANCE_TOKEN = governanceToken.address;
            // console.log('\n=== GOVERNANCE_TOKEN ===', GOVERNANCE_TOKEN);

            /// Using deployed contract address on BSC testnet
            GOVERNANCE_TOKEN = "0x7397F062ed24d20C350d56a612eb856cb01DE925";
            governanceToken = await GovernanceToken.at(GOVERNANCE_TOKEN);
        });

        it("Deploy the NFTYieldFarming contract instance", async () => {
            /// [Note]: 100 per block farming rate starting at block 300 with bonus until block 1000
            const _devaddr = admin;  /// Admin address
            const _governanceTokenPerBlock = web3.utils.toWei("100", "ether");  /// [Note]: This unit is amount. Not blockNumber
            //const _governanceTokenPerBlock = "100";
            const _startBlock = "300";
            const _bonusEndBlock = "1000";

            nftYieldFarming = await NFTYieldFarming.new(GOVERNANCE_TOKEN, _devaddr, _governanceTokenPerBlock, _startBlock, _bonusEndBlock, { from: deployer });
            NFT_YIELD_FARMING = nftYieldFarming.address;
            console.log('\n=== NFT_YIELD_FARMING ===', NFT_YIELD_FARMING);
        });

        it("Transfer ownership of the Governance token (BEP20) contract to the NFTYieldFarming contract", async () => {
            /// [Test]: Mint
            // const _mintAmount = web3.utils.toWei('100', 'ether');
            // await governanceToken.mint(user1, _mintAmount, { from: deployer});

            const newOwner = NFT_YIELD_FARMING;
            const txReceipt = await governanceToken.transferOwnership(newOwner, { from: deployer });
        });        
    });

    describe("Preparation for tests in advance", () => {
        it("Mint the NFT token (ERC721) to user1", async () => {
            const tokenURI = "https://testnft.example/token-id-8u5h2m.json";
            let txReceipt = await nftToken.mintTo(user1, tokenURI, { from: deployer });
        });

        it("Transfer the LP token (BEP20) from deployer to 3 users", async () => {
            const amount = web3.utils.toWei('1000', 'ether');
            let txReceipt1 = await lpToken.transfer(user1, amount, { from: deployer });
            let txReceipt2 = await lpToken.transfer(user2, amount, { from: deployer });
            let txReceipt3 = await lpToken.transfer(user3, amount, { from: deployer });
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

        it("User1 stake 10 LP tokens at block 310", async () => {
            /// [Note]: Block to mint the GovernanceToken start from block 300.
            /// User1 stake (deposit) 10 LP tokens at block 310.
            await time.advanceBlockTo("309");

            const _nftPoolId = 0;
            //const _stakeAmount = "10";  /// 10 LP Token
            const _stakeAmount = web3.utils.toWei('10', 'ether');  /// 10 LP Token

            let txReceipt1 = await lpToken.approve(NFT_YIELD_FARMING, _stakeAmount, { from: user1 });
            let txReceipt2 = await nftYieldFarming.deposit(_nftPoolId, _stakeAmount, { from: user1 });
        });

        it("User2 stake 20 LP tokens at block 314", async () => {
            /// [Note]: Block to mint the GovernanceToken start from block 300.
            /// User2 stake (deposit) 20 LP tokens at block 314.
            await time.advanceBlockTo("313");

            const _nftPoolId = 0;
            //const _stakeAmount = "20";  /// 20 LP Token
            const _stakeAmount = web3.utils.toWei('20', 'ether');  /// 20 LP Token

            let txReceipt1 = await lpToken.approve(NFT_YIELD_FARMING, _stakeAmount, { from: user2 });
            let txReceipt2 = await nftYieldFarming.deposit(_nftPoolId, _stakeAmount, { from: user2 });
        });

        it("User3 stake 30 LP tokens at block 318", async () => {
            /// [Note]: Block to mint the GovernanceToken start from block 300.
            /// User3 stake (deposit) 30 LPs at block 318
            await time.advanceBlockTo("317");

            const _nftPoolId = 0;
            //const _stakeAmount = "30";  /// 30 LP Token
            const _stakeAmount = web3.utils.toWei('30', 'ether');  /// 30 LP Token

            let txReceipt1 = await lpToken.approve(NFT_YIELD_FARMING, _stakeAmount, { from: user3 });
            let txReceipt2 = await nftYieldFarming.deposit(_nftPoolId, _stakeAmount, { from: user3 });
        });

        it("User1 stake 10 more LP tokens at block 320", async () => {
            /// [Note]: Block to mint the GovernanceToken start from block 300.
            /// User1 stake (deposit) 10 more LP tokens at block 320.
            await time.advanceBlockTo("319");

            const _nftPoolId = 0;
            //const _stakeAmount = "10";  /// 10 LP Token
            const _stakeAmount = web3.utils.toWei('10', 'ether');  /// 10 LP Token

            let txReceipt1 = await lpToken.approve(NFT_YIELD_FARMING, _stakeAmount, { from: user1 });
            let txReceipt2 = await nftYieldFarming.deposit(_nftPoolId, _stakeAmount, { from: user1 });
        });


        it("Current block should be at block 321", async () => {
            let currentBlock = await time.latestBlock();
            console.log('=== currentBlock ===', String(currentBlock));

            assert.equal(
                currentBlock,
                "321",
                "Current block should be 321"
            );
        });

        it("Total Supply of the GovernanceToken should be 11000 (at block 321)", async () => {
            ///  At this point (At block 321): 
            ///      TotalSupply of GovernanceToken: 1000 * (321 - 310) = 11000
            ///      User1 should have: 4*1000 + 4*1/3*1000 + 2*1/6*1000 = 5666
            ///      NFTYieldFarming contract should have the remaining: 10000 - 5666 = 4334
            let totalSupplyOfGovernanceToken = await governanceToken.totalSupply();
            console.log('=== totalSupplyOfGovernanceToken ===', String(totalSupplyOfGovernanceToken));
            assert.equal(
                Math.round(web3.utils.fromWei(totalSupplyOfGovernanceToken, 'ether')),
                11000,  /// [Note]: This is amount value rounded.
                "Total supply of the Governance tokens (at block 321) should be 11000"
            );
        });

        it("GovernanceToken balance of user1 should be 5667 (at block 321)", async () => {
            let governanceTokenBalanceOfUser1 = await governanceToken.balanceOf(user1, { from: user1 });
            console.log('=== GovernanceToken balance of user1 ===', String(governanceTokenBalanceOfUser1));
            assert.equal(
                Math.round(web3.utils.fromWei(governanceTokenBalanceOfUser1, 'ether')),
                5667,  /// [Note]: This is amount value rounded.
                "GovernanceToken balance of user1 should be 5667 (at block 321)"
            );
        });

        it("GovernanceToken balance of user2, user3, admin (at block 321)", async () => {
            let governanceTokenBalanceOfUser2 = await governanceToken.balanceOf(user2, { from: user2 });
            console.log('=== GovernanceToken balance of user2 ===', String(governanceTokenBalanceOfUser2));

            let governanceTokenBalanceOfUser3 = await governanceToken.balanceOf(user3, { from: user3 });
            console.log('=== GovernanceToken balance of user3 ===', String(governanceTokenBalanceOfUser3));

            let governanceTokenBalanceOfAdmin = await governanceToken.balanceOf(admin, { from: user3 });
            console.log('=== GovernanceToken balance of admin ===', String(governanceTokenBalanceOfAdmin));
        });

        it("GovernanceToken balance of the NFTYieldFarming contract should be 4333 (at block 321)", async () => {
            let governanceTokenBalance = await governanceToken.balanceOf(NFT_YIELD_FARMING, { from: user1 });
            console.log('=== GovernanceToken balance of the NFTYieldFarming contract ===', String(governanceTokenBalance));
            assert.equal(
                Math.round(web3.utils.fromWei(governanceTokenBalance, 'ether')),
                4333,  /// [Note]: This is amount value rounded.
                "GovernanceToken balance of the NFTYieldFarming contract should be 4333 (at block 321)"
            );
        });

        it("Un-stake and withdraw 10 LP tokens and receive 5952 GovernanceToken as rewards (at block 322)", async () => {
            /// [Note]: Total LPs amount staked of user1 is 20 LP tokens at block 321.
            /// [Note]: Therefore, maximum withdraw amount for user1 is 20 LPs
            const _nftPoolId = 0;
            //const _unStakeAmount = "10";  /// 10 LP Token 
            const _unStakeAmount = web3.utils.toWei('10', 'ether');  /// 10 LP Token
            let txReceipt = await nftYieldFarming.withdraw(_nftPoolId, _unStakeAmount, { from: user1 });
        
            let governanceTokenBalanceOfUser1 = await governanceToken.balanceOf(user1, { from: user1 });
            console.log('=== GovernanceToken balance of user1 ===', String(governanceTokenBalanceOfUser1));
        });
    });

});
