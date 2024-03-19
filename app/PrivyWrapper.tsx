'use client';
import { PrivyProvider, addRpcUrlOverrideToChain } from '@privy-io/react-auth';
import { rpc } from '@/constants/rpc';
import { chain } from '@/constants/chain';

function PrivyWrapper({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID as string;
  const chainOverride = addRpcUrlOverrideToChain(chain, rpc);

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
    >
      {children}
    </PrivyProvider>
  );
}

export default PrivyWrapper;
