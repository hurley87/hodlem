'use client';
import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '../ui/button';

type Props = {
  id: Id<'hands'>;
};

function RevealHand({ id }: Props) {
  const [isRevealing, setIsRevealing] = useState(false);

  const determineWinner = useMutation(api.hands.determineWinner);

  async function handleRevealHand() {
    setIsRevealing(true);
    await determineWinner({ id });
  }

  return (
    <Button onClick={handleRevealHand}>
      {isRevealing ? 'Finishing...' : 'Finish hand'}
    </Button>
  );
}

export default RevealHand;
