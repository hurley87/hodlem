'use client';
import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import toast from 'react-hot-toast';

type Props = {
  id: Id<'hands'>;
  onchainId: string;
  resultMessage: string;
  winner: `0x${string}`;
};

function ClaimHand({ id, onchainId, resultMessage, winner }: Props) {
  const [isClaiming, setIsClaiming] = useState(false);
  const showOutput = useMutation(api.hands.showOutput);

  async function handleDealHand() {
    setIsClaiming(true);

    try {
      const resp = await fetch('/api/endHand', {
        method: 'POST',
        body: JSON.stringify({ onchainId, winner }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await resp.json();
      const hash = data.hash;

      await showOutput({
        id,
        hash,
      });

      toast.success('Hand settled');

      setIsClaiming(false);
    } catch (e) {
      toast.error('Error creating hand');
      setIsClaiming(false);
      return;
    }
  }

  return (
    <div>
      <p>{resultMessage}.</p>
      <button onClick={handleDealHand}>
        {isClaiming ? 'Claiming...' : 'Claim'}
      </button>
    </div>
  );
}

export default ClaimHand;
