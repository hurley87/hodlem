'use client';
import { PrivyProvider, addRpcUrlOverrideToChain } from '@privy-io/react-auth';
import { rpc } from '@/constants/rpc';
import { chain } from '@/constants/chain';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function PrivyWrapper({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID as string;
  const chainOverride = addRpcUrlOverrideToChain(chain, rpc);
  const createProfile = useMutation(api.profiles.create);

  const createProfileIfNotExists = async (user: any) => {
    if (!user) return;
    const username = user.username || ('' as string);
    const pfp = user.pfp as string;
    const displayName = user.displayName as string;
    const bio = user.bio as string;
    const fid = user.fid as number;
    const ownerAddress = user.ownerAddress as string;
    const address = user.wallet?.address as `0x${string}`;

    if (user) {
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
  };

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        supportedChains: [chainOverride],
      }}
      onSuccess={(user) => createProfileIfNotExists(user)}
    >
      {children}
    </PrivyProvider>
  );
}

export default PrivyWrapper;
