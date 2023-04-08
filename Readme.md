
## Example Project Creation Scripts
Deploy the contracts
```shell
npx hardhat deploy --network goerli
```
Deploy project contracts, verify on Etherscan, and setup configuration
```shell
npx hardhat CreateProject --project-index 0 --network goerli
```



## Local Setup & Testing

Clone the repository:
```shell
git clone ...
```

Lookup the recommended Node version to use in the .nvmrc file and install and use the correct version:
```shell
nvm install 
nvm use
```

Install necessary dependencies:
```shell
npm install
```

Compile contracts to create typechain files:
```shell
npm run compile
```

Run the tests
```shell
npm run test
```

Deploy System 
```shell
npx hardhat node
```

