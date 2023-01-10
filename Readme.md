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

##Example Project Creation Scripts
#Disentanglement

npx hardhat CreateProject --studio 0x408b223EC52A5248d84DE22745A1B100875C3E28 --project-index 0 --network goerli

npx hardhat AddScripts --project-index 0 --project-id 1 --studio 0x408b223EC52A5248d84DE22745A1B100875C3E28 --network goerli

npx hardhat LockProject --project-id 1 --studio 0x408b223EC52A5248d84DE22745A1B100875C3E28 --network goerli

npx hardhat ScheduleAuction --project-index 0 --project-id 1 --studio 0x408b223EC52A5248d84DE22745A1B100875C3E28 --network goerli

