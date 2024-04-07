'use client';
import { usePrivy } from '@privy-io/react-auth';
import ConnectWallet from '@/components/onboarding/connect';
import LinkFarcaster from '@/components/onboarding/link';
import FundAccount from '@/components/onboarding/fund';
import Loading from '@/components/loading';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEffect, useState } from 'react';
import { createPublicClient, formatEther, http } from 'viem';
import { chain } from '@/constants/chain';
import Degen from '@/hooks/abis/Degen.json';

function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  const { user, ready } = usePrivy();
  const address = user?.wallet?.address as `0x${string}`;
  const degenContract = process.env.NEXT_PUBLIC_DEGEN_CONTRACT as `0x${string}`;
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });
  const update = useMutation(api.profiles.update);
  const create = useMutation(api.profiles.create);
  const profile = useQuery(api.profiles.getProfileUsingAddress, {
    address,
  });
  const hasFarcasterLinked = user?.farcaster;
  const [balance, setBalance] = useState<any>(null);

  useEffect(() => {
    const updateProfileWithFarcaster = async (user: any) => {
      const farcaster = user?.farcaster;
      const username = farcaster?.username || ('' as string);
      const pfp = farcaster?.pfp as string;
      const displayName = farcaster?.displayName as string;
      const bio = farcaster?.bio as string;
      const fid = farcaster?.fid as number;
      const ownerAddress = farcaster?.ownerAddress as string;

      await update({
        address: user.wallet?.address as string,
        bio,
        displayName,
        fid,
        ownerAddress,
        pfp,
        username,
      });
    };

    const createProfile = async () => {
      await create({
        address,
      });
    };

    const fetchBalance = async () => {
      let _balance = (await publicClient.readContract({
        address: degenContract,
        abi: Degen.abi,
        functionName: 'balanceOf',
        args: [address],
      })) as bigint;
      setBalance(parseInt(formatEther(_balance)));
    };

    if (address) {
      createProfile();
      fetchBalance();
    }
    if (user && hasFarcasterLinked) updateProfileWithFarcaster(user);
  }, [user, profile]);

  if (!ready) {
    return <Loading />;
  }

  if (!user) return <ConnectWallet />;

  if (!hasFarcasterLinked) return <LinkFarcaster />;

  if (balance && balance === 0) return <FundAccount />;

  return <div>{children}</div>;
}

export default OnboardingWrapper;
