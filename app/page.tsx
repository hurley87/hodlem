'use client';

import Onboarding from '@/components/onboarding';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { usePrivy } from '@privy-io/react-auth';

export default function Home() {
  const { user, ready, logout } = usePrivy();
  const address = user?.wallet?.address as `0x${string}`;
  const profile = useQuery(api.profiles.getByAddress, {
    address,
  });

  if (!ready) {
    return <div>Loading...</div>;
  }

  if (profile)
    return (
      <div>
        <p>{profile.username}</p>
        <button onClick={logout}>Logout</button>
      </div>
    );

  return <Onboarding />;
}
