import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { Button } from './ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function GameCreate() {
  const { user } = usePrivy();
  const createGame = useMutation(api.games.create);
  const router = useRouter();
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  const handleCreateGame = async () => {
    setIsCreatingGame(true);
    const bigBlind = user?.wallet?.address as `0x${string}`;
    const gameId = await createGame({ bigBlind });
    router.push(`/game/${gameId}`);
  };

  return (
    <Button disabled={isCreatingGame} onClick={handleCreateGame}>
      {isCreatingGame ? 'Creating game...' : 'Create game'}
    </Button>
  );
}
