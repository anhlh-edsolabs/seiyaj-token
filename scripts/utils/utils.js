const { ethers } = require("ethers");
const defaultAbiCoder = ethers.AbiCoder.defaultAbiCoder();

/**
 * Compute the ERC7201 storage namespace hash
 * Formula: keccak256(abi.encode(uint256(keccak256("namespaceId")) - 1)) & ~bytes32(uint256(0xff))
 * @param {string} namespaceId
 * @returns {string} ERC7201 storage namespace hash as a bytes32 hex string
 */
function erc7201(namespaceId) {
    return ethers.toQuantity(
        BigInt(
            ethers.keccak256(
                defaultAbiCoder().encode(
                    ["uint256"],
                    [
                        BigInt(
                            ethers.keccak256(
                                ethers.hexlify(ethers.toUtf8Bytes(namespaceId)),
                            ),
                        ) - 1n,
                    ],
                ),
            ),
        ) &
            (~BigInt("0xff") & ethers.MaxUint256),
    );
}

module.exports = { erc7201 };
