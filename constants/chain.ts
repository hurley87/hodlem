import { base, baseSepolia } from 'viem/chains';

export const chain = process.env.NODE_ENV === 'production' ? base : baseSepolia;
