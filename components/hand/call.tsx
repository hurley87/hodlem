'use client';
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { chain } from '@/constants/chain';
import { createPublicClient, http, parseEther } from 'viem';
import Degen from '@/hooks/abis/Degen.json';
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '../ui/button';
import useChain from '@/hooks/useChain';
import { useToast } from '../ui/use-toast';
import Link from 'next/link';
import { ToastAction } from '../ui/toast';

function CallHand({
  id,
  onchainId,
  betAmount,
}: {
  id: Id<'hands'>;
  onchainId: string;
  betAmount: string;
}) {
  const { user } = usePrivy();
  const [creatingBet, setCreatingBet] = useState(false);
  const degenContract = process.env.NEXT_PUBLIC_DEGEN_CONTRACT as `0x${string}`;
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });
  const address = user?.wallet?.address as `0x${string}`;
  const hodlemContract = process.env
    .NEXT_PUBLIC_HODLEM_CONTRACT as `0x${string}`;
  const callHand = useMutation(api.hands.call);
  const onchain = useChain({ address });
  const { toast } = useToast();

  const handleCallHand = async () => {
    setCreatingBet(true);
    const buyInAmount = parseEther(betAmount);

    const a2 = await publicClient.readContract({
      address: degenContract,
      abi: Degen.abi,
      functionName: 'allowance',
      args: [address, hodlemContract],
    });
    const bigBlindAllowance = a2 as bigint;

    if (bigBlindAllowance < buyInAmount) {
      toast({
        title: 'Error',
        description: 'You do not have enough allowance to make this bet',
        variant: 'destructive',
      });
      return;
    }

    try {
      const receipt = await onchain?.call({
        onchainId,
        betAmount,
      });

      await callHand({
        id,
        betAmount: parseInt(betAmount),
      });

      toast({
        title: 'Success',
        description: 'Bet placed onchain',
        action: (
          <Link
            target="_blank"
            href={`https://basescan.org/tx/${receipt?.transactionHash}`}
          >
            <ToastAction altText="Try again">View transaction</ToastAction>
          </Link>
        ),
      });

      setCreatingBet(false);
    } catch (e) {
      toast({
        title: 'Error',
        description: `Error calling hand`,
        variant: 'destructive',
      });
      setCreatingBet(false);
      return;
    }
  };

  return (
    <Button disabled={creatingBet} onClick={handleCallHand}>
      {creatingBet ? 'Calling...' : `Call ${betAmount} $DEGEN`}
    </Button>
  );
}

export default CallHand;
