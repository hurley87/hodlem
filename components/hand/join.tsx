'use client';
import toast from 'react-hot-toast';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState } from 'react';
import useWalletClient from '@/hooks/useWalletClient';
import { chain } from '@/constants/chain';
import { createPublicClient, http } from 'viem';
import Hodlem from '@/hooks/abis/Hodlem.json';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';
import { Button } from '../ui/button';

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
  const [isJoining, setIsJoining] = useState(false);
  const join = useMutation(api.hands.join);

  async function handleJoin() {
    setIsJoining(true);
    const client = await walletClient;
    const account = address;

    try {
      const { request } = await publicClient.simulateContract({
        address: hodlemContract,
        abi: Hodlem.abi,
        functionName: 'joinHand',
        args: [onchainId],
        account,
      });

      const hash = (await client?.writeContract(
        request as any
      )) as `0x${string}`;

      await publicClient.waitForTransactionReceipt({
        hash,
      });

      await join({
        id,
        smallBlindBetTotal: bigBlindBetTotal,
      });

      setIsJoining(false);
    } catch (e) {
      toast.error('Error joining hand');
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
