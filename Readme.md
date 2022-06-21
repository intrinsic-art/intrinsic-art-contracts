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
