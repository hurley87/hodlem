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

function BetHand({
  id,
  onchainId,
  bettorStack,
  opposingStack,
}: {
  id: Id<'hands'>;
  onchainId: string;
  bettorStack: number;
  opposingStack: number;
}) {
  const { user } = usePrivy();
  const [creatingBet, setCreatingBet] = useState(false);
  const [betAmount, setBetAmount] = useState<string>('');
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

  const handleBetHand = async () => {
    setCreatingBet(true);
    const client = await walletClient;

    if (
      isNaN(Number(betAmount)) ||
      Number(betAmount) < 100 ||
      betAmount === ''
    ) {
      toast.error("Your bet can't be less than 100");
      setCreatingBet(false);
      return;
    }

    if (parseInt(betAmount) > bettorStack) {
      toast.error('Your stack isnt big enough for this bet');
      setCreatingBet(false);
      return;
    }

    if (parseInt(betAmount) > opposingStack) {
      toast.error(`The max bet is ${opposingStack} $DEGEN`);
      setCreatingBet(false);
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

      await betHand({
        id,
        betAmount: Number(betAmount),
        player: address,
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
      <input
        value={betAmount}
        onChange={(e) => setBetAmount(e.target.value)}
        placeholder="420"
      />
      <button onClick={handleBetHand}>
        {creatingBet ? 'Betting...' : 'Bet'}
      </button>
    </>
  );
}

export default BetHand;
