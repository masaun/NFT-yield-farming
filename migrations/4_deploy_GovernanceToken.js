const GovernanceToken = artifacts.require("GovernanceToken");

module.exports = async function(deployer) {
    await deployer.deploy(GovernanceToken);
};
