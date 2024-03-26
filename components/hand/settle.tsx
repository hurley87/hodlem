'use client';
import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';

type Props = {
  id: Id<'hands'>;
  onchainId: string;
  resultMessage: string;
};

function SettleHand({ id, onchainId }: Props) {
  const [isSettling, setIsSettling] = useState(false);
  const showOutput = useMutation(api.hands.showOutput);
  const { toast } = useToast();

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

      toast({
        title: 'Success',
        description: 'Hand settled',
      });

      setIsSettling(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Error settling hand',
        variant: 'destructive',
      });
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
