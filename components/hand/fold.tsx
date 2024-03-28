'use client';
import { useState } from 'react';
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { useBroadcastEvent } from '@/liveblocks.config';

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
  const { toast } = useToast();
  const broadcast = useBroadcastEvent();

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

      toast({
        title: 'Hold folded',
        description: 'Start a new one',
      });

      broadcast({ type: 'TOAST', message: 'Hand folded' });

      setFoldingHard(false);
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Error folding hand',
        variant: 'destructive',
      });
      setFoldingHard(false);
      return;
    }
  };

  return (
    <Button disabled={foldingHand} onClick={handleFoldHand}>
      {foldingHand ? 'Folding...' : 'Fold'}
    </Button>
  );
}

export default FoldHand;
