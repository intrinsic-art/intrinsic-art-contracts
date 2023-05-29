<img src="https://github.com/intrinsic-art/intrinsic-art-contracts/assets/84364476/37b040a5-6eef-41b2-8de5-ada1533ad855" alt="mypic" style="width:400px; height:80px"/>

## Smart Contracts Overview
The intrinsic.art NFT platform enables artists to define generative traits as fungible tokens (ERC-1155), and collectors to combine their favorite traits to purchase a unique, customized artwork (ERC-721). The smart contracts consist of three primary contracts which are outlined below.

### Artwork.sol
The Artwork contract implements the ERC-721 standard for representing the Artwork NFTs, and an instance is deployed per art project. These artwork tokens contain the underlying trait tokens which define the appearance of the generative art output. This contract stores the javascript generative art scripts that render the artwork in a web browser. This contract includes functions for creating these artwork tokens using trait tokens, and for decomposing the artwork into its corresponding traits.

### Traits.sol
The Traits contract implements the ERC-1155 standard for representing the Trait NFTs, and an instance is deployed per art project. These trait tokens contain a human readable name string that describes the trait, and also a value string that is injected into the generative art javascript code as an input to define the appearance of the artwork. This contract also includes functionality for a Dutch Auction, which is the mechanism used for the primary sales of the trait tokens.

### ProjectRegistry.sol
The Project Registry contract records the Artwork and Trait contract addresses that have been deployed for each new art project.

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


## Example Deployment & Project Creation Scripts
Deploy the contracts
```shell
npx hardhat deploy --network goerli
```
Deploy project contracts, verify on Etherscan, and setup configuration
```shell
npx hardhat CreateProject --project-index 0 --network goerli
```


## Test Coverage
```shell
npx hardhat coverage
```
