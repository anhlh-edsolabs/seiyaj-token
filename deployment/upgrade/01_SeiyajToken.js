const { DeployHelper } = require("../utils");

const CONTRACT_NAME = "SeiyajToken";
const IMPL_CONSTRUCTOR_ARGS = [];

async function main() {
    await DeployHelper.upgrade(
        CONTRACT_NAME,
        CONTRACT_NAME,
        IMPL_CONSTRUCTOR_ARGS,
    );
}

main()
    .then(() => {})
    .catch((error) => {
        console.error(("Error:", error));
        process.exit(1);
    });
