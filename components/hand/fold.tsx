'use client';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';

function FoldHand({
  id,
  onchainId,
  winner,
}: {
  id: Id<'hands'>;
  onchainId: string;
  winner: `0x${string}`;
}) {
  const [foldingHand, setFoldingHard] = useState(false);
  const foldHand = useMutation(api.hands.fold);

  const handleFoldHand = async () => {
    setFoldingHard(true);

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

      await foldHand({
        id,
        hash,
      });

      toast.success('Hand folded');

      setFoldingHard(false);
    } catch (e) {
      toast.error('Error creating hand');
      setFoldingHard(false);
      return;
    }
  };

  return (
    <>
      <p>
        <button onClick={handleFoldHand}>
          {foldingHand ? 'Folding...' : 'Fold'}
        </button>
      </p>
    </>
  );
}

export default FoldHand;
