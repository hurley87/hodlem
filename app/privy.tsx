'use client';
import { PrivyProvider } from '@privy-io/react-auth';
import { chain } from '@/constants/chain';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig } from '@privy-io/wagmi';
import { base, baseSepolia } from 'viem/chains';
import { http } from 'wagmi';
import { WagmiProvider } from '@privy-io/wagmi';

const config = createConfig({
  chains: [chain],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

function Privy({ children }: { children: React.ReactNode }) {
  const defaultChain = chain;
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID as string;
  const queryClient = new QueryClient();

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        defaultChain,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

export default Privy;