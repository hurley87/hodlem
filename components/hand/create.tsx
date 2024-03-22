'use client';
import toast from 'react-hot-toast';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState } from 'react';
import useWalletClient from '@/hooks/useWalletClient';
import { chain } from '@/constants/chain';
import { createPublicClient, formatEther, http, parseEther } from 'viem';
import Degen from '@/hooks/abis/Degen.json';
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

function CreateHand({
  gameId,
  smallBlind,
}: {
  gameId: Id<'games'>;
  smallBlind: `0x${string}`;
}) {
  const { user } = usePrivy();
  const [creatingHand, setCreatingHand] = useState(false);
  const degenContract = process.env.NEXT_PUBLIC_DEGEN_CONTRACT as `0x${string}`;
  const [handCreated, setHandCreated] = useState(false);
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
  const createHand = useMutation(api.hands.create);
  const addSmallBlind = useMutation(api.games.addSmallBlind);

  publicClient.watchContractEvent({
    address: hodlemContract,
    abi: Hodlem.abi,
    eventName: 'HandCreated',
    onLogs: (logs: any) => {
      const { handId, betAmount } = logs[0].args;
      handleCreate(`${handId}`, formatEther(betAmount));
    },
  });

  const handleCreate = async (onchainId: string, betAmount: string) => {
    const bigBlindBetTotal = Number(betAmount);
    const hand = await fetchQuery(api.hands.getHandByOnchainId, {
      onchainId,
    });

    if (hand?.length === 1) {
      return;
    }
    if (handCreated) return;

    await createHand({
      onchainId,
      gameId,
      bigBlindBetTotal,
    });

    setHandCreated(true);
  };

  const handleCreateHand = async (buyIn: number) => {
    if (!walletClient) {
      toast.error('No wallet connected');
      return;
    }

    const client = await walletClient;
    const bigBlind = wallet?.address as `0x${string}`;

    if (smallBlind === bigBlind) {
      toast.error('You cannot play against yourself');
      return;
    }

    setCreatingHand(true);

    try {
      const a1 = await publicClient.readContract({
        address: degenContract,
        abi: Degen.abi,
        functionName: 'allowance',
        args: [smallBlind, hodlemContract],
      });

      const smallBlindAllowance = a1 as bigint;

      let smallBlindBalance = (await publicClient.readContract({
        address: degenContract,
        abi: Degen.abi,
        functionName: 'balanceOf',
        args: [smallBlind],
      })) as bigint;

      if (smallBlindBalance > smallBlindAllowance)
        smallBlindBalance = smallBlindAllowance;

      const smallBlindStack = parseInt(formatEther(smallBlindBalance));

      const a2 = await publicClient.readContract({
        address: degenContract,
        abi: Degen.abi,
        functionName: 'allowance',
        args: [bigBlind, hodlemContract],
      });

      const bigBlindAllowance = a2 as bigint;

      let bigBlindBlanace = (await publicClient.readContract({
        address: degenContract,
        abi: Degen.abi,
        functionName: 'balanceOf',
        args: [bigBlind],
      })) as bigint;

      if (bigBlindBlanace > bigBlindAllowance)
        bigBlindBlanace = bigBlindAllowance;

      const bigBlindStack = parseInt(formatEther(bigBlindBlanace));

      if (smallBlindStack < buyIn) {
        toast.error('Small blind cannot afford this buy-in');
        setCreatingHand(false);
        return;
      }

      if (bigBlindStack < buyIn) {
        toast.error('You do not have enough allowance to make this bet');
        setCreatingHand(false);
        return;
      }

      const { request } = await publicClient.simulateContract({
        address: hodlemContract,
        abi: Hodlem.abi,
        functionName: 'createHand',
        args: [parseEther(buyIn.toString()), smallBlind],
        account: address,
      });

      const hash = (await client?.writeContract(
        request as any
      )) as `0x${string}`;

      await publicClient.waitForTransactionReceipt({
        hash,
      });

      await addSmallBlind({ id: gameId, smallBlind });

      setCreatingHand(false);
    } catch (e) {
      toast.error('Error creating hand');
      setCreatingHand(false);
      return;
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
            There is a 100 $DEGEN rake fee. The small blind will have to match
            your buy-in above this fee.
          </DialogDescription>
        </DialogHeader>
        <CreateHandForm
          handleCreateHand={handleCreateHand}
          creatingHand={creatingHand}
          opposingStack={900}
        />
      </DialogContent>
    </Dialog>
  );
}

export default CreateHand;
