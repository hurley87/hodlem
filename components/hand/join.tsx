'use client';
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import useChain from '@/hooks/useChain';
import { useToast } from '../ui/use-toast';
import Link from 'next/link';
import { ToastAction } from '../ui/toast';

function JoinHand({
  id,
  onchainId,
  bigBlindBetTotal,
}: {
  id: Id<'hands'>;
  onchainId: string;
  bigBlindBetTotal: number;
}) {
  const { user } = usePrivy();
  const address = user?.wallet?.address as `0x${string}`;
  const [isJoining, setIsJoining] = useState(false);
  const join = useMutation(api.hands.join);
  const onchain = useChain({ address });
  const { toast } = useToast();

  async function handleJoin() {
    setIsJoining(true);

    try {
      const receipt = await onchain?.join({
        onchainId,
      });

      toast({
        title: 'Success',
        description: 'Hand joined onchain',
        action: (
          <Link
            target="_blank"
            href={`https://basescan.org/tx/${receipt?.transactionHash}`}
          >
            <ToastAction altText="Try again">View transaction</ToastAction>
          </Link>
        ),
      });

      await join({
        id,
        smallBlindBetTotal: bigBlindBetTotal,
      });

      setIsJoining(false);
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Error joining hand',
        variant: 'destructive',
      });
      setIsJoining(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardDescription>
          Accept the {bigBlindBetTotal} $DEGEN buy-in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleJoin} className="w-full">
          {isJoining ? 'Joining...' : 'Join hand'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default JoinHand;
