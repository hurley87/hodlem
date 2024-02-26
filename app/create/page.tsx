'use client';

import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user } = usePrivy();
  const address = user?.wallet?.address as `0x${string}`;
  const createGame = useMutation(api.games.create);
  const router = useRouter();

  const handleCreateGame = async () => {
    const gameId = await createGame({ creator: address });
    router.push(`/game/${gameId}`);
  };

  return (
    <div>
      <button onClick={handleCreateGame}>Create game</button>
    </div>
  );
}
