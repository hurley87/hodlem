'use client';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import OnboardingWrapper from './OnboardingWrapper';

export default function Home() {
  const { user, ready, logout } = usePrivy();
  const address = user?.wallet?.address as `0x${string}`;
  const games = useQuery(api.games.get, {
    address,
  });

  if (!ready) {
    return <div>Loading...</div>;
  }

  return (
    <OnboardingWrapper>
      <p>
        <Link href="/create">Create game</Link>
      </p>
      {games?.map((game: any) => (
        <div key={game._id}>
          <p>{game._id}</p>
          <Link href={`/game/${game._id}`}>
            <p>created by {game.bigBlind}</p>
          </Link>
        </div>
      ))}
      <button onClick={logout}>Logout</button>
    </OnboardingWrapper>
  );
}
