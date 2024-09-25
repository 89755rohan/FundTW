const fund = artifacts.require("Funder");

module.exports = function (deployer) {
  deployer.deploy(fund);
};
