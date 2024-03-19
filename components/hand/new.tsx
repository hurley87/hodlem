'use client';
import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import toast from 'react-hot-toast';

type Props = {
  id: Id<'hands'>;
};

function NewHand({ id }: Props) {
  const [isClaiming, setIsClaiming] = useState(false);
  const newHand = useMutation(api.hands.newHand);

  async function handleNewHand() {
    setIsClaiming(true);

    try {
      await newHand({
        id,
      });

      setIsClaiming(false);
    } catch (e) {
      toast.error('Error creating hand');
      setIsClaiming(false);
      return;
    }
  }

  return (
    <div>
      <button onClick={handleNewHand}>
        {isClaiming ? 'Starting...' : 'Start new hand'}
      </button>
    </div>
  );
}

export default NewHand;
