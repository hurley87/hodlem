'use client';
import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';

type Props = {
  id: Id<'hands'>;
  onchainId: string;
  resultMessage: string;
};

function SettleHand({ id, onchainId }: Props) {
  const [isSettling, setIsSettling] = useState(false);
  const showOutput = useMutation(api.hands.showOutput);

  async function handleDealHand() {
    setIsSettling(true);

    try {
      const resp = await fetch('/api/settleDraw', {
        method: 'POST',
        body: JSON.stringify({ onchainId }),
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

      setIsSettling(false);
    } catch {
      toast.error('Error creating hand');
      setIsSettling(false);
      return;
    }
  }

  return (
    <Button onClick={handleDealHand}>
      {isSettling ? 'Settling...' : 'Settle hand'}
    </Button>
  );
}

export default SettleHand;
