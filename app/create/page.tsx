'use client';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const { user } = usePrivy();
  const address = user?.wallet?.address as `0x${string}`;
  const createGame = useMutation(api.games.create);
  const router = useRouter();
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  const handleCreateGame = async () => {
    setIsCreatingGame(true);
    const gameId = await createGame({ creator: address });
    router.push(`/game/${gameId}`);
  };

  return (
    <div>
      <button disabled={isCreatingGame} onClick={handleCreateGame}>
        {isCreatingGame ? 'Creating game...' : 'Create game'}
      </button>
    </div>
  );
}
