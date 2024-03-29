import { useEffect, useState } from 'react';
import { Address, createPublicClient, formatEther, http } from 'viem';
import { chain } from '@/constants/chain';
import Degen from '@/hooks/abis/Degen.json';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function useProfile({ address }: { address: Address }) {
  if (!address) return null;
  const degenContract = process.env.NEXT_PUBLIC_DEGEN_CONTRACT as `0x${string}`;
  const hodlemContract = process.env
    .NEXT_PUBLIC_HODLEM_CONTRACT as `0x${string}`;
  const [balance, setBalance] = useState<any>(0);
  const [allowance, setAllowance] = useState<any>(0);
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });
  const profile = useQuery(api.profiles.getProfileUsingAddress, {
    address,
  });

  useEffect(() => {
    const fetchBalance = async () => {
      let _balance = (await publicClient.readContract({
        address: degenContract,
        abi: Degen.abi,
        functionName: 'balanceOf',
        args: [address],
      })) as bigint;
      setBalance(parseInt(formatEther(_balance)));
    };
    const fetchAllowance = async () => {
      let _allowance = (await publicClient.readContract({
        address: degenContract,
        abi: Degen.abi,
        functionName: 'allowance',
        args: [address, hodlemContract],
      })) as bigint;
      setAllowance(parseInt(formatEther(_allowance)));
    };
    fetchBalance();
    fetchAllowance();
  }, [address]);

  return {
    ...profile,
    balance,
    allowance,
  };
}
