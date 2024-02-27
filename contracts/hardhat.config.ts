import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

require('dotenv').config();

const config: HardhatUserConfig = {
  solidity: '0.8.24',
  networks: {
    'base-sepolia': {
      chainId: 84532,
      url: 'https://sepolia.base.org',
      accounts: [process.env.PRIVATE_KEY as string],
    },
    'base-mainnet': {
      chainId: 8453,
      url: 'https://mainnet.base.org',
      accounts: [process.env.PRIVATE_KEY as string],
    },
  },
};

export default config;
