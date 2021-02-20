///--------------------------------------------------------
/// Script for executing on BSC testnet (web3.js version)
///--------------------------------------------------------

require('dotenv').config();

/// Tx
const Tx = require('ethereumjs-tx').Transaction;

/// Using BSC testnet
const Web3 = require('web3');
//const web3 = new Web3('https://data-seed-prebsc-2-s1.binance.org:8545'); /// [Note]: Endpoing is the BSC testnet
const provider = new Web3.providers.HttpProvider('https://data-seed-prebsc-2-s1.binance.org:8545');
const web3 = new Web3(provider);

/// Artifact of smart contracts 
const NFTYieldFarming = artifacts.require("NFTYieldFarmingOnBSC");  /// on BSC
const NFTToken = artifacts.require("MockNFTToken");    /// As a NFT token (ERC721)
const LPToken = artifacts.require("BEP20LPToken");     /// As a LP token (BEP20)
//const LPToken = artifacts.require("MockLPToken");    /// As a LP token (ERC20)
const GovernanceToken = artifacts.require("BEP20GovernanceToken");  /// As a reward token and a governance token

/***
 * @dev - Execution COMMAND: 
 **/

/// Acccounts
let deployer;
let admin;
let user1;
let user2;
let user3;

/// Private Key of each accounts
let privateKeyOfDeployer;
let privateKeyOfAdmin;
let privateKeyOfUser1;
let privateKeyOfUser2;
let privateKeyOfUser3;

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

/// ABI
let NFT_YIELD_FARMING_ABI;
let NFT_TOKEN_ABI;
let LP_TOKEN_ABI;
let GOVERNANCE_TOKEN_ABI;


///-----------------------------------------------
/// Execute all methods
///-----------------------------------------------

/// [Note]: For truffle exec (Remarks: Need to use module.exports)
module.exports = function(callback) {
    main().then(() => callback()).catch(err => callback(err));
};

async function main() {
    console.log("\n------------- Check state in advance -------------");
    await checkStateInAdvance();

    console.log("\n------------- Setup smart-contracts -------------");
    await setUpSmartContracts();
    await transferOwnershipToNFTYieldFarmingContract();

    console.log("\n------------- Preparation for tests in advance -------------");
    await preparationForTestsInAdvance();

    console.log("\n------------- Process of the NFT yield farming (in case all staked-LP tokens are not withdrawn) -------------");
    await processOfNFTYieldFarming();
}

async function processOfNFTYieldFarming() {
    await currentBlock1();
    await addNewNFTPoolAsATarget();
    await user1Stake10LPTokensAtBlock310();
    await user2Stake20LPTokensAtBlock314();
    await user3Stake30LPTokensAtBlock318();

    await currentBlock2();
    await totalSupplyOfGovernanceToken();
    await governanceTokenBalanceOfUser1();
    await governanceTokenBalanceOfanotherUsers();
    await governanceTokenBalanceOfNFTYieldFarmingOnBSCContract();
    await unstakeAndWithdraw();
}


///-----------------------------------------------
/// Methods
///-----------------------------------------------
async function checkStateInAdvance() {
    /// Assign addresses into global variables of wallets
    deployer = process.env.DEPLOYER_WALLET;
    admin = process.env.ADMIN_WALLET;
    user1 = process.env.USER_1_WALLET;
    user2 = process.env.USER_2_WALLET;
    user3 = process.env.USER_3_WALLET;
    console.log('=== deployer ===', deployer);
    console.log('=== admin ===', admin);
    console.log('=== user1 ===', user1);
    console.log('=== user2 ===', user2);
    console.log('=== user3 ===', user3);

    /// Assign private keys
    privateKeyOfDeployer = process.env.PRIVATE_KEY_OF_DEPLOYER_WALLET;
    privateKeyOfAdmin = process.env.PRIVATE_KEY_OF_ADMIN_WALLET;
    privateKeyOfUser1 = process.env.PRIVATE_KEY_OF_USER_1_WALLET;
    privateKeyOfUser2 = process.env.PRIVATE_KEY_OF_USER_2_WALLET;
    privateKeyOfUser3 = process.env.PRIVATE_KEY_OF_USER_3_WALLET;
}

async function setUpSmartContracts() {
    /// Assign the deployed-contract addresses on BSC testnet into each contracts
    console.log("Deploy the NFT token (ERC721) contract instance");
    // NFT_TOKEN = "0x1fa22E714E7F1012E6F438a89D89940B8f836B03";
    // nftToken = await NFTToken.at(NFT_TOKEN);
    const _nftToken = await NFTToken.new({ from: deployer });
    NFT_TOKEN = _nftToken.address;
    NFT_TOKEN_ABI = _nftToken.abi;
    nftToken = new web3.eth.Contract(NFT_TOKEN_ABI, NFT_TOKEN);

    console.log("Deploy the LP token (BEP20) contract instance");
    // LP_TOKEN = "0xa7ed98650d4C5EC7DDDA9394a68bDC257E4f1e75";
    // lpToken = await LPToken.at(LP_TOKEN);
    const _lpToken = await LPToken.new({ from: deployer });
    LP_TOKEN = _lpToken.address;
    LP_TOKEN_ABI = _lpToken.abi;
    lpToken = new web3.eth.Contract(LP_TOKEN_ABI, LP_TOKEN);

    console.log("Deploy the Governance token (BEP20) contract instance");
    // GOVERNANCE_TOKEN = "0xf9Cd775feaE9E57E2675C04cB6F6aF3148097cC8";
    // governanceToken = await GovernanceToken.at(GOVERNANCE_TOKEN);
    const _governanceToken = await GovernanceToken.new({ from: deployer });
    GOVERNANCE_TOKEN = _governanceToken.address;
    GOVERNANCE_TOKEN_ABI = _governanceToken.abi;
    governanceToken = new web3.eth.Contract(GOVERNANCE_TOKEN_ABI, GOVERNANCE_TOKEN);

    console.log("Deploy the NFTYieldFarming contract instance");
    /// [Note]: 100 per block farming rate starting at block 300 with bonus until block 1000
    const _devaddr = admin;  /// Admin address
    const _governanceTokenPerBlock = web3.utils.toWei("100", "ether");  /// [Note]: This unit is amount. Not blockNumber
    const _startBlock = "300";
    const _bonusEndBlock = "1000";

    const _nftYieldFarming = await NFTYieldFarming.new(GOVERNANCE_TOKEN, _devaddr, _governanceTokenPerBlock, _startBlock, _bonusEndBlock, { from: deployer });
    NFT_YIELD_FARMING = _nftYieldFarming.address;
    NFT_YIELD_FARMING_ABI = _nftYieldFarming.abi;
    nftYieldFarming = new web3.eth.Contract(NFT_YIELD_FARMING_ABI, NFT_YIELD_FARMING);
}

async function transferOwnershipToNFTYieldFarmingContract() {
    console.log("Transfer ownership of the Governance token (ERC20) contract to the NFTYieldFarming contract");
    const newOwner = NFT_YIELD_FARMING;
    //const txReceipt = await governanceToken.transferOwnership(newOwner, { from: deployer });
    let inputData1 = await governanceToken.methods.transferOwnership(newOwner).encodeABI();
    let transaction1 = await sendTransaction(deployer, privateKeyOfDeployer, GOVERNANCE_TOKEN, inputData1);
}

async function preparationForTestsInAdvance() {
    console.log("Mint the NFT token (ERC721) to user1");
    const tokenURI = "https://testnft.example/token-id-8u5h2m.json";
    //let txReceipt = await nftToken.mintTo(user1, tokenURI, { from: deployer });
    let inputData1 = await nftToken.methods.mintTo(user1, tokenURI).encodeABI();
    let transaction1 = await sendTransaction(deployer, privateKeyOfDeployer, NFT_TOKEN, inputData1);

    console.log("Transfer the LP token (BEP20) from deployer to 3 users");
    const amount = web3.utils.toWei('1000', 'ether');
    // let txReceipt1 = await lpToken.transfer(user1, amount, { from: deployer });
    // let txReceipt2 = await lpToken.transfer(user2, amount, { from: deployer });
    // let txReceipt3 = await lpToken.transfer(user3, amount, { from: deployer });
    let inputData2 = await nftToken.methods.mintTo(user1, amount).encodeABI();
    let inputData3 = await nftToken.methods.mintTo(user2, amount).encodeABI();
    let inputData4 = await nftToken.methods.mintTo(user3, amount).encodeABI();
    let transaction2 = await sendTransaction(deployer, privateKeyOfDeployer, NFT_TOKEN, inputData2);
    let transaction3 = await sendTransaction(deployer, privateKeyOfDeployer, NFT_TOKEN, inputData3);
    let transaction4 = await sendTransaction(deployer, privateKeyOfDeployer, NFT_TOKEN, inputData4);
}


///------------------------------
/// Process of NFT Yield Farming
///------------------------------
async function currentBlock1() {
    const currentBlock = await web3.eth.getBlockNumber();
    console.log('=== currentBlock 1 ===', String(currentBlock));
}

async function addNewNFTPoolAsATarget() {
    console.log("Add a new NFT Pool as a target");
    const _nftToken = NFT_TOKEN;  /// NFT token as a target to stake
    const _lpToken = LP_TOKEN;    /// LP token to be staked
    const _allocPoint = "100";
    const _withUpdate = true;
    //let txReceipt = await nftYieldFarming.addNFTPool(_nftToken, _lpToken, _allocPoint, _withUpdate, { from: deployer });
    let inputData1 = await nftYieldFarming.methods.addNFTPool(_nftToken, _lpToken, _allocPoint, _withUpdate).encodeABI();
    let transaction1 = await sendTransaction(deployer, privateKeyOfDeployer, NFT_YIELD_FARMING, inputData1);
}

async function user1Stake10LPTokensAtBlock310() {
    console.log("User1 stake 10 LP tokens at block 310");
    /// [Note]: Block to mint the GovernanceToken start from block 300.
    /// User1 stake (deposit) 10 LP tokens at block 310.
    //await time.advanceBlockTo("309");

    const _nftPoolId = 0;
    const _stakeAmount = web3.utils.toWei('10', 'ether');  /// 10 LP Token
    // let txReceipt1 = await lpToken.approve(NFT_YIELD_FARMING, _stakeAmount, { from: user1 });
    // let txReceipt2 = await nftYieldFarming.deposit(_nftPoolId, _stakeAmount, { from: user1 });
    let inputData1 = await lpToken.methods.approve(NFT_YIELD_FARMING, _stakeAmount).encodeABI();
    let inputData2 = await nftYieldFarming.methods.deposit(_nftPoolId, _stakeAmount).encodeABI();
    let transaction1 = await sendTransaction(user1, privateKeyOfUser1, LP_TOKEN, inputData1);
    let transaction2 = await sendTransaction(user1, privateKeyOfUser1, NFT_YIELD_FARMING, inputData2);
}

async function user2Stake20LPTokensAtBlock314() {
    console.log("User2 stake 20 LP tokens at block 314");
    /// [Note]: Block to mint the GovernanceToken start from block 300.
    /// User2 stake (deposit) 20 LP tokens at block 314.
    //await time.advanceBlockTo("313");

    const _nftPoolId = 0;
    const _stakeAmount = web3.utils.toWei('20', 'ether');  /// 20 LP Token
    let txReceipt1 = await lpToken.approve(NFT_YIELD_FARMING, _stakeAmount, { from: user2 });
    let txReceipt2 = await nftYieldFarming.deposit(_nftPoolId, _stakeAmount, { from: user2 });
}

async function user3Stake30LPTokensAtBlock318() {
    console.log("User3 stake 30 LP tokens at block 318");
    /// [Note]: Block to mint the GovernanceToken start from block 300.
    /// User3 stake (deposit) 30 LPs at block 318
    //await time.advanceBlockTo("317");

    const _nftPoolId = 0;
    const _stakeAmount = web3.utils.toWei('30', 'ether');  /// 30 LP Token

    let txReceipt1 = await lpToken.approve(NFT_YIELD_FARMING, _stakeAmount, { from: user3 });
    let txReceipt2 = await nftYieldFarming.deposit(_nftPoolId, _stakeAmount, { from: user3 });
}

async function user1Stake10MoreLPTokensAtBlock320() {
    console.log("User1 stake 10 more LP tokens at block 320");
    /// [Note]: Block to mint the GovernanceToken start from block 300.
    /// User1 stake (deposit) 10 more LP tokens at block 320.
    //await time.advanceBlockTo("319");

    const _nftPoolId = 0;
    const _stakeAmount4 = web3.utils.toWei('10', 'ether');  /// 10 LP Token

    let txReceipt1 = await lpToken.approve(NFT_YIELD_FARMING, _stakeAmount, { from: user1 });
    let txReceipt2 = await nftYieldFarming.deposit(_nftPoolId, _stakeAmount, { from: user1 });
}

async function currentBlock2() {
    console.log("Current block should be at block 321");
    const currentBlock = await web3.eth.getBlockNumber();
    console.log('=== currentBlock 2 ===', String(currentBlock));

    // let currentBlock = await time.latestBlock();
    // console.log('=== currentBlock ===', String(currentBlock));
    // assert.equal(
    //     currentBlock,
    //     "321",
    //     "Current block should be 321"
    // );
}

async function totalSupplyOfGovernanceToken() {
    console.log("Total Supply of the GovernanceToken should be 11000 (at block 321)");
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
}

async function governanceTokenBalanceOfUser1() {
    console.log("GovernanceToken balance of user1 should be 5667 (at block 321)");
    let governanceTokenBalanceOfUser1 = await governanceToken.balanceOf(user1, { from: user1 });
    console.log('=== GovernanceToken balance of user1 ===', String(governanceTokenBalanceOfUser1));
    assert.equal(
        Math.round(web3.utils.fromWei(governanceTokenBalanceOfUser1, 'ether')),
        5667,  /// [Note]: This is amount value rounded.
        "GovernanceToken balance of user1 should be 5667 (at block 321)"
    );
}

async function governanceTokenBalanceOfanotherUsers() {
    console.log("GovernanceToken balance of user2, user3, admin (at block 321)");
    let governanceTokenBalanceOfUser2 = await governanceToken.balanceOf(user2, { from: user2 });
    let governanceTokenBalanceOfUser3 = await governanceToken.balanceOf(user3, { from: user3 });
    let governanceTokenBalanceOfAdmin = await governanceToken.balanceOf(admin, { from: admin });
    console.log('=== GovernanceToken balance of user2 ===', String(governanceTokenBalanceOfUser2));
    console.log('=== GovernanceToken balance of user3 ===', String(governanceTokenBalanceOfUser3));
    console.log('=== GovernanceToken balance of admin ===', String(governanceTokenBalanceOfAdmin));
}

async function governanceTokenBalanceOfNFTYieldFarmingOnBSCContract() {
    console.log("GovernanceToken balance of the NFTYieldFarmingOnBSC contract should be 4333 (at block 321)");
    let governanceTokenBalance = await governanceToken.balanceOf(NFT_YIELD_FARMING, { from: user1 });
    console.log('=== GovernanceToken balance of the NFTYieldFarming contract ===', String(governanceTokenBalance));
    assert.equal(
        Math.round(web3.utils.fromWei(governanceTokenBalance, 'ether')),
        4333,  /// [Note]: This is amount value rounded.
        "GovernanceToken balance of the NFTYieldFarming contract should be 4333 (at block 321)"
    );
}

async function unstakeAndWithdraw() {
    console.log("Un-stake and withdraw 10 LP tokens and receive 5952 GovernanceToken as rewards (at block 322)");
    /// [Note]: Total LPs amount staked of user1 is 20 LP tokens at block 321.
    /// [Note]: Therefore, maximum withdraw amount for user1 is 20 LPs
    const _nftPoolId = 0;
    const _unStakeAmount = web3.utils.toWei('10', 'ether');  /// 10 LP Token
    let txReceipt = await nftYieldFarming.withdraw(_nftPoolId, _unStakeAmount, { from: user1 });

    let governanceTokenBalanceOfUser1 = await governanceToken.balanceOf(user1, { from: user1 });
    console.log('=== GovernanceToken balance of user1 ===', String(governanceTokenBalanceOfUser1));
}


///-------------------------------------
/// Sign and Broadcast the transaction
///-------------------------------------
async function sendTransaction(walletAddress, privateKey, contractAddress, inputData) {
    try {
        const txCount = await web3.eth.getTransactionCount(walletAddress);
        const nonce = await web3.utils.toHex(txCount);
        console.log('=== txCount, nonce ===', txCount, nonce);

        /// Build the transaction
        const txObject = {
            nonce:    web3.utils.toHex(txCount),
            from:     walletAddress,
            to:       contractAddress,  /// Contract address which will be executed
            value:    web3.utils.toHex(web3.utils.toWei('0', 'ether')),
            gasLimit: web3.utils.toHex(2100000),
            gasPrice: web3.utils.toHex(web3.utils.toWei('6', 'gwei')),
            data: inputData  
        }
        console.log('=== txObject ===', txObject)

        /// Sign the transaction
        privateKey = Buffer.from(privateKey, 'hex');
        let tx = new Tx(txObject, { 'chain': 'kovan'});  /// Chain ID = kovan
        tx.sign(privateKey);

        const serializedTx = tx.serialize();
        const raw = '0x' + serializedTx.toString('hex');

        /// Broadcast the transaction
        const transaction = await web3.eth.sendSignedTransaction(raw);
        console.log('=== transaction ===', transaction)

        /// Return the result above
        return transaction;
    } catch(e) {
        console.log('=== e ===', e);
        return String(e);
    }
}

