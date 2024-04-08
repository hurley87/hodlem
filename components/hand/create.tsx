'use client';
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { formatEther, parseEventLogs } from 'viem';
import Hodlem from '@/hooks/abis/Hodlem.json';
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';
import { fetchQuery } from 'convex/nextjs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CreateHandForm from './create-form';
import useRead from '@/hooks/useRead';
import useChain from '@/hooks/useChain';
import { useToast } from '../ui/use-toast';
import Link from 'next/link';
import { ToastAction } from '../ui/toast';

function CreateHand({
  gameId,
  smallBlind,
}: {
  gameId: Id<'games'>;
  smallBlind: `0x${string}`;
}) {
  const { user } = usePrivy();
  const [creatingHand, setCreatingHand] = useState(false);
  const address = user?.wallet?.address as `0x${string}`;
  const createHand = useMutation(api.hands.create);
  const addSmallBlind = useMutation(api.games.addSmallBlind);
  const [allowMore, setAllowMore] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [isApproving, setIsApproving] = useState(false);
  const degen = useRead();
  const onchain = useChain({ address });
  const { toast } = useToast();

  const handleCreateHand = async (buyIn: number) => {
    const bigBlind = address;

    if (smallBlind === bigBlind) {
      toast({
        title: 'Error',
        description: 'You cannot play against yourself',
        variant: 'destructive',
      });
      return;
    }

    setCreatingHand(true);

    try {
      const smallBlindAllowance = await degen?.getAllowance(smallBlind);

      let smallBlindBalance = await degen?.getBalance(smallBlind);

      if (Number(smallBlindBalance) > Number(smallBlindAllowance))
        smallBlindBalance = smallBlindAllowance;

      const smallBlindStack = parseInt(
        formatEther(smallBlindBalance as bigint)
      );

      const bigBlindAllowance = await degen?.getAllowance(address);

      let bigBlindBlanace = await degen?.getBalance(address);

      setBalance(formatEther(bigBlindBlanace as bigint));

      if (
        Number(bigBlindAllowance) < buyIn &&
        Number(bigBlindBlanace) >= buyIn
      ) {
        setAllowMore(true);
        setCreatingHand(false);
        return;
      }

      if (Number(bigBlindBlanace) > Number(bigBlindAllowance))
        bigBlindBlanace = bigBlindAllowance;

      const bigBlindStack = parseInt(formatEther(bigBlindBlanace as bigint));

      if (smallBlindStack < buyIn) {
        toast({
          title: 'Error',
          description: 'Small blind cannot afford this buy-in',
          variant: 'destructive',
        });
        setCreatingHand(false);
        return;
      }

      if (bigBlindStack < buyIn) {
        toast({
          title: 'Error',
          description: 'You do not have enough allowance to make this bet',
          variant: 'destructive',
        });
        setCreatingHand(false);
        return;
      }

      const receipt = await onchain?.createHand({
        buyIn: buyIn.toString(),
        smallBlind,
      });

      toast({
        title: 'Success',
        description: 'Hand created onchain',
        action: (
          <Link
            target="_blank"
            href={`https://basescan.org/tx/${receipt?.transactionHash}`}
          >
            <ToastAction altText="Try again">View transaction</ToastAction>
          </Link>
        ),
      });

      const logs = receipt?.logs as any;

      const receiptLogs = parseEventLogs({
        abi: Hodlem.abi,
        logs,
      }) as any;

      const { handId, betAmount } = receiptLogs[0].args;

      const onchainId = `${handId}`;
      const bigBlindBetTotal = Number(formatEther(betAmount));
      const hand = await fetchQuery(api.hands.getHandByOnchainId, {
        onchainId,
      });

      if (hand?.length === 1) {
        return;
      }

      await createHand({
        onchainId,
        gameId,
        bigBlindBetTotal,
      });

      await addSmallBlind({ id: gameId, smallBlind });

      setCreatingHand(false);
    } catch (e) {
      console.log(e);
      toast({
        title: 'Error',
        description: 'Error creating hand',
        variant: 'destructive',
      });
      setCreatingHand(false);
      return;
    }
  };

  const approveTokenAllowance = async () => {
    setIsApproving(true);
    try {
      const receipt = await onchain?.approve({
        balance,
      });

      toast({
        title: 'Success',
        description: 'Token transfer approved',
        action: (
          <Link
            target="_blank"
            href={`https://basescan.org/tx/${receipt?.transactionHash}`}
          >
            <ToastAction altText="Try again">View transaction</ToastAction>
          </Link>
        ),
      });

      setIsApproving(false);
      setAllowMore(false);
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Error approving token allowance',
        variant: 'destructive',
      });
      setIsApproving(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create hand</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Buy-in</DialogTitle>
          <DialogDescription>
            {allowMore
              ? "Your stack isn't big enough for the buy-in. You can top up your balance by allowing Hodlem to spend your $DEGEN."
              : 'There is a 100 $DEGEN rake fee. The small blind will have to match your buy-in above this fee.'}
          </DialogDescription>
        </DialogHeader>
        {allowMore ? (
          <Button disabled={isApproving} onClick={approveTokenAllowance}>
            {isApproving ? 'Approving...' : 'Approve $DEGEN'}
          </Button>
        ) : (
          <CreateHandForm
            handleCreateHand={handleCreateHand}
            creatingHand={creatingHand}
            opposingStack={900}
            activeStack={900}
            raiseAmount={100}
            isRaise={false}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CreateHand;
