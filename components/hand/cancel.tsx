'use client';
import toast from 'react-hot-toast';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState } from 'react';
import useWalletClient from '@/hooks/useWalletClient';
import { chain } from '@/constants/chain';
import { createPublicClient, http } from 'viem';
import Hodlem from '@/hooks/abis/Hodlem.json';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';
import { Button } from '../ui/button';

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
  const [isCancelling, setIsCancelling] = useState(false);
  const cancelHand = useMutation(api.hands.cancel);
  const swap = useMutation(api.games.swap);

  async function handleCancelHand() {
    setIsCancelling(true);

    const client = await walletClient;
    const account = address;

    try {
      const { request } = await publicClient.simulateContract({
        address: hodlemContract,
        abi: Hodlem.abi,
        functionName: 'cancelHand',
        args: [onchainId],
        account,
      });

      const hash = (await client?.writeContract(
        request as any
      )) as `0x${string}`;

      await publicClient.waitForTransactionReceipt({
        hash,
      });

      await cancelHand({
        id,
      });

      await swap({
        id: gameId,
        currentBigBlind: address,
      });

      setIsCancelling(false);
    } catch {
      toast.error('Error creating hand');
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
