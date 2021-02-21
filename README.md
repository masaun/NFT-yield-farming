# NFT Yield Farming on BSC

***
## 【Introduction of the NFT Yield Farming on BSC】
- This is a smart contract that enable a user to farm yield by staking LP tokens into a NFT pool.
  - Once a user stake LP tokens into a NFT pool, reward token (Governance Token) are mined every block.
  - User who staked can receive the Governance Tokens as rewards (as farmed-yield) when that user un-stake.
- This smart contract works on BSC (Binance Smart Chain).

&nbsp;

***

## 【Workflow】
- Diagram / Workflow


&nbsp;

***

## 【Remarks】
- Governance Token
  - At the moment, Governance Token is used as a reward token.
  - Although it has not implemented yet, I will implement Governance Token for governance strucure (e.g. Governance Token holders can vote, etc...) in the future.

<br>

- LP tokens
  - Assuming LP tokens is a pair between the Governance Token and BNB. 
  - But, pool to create this pair (LP tokens) has not been implemented yet. (at the mement)


<br>

- Version
  - Solidity (Solc): v0.6.12
  - Truffle: v5.1.60
  - web3.js: v1.2.9
  - openzeppelin-solidity: v3.2.0


&nbsp;

***

## 【Setup】
### ① Install modules
- Install npm modules in the root directory
```
$ npm install
```

<br>

### ② Compile & migrate contracts (on Locan or BSC testnet)
- Migrate on BSC testnet
```
$ npm run migrate:bsc-testnet
```


<br>

### ③ Test
- Execute test of the smart-contracts (on the BSC testnet)
  - [Note]: Sometime, timeout happen on this test. So I recommend that you try `④ Script` below instead of this test.   
```
$ npm run test:nft-yield-farming_bsc-testnet
($ truffle test ./test/test-bsc/NFTYieldFarmingOnBSC.test.js --network bsc_testnet)
```

<br>

### ④ Script
- Execute script of the smart-contracts on the BSC testnet (with `truffle exec` command)
```
$ npm run script:nft-yield-farming_bsc-testnet
($ truffle exec ./scripts/script-bsc/NFTYieldFarmingOnBSC.script.js --network bsc_testnet)
```

<br>

***

## 【References】
- BSC
  - Getting Started with BSC:
    https://binancex.dev/blog.html?p=making-the-move-from-ethereum-to-bsc
  - BSC blockchain explorer
https://explorer.binance.org/smart-testnet
  - BSC testnet faucet
https://testnet.binance.org/faucet-smart
  - BSC smart contract IDE
http://remix.ethereum.org/#optimize=false&runs=200&evmVersion=null&version=soljson-v0.7.4+commit.3f05b770.js
  - BSC development ecosystem and tools
https://github.com/binance-chain/bsc-develop-ecosystem/
  - BSC FAQ
https://docs.google.com/document/d/1JF_P-AokXhSe38bNqLTNhlhKIu0JrcNRVReGdoBA-0o/edit?usp=sharing

<br>

- BSC
  - BEP20Token.template: 
    https://github.com/binance-chain/bsc-genesis-contract/blob/master/contracts/bep20_template/BEP20Token.template
  
<br>

- BSC RPC Endpoints:  
  https://docs.binance.org/smart-chain/developer/rpc.html
