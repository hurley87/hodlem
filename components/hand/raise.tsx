'use client';
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { formatEther, parseEther } from 'viem';
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
import useRead from '@/hooks/useRead';
import useChain from '@/hooks/useChain';
import { useToast } from '../ui/use-toast';
import Link from 'next/link';
import { ToastAction } from '../ui/toast';
import { useBroadcastEvent } from '@/liveblocks.config';
import Switch from '../switch';

function RaiseHand({
  id,
  onchainId,
  betAmount,
  opposingStack,
  activeStack,
}: {
  id: Id<'hands'>;
  onchainId: string;
  betAmount: string;
  opposingStack: number;
  activeStack: number;
}) {
  const { user } = usePrivy();
  const [creatingBet, setCreatingBet] = useState(false);
  const address = user?.wallet?.address as `0x${string}`;
  const betHand = useMutation(api.hands.bet);
  const degen = useRead();
  const onchain = useChain({ address });
  const isRightChain = onchain?.isRightChain;
  const { toast } = useToast();
  const broadcast = useBroadcastEvent();

  const handleRaiseHand = async (raiseAmount: number) => {
    setCreatingBet(true);
    const betTotal = parseInt(betAmount) + raiseAmount;
    const totalBetAmount = parseEther(betTotal.toString());

    if (isNaN(raiseAmount) || raiseAmount < Number(betAmount)) {
      toast({
        title: 'Error',
        description: 'You must raise more than the original bet',
        variant: 'destructive',
      });
      setCreatingBet(false);
      return;
    }

    const bigBlindAllowance = await degen?.getAllowance(address);

    if (bigBlindAllowance < totalBetAmount) {
      toast({
        title: 'Error',
        description: 'You do not have enough allowance to make this bet',
        variant: 'destructive',
      });
      return;
    }

    if (Number(betAmount) > opposingStack) {
      toast({
        title: 'Error',
        description: `The max bet is ${opposingStack} $DEGEN`,
        variant: 'destructive',
      });
      return;
    }

    try {
      const receipt = await onchain?.bet({
        onchainId,
        betAmount: formatEther(totalBetAmount),
      });

      toast({
        title: 'Success',
        description: 'Bet made onchain',
        action: (
          <Link
            target="_blank"
            href={`https://basescan.org/tx/${receipt?.transactionHash}`}
          >
            <ToastAction altText="Try again">View transaction</ToastAction>
          </Link>
        ),
      });

      await betHand({
        id,
        betAmount: Number(raiseAmount),
        player: address,
      });

      broadcast({ type: 'TOAST', message: 'Bet raised' });

      setCreatingBet(false);
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Error raising hand',
        variant: 'destructive',
      });
      setCreatingBet(false);
      return;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Raise</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Place a bet</DialogTitle>
          <DialogDescription>
            Call {betAmount} and raise at least {betAmount} more
          </DialogDescription>
        </DialogHeader>
        {!isRightChain ? (
          <Switch wallet={onchain?.wallet} />
        ) : (
          <CreateHandForm
            handleCreateHand={handleRaiseHand}
            creatingHand={creatingBet}
            opposingStack={opposingStack}
            activeStack={activeStack as number}
            raiseAmount={Number(betAmount)}
            isRaise={true}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default RaiseHand;
