'use client';
import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

type Props = {
  id: Id<'hands'>;
  gameId: Id<'games'>;
};

function RevealHand({ id }: Props) {
  const [isRevealing, setIsRevealing] = useState(false);

  const determineWinner = useMutation(api.hands.determineWinner);

  async function handleRevealHand() {
    setIsRevealing(true);
    await determineWinner({ id });
  }

  return (
    <div>
      <button onClick={handleRevealHand}>
        {isRevealing ? 'Revealing...' : 'Reveal hand'}
      </button>
    </div>
  );
}

export default RevealHand;
