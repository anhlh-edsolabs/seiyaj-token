const { util } = require("chai");
const {
    ENV_KEY,
    RPC_URL,
    DEPLOYER_PK,
    DEPLOYER_ADDR,
    Provider,
    Deployer,
    DeploymentStorage,
    CoinBase,
} = require("./env");
const { erc7201 } = require("./utils");

const { log } = require("console");

module.exports = {
    log,
    utils: { erc7201 },
    ENV_KEY,
    RPC_URL,
    DEPLOYER_PK,
    DEPLOYER_ADDR,
    Provider,
    Deployer,
    DeploymentStorage,
    CoinBase,
};
