'use client';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';
import Degen from '@/hooks/abis/Degen.json';
import { parseEther } from 'viem';
import { createPublicClient, http } from 'viem';
import { chain } from '@/constants/chain';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState } from 'react';
import useWalletClient from '@/hooks/useWalletClient';

export default function Game({ params }: { params: { uid: Id<'games'> } }) {
  const gameId = params.uid;
  const game = useQuery(api.games.getGame, {
    gameId,
  });
  const { user, ready } = usePrivy();
  const { wallets } = useWallets();
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });
  const wallet = wallets[0];
  const [allowance, setAllowance] = useState<string | null>(null);
  const degenContract = process.env.NEXT_PUBLIC_DEGEN_CONTRACT as `0x${string}`;
  const [buyIn, setBuyIn] = useState<string>('');
  const walletClient = useWalletClient({ chain, wallet });

  console.log('wallet', wallet);

  const handleCreateBuyIn = async () => {
    if (!walletClient) {
      alert('No wallet connected');
      return;
    }

    const degenAbi = Degen.abi;
    const client = await walletClient;

    if (allowance && buyIn >= allowance) {
      alert('Your buy in is greater than your allowance');
    }

    const { request } = await publicClient.simulateContract({
      address: degenContract,
      abi: degenAbi,
      functionName: 'createHand',
      args: [parseEther(buyIn)],
    });

    const hash = await client?.writeContract(request as any);

    console.log('hash', hash);
  };

  if (!ready) {
    return <div>Loading...</div>;
  }

  console.log('game', game);

  const isCreator = game?.creator === user?.wallet?.address;

  const hasOpponent = game?.opponent !== undefined;

  console.log('isCreator', isCreator);

  console.log('allowance', allowance);

  console.log('hasOpponent', hasOpponent);

  return (
    <>
      <h1>deal hand: {params.uid}</h1>
      {isCreator && !hasOpponent && <p>Share this link with a friend</p>}
      {!isCreator && !hasOpponent && <button>Ask to join</button>}
    </>
  );
}
