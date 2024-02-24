'use client';

import { PrivyProvider, User as PrivyUser } from '@privy-io/react-auth';
import { track } from '@vercel/analytics';
import { chain } from '@/constants/chain';

function Privy({ children }: { children: React.ReactNode }) {
  const defaultChain = chain;
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID as string;

  const handleLogin = async (user: PrivyUser) => {
    if (!user.wallet) throw new Error('No wallet found from Privy context.');

    track('User Login', {
      user_id: user.wallet.address,
    });
  };

  return (
    <PrivyProvider
      appId={appId}
      onSuccess={handleLogin}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: 'https://www.seedclub.xyz/etf-lg-white.svg',
        },
        legal: {
          termsAndConditionsUrl: 'https://www.seedclub.xyz/',
          privacyPolicyUrl: 'https://www.seedclub.xyz/',
        },
        defaultChain,
      }}
    >
      {children}
    </PrivyProvider>
  );
}

export default Privy;
