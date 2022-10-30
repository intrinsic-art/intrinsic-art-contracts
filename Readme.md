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

npx hardhat CreateProject --studio 0xadFf6fe91B7A102682dC2375b503dA94497F5C42 --network sepolia

npx hardhat AddScript --studio 0xadFf6fe91B7A102682dC2375b503dA94497F5C42 --project 1 --network sepolia

npx hardhat CreateProject --studio 0x1Ab03C2Ea5ec287113216f234B6C5C8B8cBcA08E --network goerli

npx hardhat AddScript2 --studio 0x1Ab03C2Ea5ec287113216f234B6C5C8B8cBcA08E --project 14 --network goerli

 npx hardhat verify --network goerli 0x1Ab03C2Ea5ec287113216f234B6C5C8B8cBcA08E "0x7930DdA80157Fcc47ba9c3836398c82d89C16416" "0x05724ede0BC98e7ae9C3A757587692EcbCc47aA6" "0xadFf6fe91B7A102682dC2375b503dA94497F5C42" "1" "https://intrinsic.art"  

npx hardhat CreateProject --studio 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 --network localhost

npx hardhat AddScript --studio 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 --project 1 --network localhost

npx hardhat MintWeth --weth-address 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707 --weth-recipient 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --weth-amount 1000000000000000000000 --network localhost 
