# NFT Yield Farming on BSC

***
## 【Introduction of the NFT Yield Farming on BSC】
- This is a smart contract that ...

&nbsp;

***

## 【Workflow】
- Diagram / Workflow

&nbsp;

***

## 【Remarks】
- Version
  - Solidity (Solc): v0.6.12
  - Truffle: v5.1.60
  - web3.js: v1.2.9
  - openzeppelin-solidity: v3.2.0
  - ganache-cli: v6.9.1 (ganache-core: 2.10.2)


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
- 1: Migrate on local
```
$ npm run migrate:local
```

- 2: Migrate on BSC testnet
```
$ npm run migrate:bsc_testnet
```


<br>

### ③ Test
- 1: Start ganache-cli
```
$ ganache-cli -d
```
(※ `-d` option is the option in order to be able to use same address on Ganache-CLI every time)

<br>

- 2: Execute test of the smart-contracts (on the local)
  - Test for the contract
    - `$ npm run test:nft-yield-farming`
       ($ truffle test ./test/test-local/NFTYieldFarming.test.js)

<br>

- 3: Execute test of the smart-contracts (on the BSC testnet)
    - `$ npm run test:nft-yield-farming_bsc-testnet`
       ($ truffle test ./test/test-bsc/NFTYieldFarmingOnBSC.test.js --network bsc_testnet)

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
