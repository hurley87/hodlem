'use client';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { createPublicClient, formatEther, http, parseEther } from 'viem';
import { chain } from '@/constants/chain';
import Degen from '@/hooks/abis/Degen.json';
import useWalletClient from '@/hooks/useWalletClient';
import toast from 'react-hot-toast';
import { Id } from '@/convex/_generated/dataModel';
import ConnectWallet from '@/components/onboarding/connect';
import LinkFarcaster from '@/components/onboarding/link';
import FundAccount from '@/components/onboarding/fund';
import Approve from '@/components/onboarding/approve';
import Loading from '@/components/loading';

function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  const { user, ready } = usePrivy();
  const address = user?.wallet?.address as `0x${string}`;
  const profile = useQuery(api.profiles.getByAddress, {
    address,
  });
  const [balance, setBalance] = useState<string>('');
  const [allowance, setAllowance] = useState<string | null>(null);
  const farcasterProfile = user?.farcaster;
  const createProfile = useMutation(api.profiles.create);
  const updateProfile = useMutation(api.profiles.update);
  const { wallets } = useWallets();
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });
  const wallet = wallets[0];
  const walletClient = useWalletClient({ chain, wallet });
  const hodlemContract = process.env
    .NEXT_PUBLIC_HODLEM_CONTRACT as `0x${string}`;
  const degenContract = process.env.NEXT_PUBLIC_DEGEN_CONTRACT as `0x${string}`;
  const [isApproving, setIsApproving] = useState(false);
  const [balanceChecked, setBalanceChecked] = useState(false);
  const [allowanceChecked, setAllowanceChecked] = useState(false);

  useEffect(() => {
    async function createProfileIfNotExists() {
      const username = farcasterProfile?.username || ('' as string);
      const pfp = farcasterProfile?.pfp as string;
      const displayName = farcasterProfile?.displayName as string;
      const bio = farcasterProfile?.bio as string;
      const fid = farcasterProfile?.fid as number;
      const ownerAddress = farcasterProfile?.ownerAddress as string;

      if (user && farcasterProfile) {
        await createProfile({
          address,
          username,
          pfp,
          displayName,
          bio,
          fid,
          ownerAddress,
        });
      }
    }
    if (farcasterProfile) {
      createProfileIfNotExists();
      if (!balanceChecked) {
        setDegenBalance();
        setBalanceChecked(true);
      }
      if (!allowanceChecked) {
        checkHodlemAllowance();
        setAllowanceChecked(true);
      }
    }

    if (address) {
      setDegenBalance();
      checkHodlemAllowance();
    }
    if (profile) handleUpdateProfile(profile._id, balance, allowance);
  }, [farcasterProfile, balance, profile]);

  const handleUpdateProfile = async (
    profileId: Id<'profiles'>,
    degen: string,
    allowance: string | null
  ) => {
    if (profileId && degen && allowance) {
      await updateProfile({
        id: profileId,
        degen,
        allowance,
      });
    }
  };

  const setDegenBalance = async () => {
    const result = await publicClient.readContract({
      address: degenContract,
      abi: Degen.abi,
      functionName: 'balanceOf',
      args: [address],
    });
    setBalance(formatEther(result as bigint));
  };

  const checkHodlemAllowance = async () => {
    const result = await publicClient.readContract({
      address: degenContract,
      abi: Degen.abi,
      functionName: 'allowance',
      args: [address, hodlemContract],
    });
    setAllowance(formatEther(result as bigint));
  };

  if (!ready && allowance) {
    return <Loading />;
  }

  const approveTokenAllowance = async () => {
    setIsApproving(true);
    const client = await walletClient;
    const abi = Degen.abi;

    try {
      const { request } = await publicClient.simulateContract({
        address: degenContract,
        abi,
        functionName: 'approve',
        args: [hodlemContract, parseEther(balance as string)],
        account: address as `0x${string}`,
      });

      const hash = (await client?.writeContract(
        request as any
      )) as `0x${string}`;

      await publicClient.waitForTransactionReceipt({
        hash,
      });

      checkHodlemAllowance();
      setIsApproving(false);
    } catch (e) {
      toast.error('Error approving token allowance');
      setIsApproving(false);
    }
  };

  return (
    <div className="md:pt-0">
      {/* user must connect their account */}
      {!user && <ConnectWallet />}

      {/* user must link their Farcaster account */}
      {user && !farcasterProfile && <LinkFarcaster />}

      {/* user must have DEGEN */}
      {user && farcasterProfile && balance === '0' && <FundAccount />}

      {/* user must allow Hodlem contract to transfer tokens */}
      {user &&
        farcasterProfile &&
        balance !== '0' &&
        allowance &&
        parseInt(allowance).toString() === '0' && (
          <Approve
            approveTokenAllowance={approveTokenAllowance}
            isApproving={isApproving}
          />
        )}

      {/* let user see page if they fit the requirements above */}
      {user &&
        farcasterProfile &&
        balance !== '0' &&
        allowance &&
        parseInt(allowance).toString() !== '0' &&
        children}
    </div>
  );
}

export default OnboardingWrapper;
