const MockNFTToken = artifacts.require("MockNFTToken");

module.exports = async function(deployer) {
    await deployer.deploy(MockNFTToken);
};
