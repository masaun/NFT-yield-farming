/// Using local network
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

const NFTYieldFarming = artifacts.require("NFTYieldFarming");
const GovernanceToken = artifacts.require("GovernanceToken");

const _governanceToken = GovernanceToken.address;
const _governanceTokenPerBlock = web3.utils.toWei("100", "ether");  /// [Note]: This unit is amount. Not blockNumber
//const _governanceTokenPerBlock = "100";
const _startBlock = "300";
const _bonusEndBlock = "1000";

module.exports = async function(deployer, network, accounts) {
    const _admin = accounts[1];

    await deployer.deploy(NFTYieldFarming, 
                          _governanceToken, 
                          _admin,
                          _governanceTokenPerBlock,
                          _startBlock,
                          _bonusEndBlock);
};
