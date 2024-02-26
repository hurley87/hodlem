'use client';
import { api } from '@/convex/_generated/api';
import { usePrivy } from '@privy-io/react-auth';
import { useMutation } from 'convex/react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useBalance } from 'wagmi';

export default function Onboarding() {
  const { login, user, linkFarcaster, logout } = usePrivy();
  const address = user?.wallet?.address as `0x${string}`;
  const balance = useBalance({
    address,
    token: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
  });
  const farcasterProfile = user?.farcaster;

  const degen = Number(balance?.data?.value) * 0.000000000000000001;
  const degenReadable = degen.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const createProfile = useMutation(api.profiles.create);

  useEffect(() => {
    async function createProfileIfNotExists() {
      const username = farcasterProfile?.username as string;
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
    }
  }, [farcasterProfile]);

  return (
    <div>
      {!user && <button onClick={login}>Connect</button>}
      {user && !farcasterProfile && (
        <button onClick={linkFarcaster}>Link Your Farcaster account</button>
      )}
      {user && farcasterProfile && degen === 0 && (
        <div>
          <p>You have no degen</p>
          <Link
            href="https://app.uniswap.org/swap?outputCurrency=0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed&chain=base"
            target="_blank"
          >
            Buy some here
          </Link>
          <button onClick={logout}>Logout</button>
        </div>
      )}
      {user && farcasterProfile && degen > 0 && (
        <div>
          Connected with {degenReadable} $DEGEN.{' '}
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
}
