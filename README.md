# Seiyaj Token Smart Contract

This project contains the smart contract for the Seiyaj Token, a simple fungible token that implements the ERC20 standard, and additional functionalities such as `whitelisted traders` and `dividend paying`. The token is deployed on the Sepolia testnet of Ethereum network and is used for testing purposes.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js
- Yarn

### Installing

1. Clone the repository

    ```sh
    git clone https://github.com/anhlh-edsolabs/seiyaj-token.git
    cd seiyaj-token
    ```

2. Initialize the project

    ```sh
    ./init.sh
    ```

3. Update the environment parameters in `.env` file in the project's root directory with the desired values. The following parameters are required:

    ```sh
    DEPLOYER_PK_DEV=""
    DEPLOYER_DEV=""
    ETHERSCAN_API_KEY=""
    POLYGONSCAN_API_KEY=""
    COINMARKETCAP_API_KEY=""
    ```

## Running the tests

Run the tests with the following command:

```sh
yarn hardhat test --network hardhat
```

or simply run

```sh
 yarn test ./test/01_SeiyajToken_Dividend.test.js  
```

## Deployment

To deploy the contract on the local network, use the following command:

```sh
yarn deploy:local ./deployment/deploy/01_SeiyajToken.js
```

To deploy the contract on the sepolia network, use the following command:

```sh
yarn deploy:dev:sepolia ./deployment/deploy/01_SeiyajToken.js
```

For now the contract is deployed on the sepolia network as an Upgradeable contract with the following addresses:

- Proxy: [0xaDB3C1464C361eE55e993D8589EFF53a1707Bf3e](https://sepolia.etherscan.io/address/0xaDB3C1464C361eE55e993D8589EFF53a1707Bf3e)
- Implementation: [0xa9844332cd1e6bf702a3049c70dea1fb44f298c9](https://sepolia.etherscan.io/address/0xa9844332cd1e6bf702a3049c70dea1fb44f298c9)

## Built With

- Hardhat [https://hardhat.org/](https://hardhat.org/) - Development environment for Ethereum.
- OpenZeppelin [https://openzeppelin.com/](https://openzeppelin.com/) - Smart contract library.
- Ethers.js [https://docs.ethers.io/v5/](https://docs.ethers.io/v5/) - Ethereum library for blockchain and smart contract interaction.

## Author

Le Hoang Anh - [https://github.com/anhlh-edsolabs](https://github.com/anhlh-edsolabs)
<mr.khas@gmail.com>
