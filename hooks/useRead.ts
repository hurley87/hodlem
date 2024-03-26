import { createPublicClient, http } from 'viem';
import { chain } from '@/constants/chain';
import Degen from './abis/Degen.json';

export default function useRead() {
  const degenContract = process.env.NEXT_PUBLIC_DEGEN_CONTRACT as `0x${string}`;
  const hodlemContract = process.env
    .NEXT_PUBLIC_HODLEM_CONTRACT as `0x${string}`;
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const getBalance = async (address: string) => {
    const balance = (await publicClient.readContract({
      address: degenContract,
      abi: Degen.abi,
      functionName: 'balanceOf',
      args: [address],
    })) as bigint;
    return balance;
  };

  const getAllowance = async (address: string) => {
    const allowance = (await publicClient.readContract({
      address: degenContract,
      abi: Degen.abi,
      functionName: 'allowance',
      args: [address, hodlemContract],
    })) as bigint;
    return allowance;
  };

  return {
    getBalance,
    getAllowance,
  };
}
