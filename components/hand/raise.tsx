'use client';
import toast from 'react-hot-toast';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState } from 'react';
import useWalletClient from '@/hooks/useWalletClient';
import { chain } from '@/constants/chain';
import { createPublicClient, http, parseEther } from 'viem';
import Degen from '@/hooks/abis/Degen.json';
import Hodlem from '@/hooks/abis/Hodlem.json';
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import CreateHandForm from './create-form';

function RaiseHand({
  id,
  onchainId,
  betAmount,
  opposingStack,
}: {
  id: Id<'hands'>;
  onchainId: string;
  betAmount: string;
  opposingStack: number;
}) {
  const { user } = usePrivy();
  const [creatingBet, setCreatingBet] = useState(false);
  const degenContract = process.env.NEXT_PUBLIC_DEGEN_CONTRACT as `0x${string}`;
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

  const handleRaiseHand = async (raiseAmount: number) => {
    setCreatingBet(true);
    const client = await walletClient;
    const betTotal = parseInt(betAmount) + raiseAmount;
    const totalBetAmount = parseEther(betTotal.toString());

    if (isNaN(raiseAmount) || raiseAmount < Number(betAmount)) {
      toast.error('You must raise more than the original bet');
      setCreatingBet(false);
      return;
    }

    const a2 = await publicClient.readContract({
      address: degenContract,
      abi: Degen.abi,
      functionName: 'allowance',
      args: [address, hodlemContract],
    });
    const bigBlindAllowance = a2 as bigint;

    if (bigBlindAllowance < totalBetAmount) {
      toast.error('You do not have enough allowance to make this bet');
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        address: hodlemContract,
        abi: Hodlem.abi,
        functionName: 'makeBet',
        args: [onchainId, totalBetAmount],
        account: address,
      });

      const hash = (await client?.writeContract(
        request as any
      )) as `0x${string}`;

      await publicClient.waitForTransactionReceipt({
        hash,
      });

      if (Number(betAmount) > opposingStack) {
        toast.error(`The max bet is ${opposingStack} $DEGEN`);
        return;
      }

      await betHand({
        id,
        betAmount: Number(raiseAmount),
        player: address,
      });

      setCreatingBet(false);
    } catch (e) {
      toast.error('Error raising hand');
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
            Raise your opponent more than {betAmount}
          </DialogDescription>
        </DialogHeader>
        <CreateHandForm
          handleCreateHand={handleRaiseHand}
          creatingHand={creatingBet}
          opposingStack={opposingStack}
        />
      </DialogContent>
    </Dialog>
  );
}

export default RaiseHand;
