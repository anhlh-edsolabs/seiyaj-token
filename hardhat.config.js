require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("@nomiclabs/hardhat-solhint");
require("@openzeppelin/hardhat-upgrades");

require("solidity-coverage");
require("hardhat-contract-sizer");
require("hardhat-gas-reporter");
require("hardhat-extended-tasks");

const {
	RPC_URL,
	DEPLOYER_ADDR,
	DEPLOYER_PK,
	CoinBase,
	log,
} = require("./scripts/utils");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
	const accounts = await hre.ethers.getSigners();

	for (const account of accounts) {
		console.log(account.address);
	}
});

task("balance", "Prints an account's balance")
	.addParam("account", "The account's address")
	.setAction(async (taskArgs, hre) => {
		const balance = await ethers.provider.getBalance(taskArgs.account);

		console.log(ethers.utils.formatEther(balance), await CoinBase());
	});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	defaultNetwork: "hardhat",
	networks: {
		hardhat: {
			accounts: {
				count: 100,
			},
		},
		sepolia: {
			url: process.env.RPC_PROVIDER_DEV,
			chainId: 11155111,
			accounts: [DEPLOYER_PK],
			from: DEPLOYER_ADDR,
		},
	},
	etherscan: {
		apiKey: {
			mainnet: process.env.ETHERSCAN_API_KEY,
			sepolia: process.env.ETHERSCAN_API_KEY,
		},
	},
	solidity: {
		version: "0.8.20",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	mocha: {
		timeout: 600000,
	},
	contractSizer: {
		alphaSort: true,
		disambiguatePaths: true,
		runOnCompile: false,
		strict: true,
	},
    sourcify: {
        enabled: false,
    },
};
