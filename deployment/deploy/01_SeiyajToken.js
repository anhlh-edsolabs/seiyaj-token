const { DeployHelper, DEPLOYER_ADDR } = require("../utils");

async function main() {
	const CONTRACT_NAME = "SeiyajToken";
	const INITIAL_ADMIN = DEPLOYER_ADDR;
	const INITIALIZATION_ARGS = [
		INITIAL_ADMIN,
		INITIAL_ADMIN,
		INITIAL_ADMIN,
		INITIAL_ADMIN,
		INITIAL_ADMIN,
	];
	const IMPL_CONSTRUCTOR_ARGS = [];

	await DeployHelper.deploy(
		CONTRACT_NAME,
		INITIALIZATION_ARGS,
		true,
		IMPL_CONSTRUCTOR_ARGS,
	);
}

main()
	.then(() => {})
	.catch((error) => {
		console.error(("Error:", error));
		process.exit(1);
	});
