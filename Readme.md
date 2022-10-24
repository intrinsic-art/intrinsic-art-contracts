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

Split Terminal: Create A project
```shell
npx hardhat AddProject  
--coloring-book "Input Address" 
--network localhost
```

npx hardhat CreateProject2 --studio 0xC9E78295F6805fb1608Fc2DD9fAa5a504b407B00 --network goerli

npx hardhat AddScript2 --studio 0xC9E78295F6805fb1608Fc2DD9fAa5a504b407B00 --project 14 --network goerli


npx hardhat CreateProject --studio 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 --network localhost

npx hardhat AddScript --studio 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 --project 1 --network localhost

npx hardhat MintWeth --weth-address 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707 --weth-recipient 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --weth-amount 1000000000000000000000 --network localhost 
