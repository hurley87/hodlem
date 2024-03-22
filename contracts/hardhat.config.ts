import '@nomicfoundation/hardhat-toolbox';

require('dotenv').config();

const base = process.env.ETHERSCAN_API_KEY as string;

const config = {
  solidity: '0.8.24',
  networks: {
    'base-sepolia': {
      chainId: 84532,
      url: 'https://sepolia.base.org',
      accounts: [process.env.PRIVATE_KEY as string],
      verify: {
        etherscan: {
          apiUrl: 'https://api-sepolia.basescan.org/api',
          apiKey: 'EIUT11GJNRMS8Y3165KJ86FM1YM67QYX86',
        },
      },
    },
    'base-mainnet': {
      chainId: 8453,
      url: 'https://mainnet.base.org',
      accounts: [process.env.PRIVATE_KEY as string],
    },
  },
  etherscan: {
    apiKey: {
      base: '116GHSKUETSDERY78Y9D6R4NP6G5P2FIIT',
    },
  },
};

export default config;
