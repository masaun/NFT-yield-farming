# NFT Yield Farming on BSC

***
## 【Introduction of the NFT Yield Farming on BSC】
- This is a smart contract that enable a user to farm yield by staking LP tokens (BEP20) into a NFT pool.
  - Once a user stake LP tokens into a NFT pool, reward token (Governance Token) are mined every block.
  - User who staked can receive the Governance Tokens as rewards (as farmed-yield) when that user un-stake.
- This smart contract works on BSC (Binance Smart Chain).

&nbsp;

***

## 【Workflow】
- Diagram / Workflow  
![【Diagram】NFT Yield Farming on BSC](https://user-images.githubusercontent.com/19357502/108629603-1888a900-74a4-11eb-9337-581f757d7b4c.jpg)

&nbsp;

***

## 【Setup】
### ① Install modules
- Install npm modules in the root directory
```
$ npm install
```

<br>

### ② Add `.env` to the root directory.
- Please copy code of `.env.example` into your `.env` 
  (Then, please input your information of wallets, private keys, etc... by following code of `.env.example` )
https://github.com/masaun/NFT-yield-farming/blob/main/.env.example  

<br>

### ③ Compile contracts (on BSC testnet)
```
$ npm run compile:bsc-testnet
```

<br>

### ④ Test
- Execute test of the smart-contracts (on the BSC testnet)
  - [Note]: Sometime, timeout happen on this test. So I recommend that you try `⑤ Script` below instead of this test.   
```
$ npm run test:nft-yield-farming_bsc-testnet
($ truffle test ./test/test-bsc/NFTYieldFarmingOnBSC.test.js --network bsc_testnet)
```

<br>

### ⑤ Script
- Execute script of the smart-contracts on the BSC testnet (with `truffle exec` command)
```
$ npm run script:nft-yield-farming_bsc-testnet
($ truffle exec ./scripts/script-bsc/NFTYieldFarmingOnBSC.script.js --network bsc_testnet)
```
(※ Note: In advance, please check whether your deployer' wallet address on BSC testnet has enough BNB balance or not)


&nbsp;

***

## 【Remarks】
- When 503 Error happen, please select a new `BSC RPC Endpoints` to change by referencing the list below
https://docs.binance.org/smart-chain/developer/rpc.html
![Screen Shot 2021-02-21 at 08 44 38](https://user-images.githubusercontent.com/19357502/108611369-64463e80-7421-11eb-9e56-166a3321ca22.png)
↓
- Then, please replace `BSC RPC Endpoints` for 2 files below.
  - truffle-config.js
    https://github.com/masaun/NFT-yield-farming/blob/main/truffle-config.js#L9
  - NFTYieldFarmingOnBSC.script.js
    https://github.com/masaun/NFT-yield-farming/blob/main/scripts/script-bsc/NFTYieldFarmingOnBSC.script.js#L5

<br>

- Governance Token
  - At the moment, Governance Token is used as a reward token.
  - Although it has not implemented yet, I will implement Governance Token for governance strucure (e.g. Governance Token holders can vote, etc...) in the future.

<br>

- LP tokens
  - LP token is created by BEP20.
  - Assuming LP tokens is a pair between the Governance Token and BNB. 
  - But, pool to create this pair (LP tokens) has not been implemented yet. (at the mement)

<br>

- Version
  - Solidity (Solc): v0.6.12
  - Truffle: v5.1.60
  - web3.js: v1.2.9
  - openzeppelin-solidity: v3.2.0


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
