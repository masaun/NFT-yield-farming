require('dotenv').config();

const HDWalletProvider = require('@truffle/hdwallet-provider');  // @notice - Should use new module.
const mnemonic = process.env.MNEMONIC;

module.exports = {
  networks: {
    bsc_testnet: {  /// This is used for deployment and truffle test
      provider: () => new HDWalletProvider(mnemonic, `https://data-seed-prebsc-1-s2.binance.org:8545`),    /// [Note]: New RPC Endpoint
      //provider: () => new HDWalletProvider(mnemonic, `https://data-seed-prebsc-2-s1.binance.org:8545`),  /// [Note]: 503 eror
      network_id: 97,
      networkCheckTimeout: 9999,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    bsc_mainnet: {  /// Binance Smart Chain mainnet
      provider: () => new HDWalletProvider(mnemonic, `https://bsc-dataseed1.binance.org`),
      network_id: 56,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },

    ropsten: {
      provider: () => new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/v3/' + process.env.INFURA_KEY),
      network_id: '3',
      gas: 4712388,
      //gas: 4465030,          // Original
      //gasPrice: 5000000000,  // 5 gwei (Original)
      //gasPrice: 10000000000, // 10 gwei
      gasPrice: 100000000000,  // 100 gwei
      skipDryRun: true,        // Skip dry run before migrations? (default: false for public nets)
    },
    local: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      skipDryRun: true,
      gasPrice: 5000000000
    },
    test: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      skipDryRun: true,
      gasPrice: 5000000000
    }
  },

  compilers: {
    solc: {
      version: "0.6.12",  /// Final version of solidity-v0.6.x
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
}
