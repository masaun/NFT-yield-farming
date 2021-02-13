module.exports = {
    "Ropsten": {
        "ETH": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",    // ETH address
        "DAI": "0xaD6D458402F60fD3Bd25163575031ACDce07538D",    // DAI address on Ropsten（from Kyber）
        "TUSD": "0xB36938c51c4f67e5E1112eb11916ed70A772bD75",        
        "LINK": "0x20fE562d797A42Dcb3399062AE9546cd06f63280",
        "WBTC": "0xBde8bB00A7eF67007A96945B3a3621177B615C44",     /// WBTC address on Ropsten（from Compound）
        "cWBTC": "0x58145bc5407d63daf226e4870beeb744c588f149",    /// cWBTC address on Ropsten（from Compound）
        "cEther": "0xbe839b6d93e3ea47effcca1f27841c917a8794f3"     /// cEther address on Ropsten（from Compound）
    },
    "Kovan": {
        "General": {
            "DAI": "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa",     // DAI address on Kovan
        },
        "Aave": {  /// Aave Market contracts
            "DAIaave": "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD",  // Aave's DAI address on Kovan            
            "aDAI": "0x58AD4cB396411B691A9AAb6F74545b2C5217FE6a"  
        }
    }
}
