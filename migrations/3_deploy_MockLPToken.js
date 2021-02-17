const MockLPToken = artifacts.require("MockLPToken");

module.exports = async function(deployer) {
    await deployer.deploy(MockLPToken);
};
