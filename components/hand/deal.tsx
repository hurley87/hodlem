'use client';
import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

type Props = {
  id: Id<'hands'>;
  gameId: Id<'games'>;
};

function DealHead({ id, gameId }: Props) {
  const [isDealing, setIsDealing] = useState(false);
  const dealHand = useMutation(api.hands.deal);

  async function handleDealHand() {
    setIsDealing(true);

    await dealHand({
      id,
      gameId,
    });
  }

  return (
    <div>
      <button onClick={handleDealHand}>
        {isDealing ? 'Dealing...' : 'Deal hand'}
      </button>
    </div>
  );
}

export default DealHead;
