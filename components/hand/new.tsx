'use client';
import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';

type Props = {
  id: Id<'hands'>;
};

function NewHand({ id }: Props) {
  const [isClaiming, setIsClaiming] = useState(false);
  const newHand = useMutation(api.hands.newHand);
  const { toast } = useToast();

  async function handleNewHand() {
    setIsClaiming(true);

    try {
      await newHand({
        id,
      });

      setIsClaiming(false);
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Error starting new hand',
        variant: 'destructive',
      });

      setIsClaiming(false);
      return;
    }
  }

  return (
    <Button onClick={handleNewHand}>
      {isClaiming ? 'Starting...' : 'Start new hand'}
    </Button>
  );
}

export default NewHand;
