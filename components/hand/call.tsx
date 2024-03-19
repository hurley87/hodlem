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
  const callHand = useMutation(api.hands.call);

  const handleCallHand = async () => {
    setCreatingBet(true);
    const client = await walletClient;
    const buyInAmount = parseEther(betAmount);

    const a2 = await publicClient.readContract({
      address: degenContract,
      abi: Degen.abi,
      functionName: 'allowance',
      args: [address, hodlemContract],
    });
    const bigBlindAllowance = a2 as bigint;

    if (bigBlindAllowance < buyInAmount) {
      toast.error('You do not have enough allowance to make this bet');
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        address: hodlemContract,
        abi: Hodlem.abi,
        functionName: 'makeBet',
        args: [onchainId, parseEther(betAmount)],
        account: address,
      });

      const hash = (await client?.writeContract(
        request as any
      )) as `0x${string}`;

      await publicClient.waitForTransactionReceipt({
        hash,
      });

      await callHand({
        id,
        betAmount: parseInt(betAmount),
      });

      setCreatingBet(false);
    } catch (e) {
      toast.error('Error creating hand');
      setCreatingBet(false);
      return;
    }
  };

  return (
    <>
      <p>Your opponent bet {betAmount}</p>
      <button onClick={handleCallHand}>
        {creatingBet ? 'Calling...' : 'Call'}
      </button>
    </>
  );
}

export default CallHand;
