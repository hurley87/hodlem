'use client';
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import useChain from '@/hooks/useChain';
import { useToast } from '../ui/use-toast';
import Link from 'next/link';
import { ToastAction } from '../ui/toast';

function CancelHand({
  gameId,
  id,
  onchainId,
}: {
  gameId: Id<'games'>;
  id: Id<'hands'>;
  onchainId: string;
}) {
  const { user } = usePrivy();
  const address = user?.wallet?.address as `0x${string}`;
  const [isCancelling, setIsCancelling] = useState(false);
  const cancelHand = useMutation(api.hands.cancel);
  const swap = useMutation(api.games.swap);
  const onchain = useChain({ address });

  async function handleCancelHand() {
    setIsCancelling(true);
    const { toast } = useToast();

    try {
      const receipt = await onchain?.cancel({
        onchainId,
      });

      await cancelHand({
        id,
      });

      await swap({
        id: gameId,
        currentBigBlind: address,
      });

      toast({
        title: 'Success',
        description: 'Hand cancelled',
        action: (
          <Link
            target="_blank"
            href={`https://basescan.org/tx/${receipt?.transactionHash}`}
          >
            <ToastAction altText="Try again">View transaction</ToastAction>
          </Link>
        ),
      });

      setIsCancelling(false);
    } catch {
      toast({
        title: 'Error',
        description: `Error cancelling hand`,
        variant: 'destructive',
      });
      setIsCancelling(false);
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardDescription>
          Waiting on the small blind to buy-in ...
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleCancelHand} className="w-full">
          {isCancelling ? 'Cancelling...' : 'Cancel hand'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default CancelHand;
