'use client';
import toast from 'react-hot-toast';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState } from 'react';
import useWalletClient from '@/hooks/useWalletClient';
import { chain } from '@/constants/chain';
import { createPublicClient, http, parseEther } from 'viem';
import Hodlem from '@/hooks/abis/Hodlem.json';
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
  const { wallets } = useWallets();
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });
  const address = user?.wallet?.address as `0x${string}`;
  const wallet = wallets.filter((wallet) => wallet?.address === address)[0];
  const walletClient = useWalletClient({ chain, wallet });
  const hodlemContract = process.env
    .NEXT_PUBLIC_HODLEM_CONTRACT as `0x${string}`;
  const betHand = useMutation(api.hands.bet);

  const handleBetHand = async (betAmount: number) => {
    setCreatingBet(true);
    const client = await walletClient;

    if (isNaN(Number(betAmount)) || Number(betAmount) < 100) {
      toast.error("Your bet can't be less than 100");
      setCreatingBet(false);
      return;
    }

    if (betAmount > (activeStack || 0)) {
      toast.error('Your stack isnt big enough for this bet');
      setCreatingBet(false);
      return;
    }

    if (betAmount > (opposingStack || 0)) {
      toast.error(`The max bet is ${opposingStack} $DEGEN`);
      setCreatingBet(false);
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        address: hodlemContract,
        abi: Hodlem.abi,
        functionName: 'makeBet',
        args: [onchainId, parseEther(betAmount.toString())],
        account: address,
      });

      const hash = (await client?.writeContract(
        request as any
      )) as `0x${string}`;

      await publicClient.waitForTransactionReceipt({
        hash,
      });

      await betHand({
        id,
        betAmount: Number(betAmount),
        player: address,
      });

      setCreatingBet(false);
    } catch {
      toast.error('Error creating bet');
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
          <DialogDescription>Enter a bet amount.</DialogDescription>
        </DialogHeader>
        <CreateHandForm
          handleCreateHand={handleBetHand}
          creatingHand={creatingBet}
          opposingStack={opposingStack as number}
        />
      </DialogContent>
    </Dialog>
  );
}

export default BetHand;
