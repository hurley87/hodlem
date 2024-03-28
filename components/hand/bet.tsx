'use client';
import { useToast } from '@/components/ui/use-toast';
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import CreateHandForm from './create-form';
import useChain from '@/hooks/useChain';
import { ToastAction } from '../ui/toast';
import Link from 'next/link';
import { useBroadcastEvent } from '@/liveblocks.config';

function BetHand({
  id,
  onchainId,
  activeStack,
  opposingStack,
}: {
  id: Id<'hands'>;
  onchainId: string;
  activeStack: number | undefined;
  opposingStack: number | undefined;
}) {
  const { user } = usePrivy();
  const [creatingBet, setCreatingBet] = useState(false);
  const address = user?.wallet?.address as `0x${string}`;
  const saveBet = useMutation(api.hands.bet);
  const onchain = useChain({ address });

  const broadcast = useBroadcastEvent();
  const { toast } = useToast();

  const handleBetHand = async (betAmount: number) => {
    setCreatingBet(true);

    if (isNaN(betAmount) || betAmount < 100) {
      toast({
        title: 'Error',
        description: "Your bet can't be less than 100",
        variant: 'destructive',
      });
      setCreatingBet(false);
      return;
    }

    if (betAmount > (activeStack || 0)) {
      toast({
        title: 'Error',
        description: 'Your stack isnt big enough for this bet',
        variant: 'destructive',
      });
      setCreatingBet(false);
      return;
    }

    if (betAmount > (opposingStack || 0)) {
      toast({
        title: 'Error',
        description: `The max bet is ${opposingStack} $DEGEN`,
        variant: 'destructive',
      });
      setCreatingBet(false);
      return;
    }

    try {
      const recepit = await onchain?.bet({
        onchainId,
        betAmount: betAmount.toString(),
      });

      await saveBet({
        id,
        betAmount: Number(betAmount),
        player: address,
      });

      toast({
        title: 'Success',
        description: 'Bet placed onchain',
        action: (
          <Link
            target="_blank"
            href={`https://basescan.org/tx/${recepit?.transactionHash}`}
          >
            <ToastAction altText="Try again">View transaction</ToastAction>
          </Link>
        ),
      });

      broadcast({ type: 'TOAST', message: 'Bet made' });

      setCreatingBet(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Error creating bet',
        variant: 'destructive',
      });
      setCreatingBet(false);
      return;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Bet</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Place a bet</DialogTitle>
          <DialogDescription>Use slider to make your bet</DialogDescription>
        </DialogHeader>
        <CreateHandForm
          handleCreateHand={handleBetHand}
          creatingHand={creatingBet}
          opposingStack={opposingStack as number}
          activeStack={activeStack as number}
        />
      </DialogContent>
    </Dialog>
  );
}

export default BetHand;
