export const rpc =
  process.env.NODE_ENV === 'production'
    ? 'https://mainnet.base.org'
    : 'https://sepolia.base.org';
