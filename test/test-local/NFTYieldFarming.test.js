/// Using local network
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

/// Openzeppelin test-helper
const { time } = require('@openzeppelin/test-helpers');

/// Artifact of smart contracts 
const NFTYieldFarming = artifacts.require("NFTYieldFarming");
const LPToken = artifacts.require("MockLPToken");  /// For a LP token


/***
 * @dev - Execution COMMAND: $ truffle test ./test/test-local/NFTYieldFarming.test.js
 **/
contract("NFTYieldFarming", function(accounts) {
    /// Acccounts
    let deployer = accounts[0];
    let user1 = accounts[1];
    let user2 = accounts[2];
    let user3 = accounts[3];

    /// Global contract instance
    let nftYieldFarming;
    let lpToken;

    /// Global variable for each contract addresses
    let NFT_YIELD_FARMING;
    let LP_TOKEN;

    describe("Check state in advance", () => {
        it("Check all accounts", async () => {
            console.log('\n=== accounts ===\n', accounts, '\n========================\n');
        }); 
    }); 

    describe("Setup smart-contracts", () => {
        it("Deploy the LP token (ERC20) contract instance", async () => {
            lpToken = await LPToken.new({ from: deployer });
            LP_TOKEN = lpToken.address;
        });

        it("Deploy the NFTYieldFarming contract instance", async () => {
            const _emissionRate = 10;   /// [Todo]: 10%
            nftYieldFarming = await NFTYieldFarming.new(_emissionRate, LP_TOKEN, { from: deployer });
            NFT_YIELD_FARMING = nftYieldFarming.address;
        });
    });

});
