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
  winner: `0x${string}`;
};

function ClaimHand({ id, onchainId, resultMessage, winner }: Props) {
  const [isClaiming, setIsClaiming] = useState(false);
  const showOutput = useMutation(api.hands.showOutput);
  const { toast } = useToast();

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

      toast({
        title: 'Congrats!',
        description: 'You won the hand',
      });

      setIsClaiming(false);
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Error with claim',
        variant: 'destructive',
      });
      setIsClaiming(false);
      return;
    }
  }

  return (
    <Button disabled={isClaiming} onClick={handleDealHand}>
      {isClaiming ? 'Claiming...' : 'Claim'}
    </Button>
  );
}

export default ClaimHand;
