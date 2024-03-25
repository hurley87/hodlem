'use client';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';
import { useEffect, useState } from 'react';
import { createPublicClient, formatEther, http } from 'viem';
import { chain } from '@/constants/chain';
import Hodlem from '@/hooks/abis/Hodlem.json';
import Degen from '@/hooks/abis/Degen.json';
import JoinHand from '../hand/join';
import CancelHand from '../hand/cancel';
import DealHand from '../hand/deal';
import { Card, CardDescription, CardHeader } from '../ui/card';
import Table from '../hand/table';
import OpposingPlayer from '../hand/opposing';
import ActivePlayer from '../hand/active';
import Loading from '../loading';

export default function Hand({
  gameId,
  handId,
  isBigBlind,
  player,
}: {
  gameId: Id<'games'>;
  handId: Id<'hands'>;
  isBigBlind: boolean;
  player: `0x${string}`;
}) {
  const hand = useQuery(api.hands.getHand, {
    handId,
  }) as any;
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });
  const [bigBlindStack, setBigBlindStack] = useState<number>();
  const [smallBlindStack, setSmallBlindStack] = useState<number>();
  const [pot, setPot] = useState<number>();
  const hodlemContract = process.env
    .NEXT_PUBLIC_HODLEM_CONTRACT as `0x${string}`;
  const degenContract = process.env.NEXT_PUBLIC_DEGEN_CONTRACT as `0x${string}`;
  const onchainId = hand?.onchainId;
  const bigBlindBetTotal = hand?.bigBlindBetTotal;
  const smallBlindBetTotal = hand?.smallBlindBetTotal;
  const noOpponent =
    smallBlindBetTotal === 0 &&
    bigBlindBetTotal > 0 &&
    hand?.stage === 'created';
  const hasDealt = hand?.bigBlindCards;
  const isSmallBlind = hand?.smallBlind === player;
  const opposingStack = isSmallBlind ? bigBlindStack : smallBlindStack;
  const activeStack = isSmallBlind ? smallBlindStack : bigBlindStack;

  useEffect(() => {
    async function getOnchainHand() {
      try {
        const onchainHand = (await publicClient.readContract({
          address: hodlemContract,
          abi: Hodlem.abi,
          functionName: 'getHand',
          args: [onchainId],
        })) as { bigBlindBetTotal: bigint; smallBlindBetTotal: bigint };

        const totalPot = parseInt(
          formatEther(
            onchainHand.bigBlindBetTotal + onchainHand.smallBlindBetTotal
          )
        );
        setPot(totalPot);

        const smallBlindAllowance = (await publicClient.readContract({
          address: degenContract,
          abi: Degen.abi,
          functionName: 'allowance',
          args: [hand?.smallBlind, hodlemContract],
        })) as bigint;

        const bigBlindAllowance = (await publicClient.readContract({
          address: degenContract,
          abi: Degen.abi,
          functionName: 'allowance',
          args: [hand?.bigBlind, hodlemContract],
        })) as bigint;

        let bigBlindBlanace = (await publicClient.readContract({
          address: degenContract,
          abi: Degen.abi,
          functionName: 'balanceOf',
          args: [hand?.bigBlind],
        })) as bigint;

        if (bigBlindBlanace > bigBlindAllowance)
          bigBlindBlanace = bigBlindAllowance;

        const bigBlindStack = parseInt(formatEther(bigBlindBlanace));
        setBigBlindStack(bigBlindStack);

        let smallBlindBalance = (await publicClient.readContract({
          address: degenContract,
          abi: Degen.abi,
          functionName: 'balanceOf',
          args: [hand?.smallBlind],
        })) as bigint;

        if (smallBlindBalance > smallBlindAllowance)
          smallBlindBalance = smallBlindAllowance;

        const smallBlindStack = parseInt(formatEther(smallBlindBalance));
        setSmallBlindStack(smallBlindStack);
      } catch {}
    }
    if (onchainId) getOnchainHand();
  }, [hand]);

  if (!hand) return <Loading />;

  if (isBigBlind && noOpponent)
    return <CancelHand id={handId} onchainId={onchainId} gameId={gameId} />;

  if (!isBigBlind && noOpponent)
    return (
      <JoinHand
        id={handId}
        onchainId={onchainId}
        bigBlindBetTotal={bigBlindBetTotal}
      />
    );

  if (!hasDealt) {
    return (
      <>
        {isBigBlind && <DealHand id={handId} gameId={gameId} />}
        {!isBigBlind && (
          <Card>
            <CardHeader>
              <CardDescription>
                Waiting on the other player to act ...
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <OpposingPlayer handId={handId} stack={opposingStack} />
      <Table handId={handId} pot={pot} />
      <ActivePlayer
        handId={handId}
        activeStack={activeStack}
        opposingStack={opposingStack}
      />
    </div>
  );
}
