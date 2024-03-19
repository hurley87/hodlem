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
import DealHead from '../hand/deal';
import Image from 'next/image';
import BetHand from '../hand/bet';
import CheckHand from '../hand/check';
import CallHand from '../hand/call';
import RaiseHand from '../hand/raise';
import FoldHand from '../hand/fold';
import RevealCards from '../hand/reveal';
import SettleHand from '../hand/settle';
import ClaimHand from '../hand/claim';
import NewHand from '../hand/new';

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
  });
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
  const hasntJoined = smallBlindBetTotal === 0 && bigBlindBetTotal > 0;
  const hasDealt = hand?.bigBlindCards;
  const bigBlindCards = hand?.bigBlindCards;
  const smallBlindCards = hand?.smallBlindCards;
  const isSmallBlind = hand?.smallBlind === player;
  const isActivePlayer = hand?.activePlayer === player;
  const flopCards = hand?.flopCards;
  const turnCard = hand?.turnCard;
  const riverCard = hand?.riverCard;
  const opposingPlayer = isSmallBlind ? hand?.bigBlind : hand?.smallBlind;

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

  if (!hand) return <div>Loading...</div>;

  if (!hand?.isActive) return <div>Hand is over</div>;

  if (isBigBlind && hasntJoined)
    return <CancelHand id={handId} onchainId={onchainId} gameId={gameId} />;

  if (!isBigBlind && hasntJoined)
    return (
      <JoinHand
        id={handId}
        onchainId={onchainId}
        bigBlindBetTotal={bigBlindBetTotal}
      />
    );

  const showCards = (cards: string[]) => {
    return (
      <div className="flex gap-2">
        {cards?.map((card: string) => (
          <div key={card} className="bg-white p-2 rounded-md">
            <Image
              alt={card}
              src={`/cards/${card}.svg`}
              width={75}
              height={100}
            />
          </div>
        ))}
      </div>
    );
  };

  if (hand) {
    const bettorStack = isSmallBlind ? smallBlindStack : bigBlindStack;
    const opposingStack = isSmallBlind ? bigBlindStack : smallBlindStack;
    const activeStack = isSmallBlind ? smallBlindStack : bigBlindStack;
    const handOver = hand?.stage === 'over';

    return (
      <>
        {!hasDealt && (
          <>
            {isBigBlind && <DealHead id={handId} gameId={gameId} />}
            {!isBigBlind && <div>waiting on dealer</div>}
          </>
        )}

        {hasDealt && !handOver && (
          <>
            <h1>Big Blind Stack: {bigBlindStack}</h1>
            <h1>Small Blind Stack: {smallBlindStack}</h1>
            <h1>Pot: {pot}</h1>
            {flopCards && showCards(flopCards)}
            {turnCard && showCards([turnCard])}
            {riverCard && showCards([riverCard])}
            <h1>
              {hand.stage} - {isBigBlind ? 'Big blind' : 'Small blind'}
            </h1>
            {showCards(isSmallBlind ? smallBlindCards : bigBlindCards)}
            {!isActivePlayer && (
              <div>
                <p>Waiting on the other player to act</p>
              </div>
            )}
            {isActivePlayer && (
              <div>
                {hand?.canBet && opposingStack !== 0 && activeStack !== 0 && (
                  <BetHand
                    id={hand._id}
                    onchainId={onchainId}
                    bettorStack={bettorStack as number}
                    opposingStack={opposingStack as number}
                  />
                )}
                {hand?.canCheck && <CheckHand id={hand._id} />}
                {hand?.canCall && (
                  <CallHand
                    id={hand._id}
                    onchainId={onchainId}
                    betAmount={hand?.betAmount.toString()}
                  />
                )}
                {hand?.canRaise && opposingStack !== 0 && activeStack !== 0 && (
                  <RaiseHand
                    id={hand._id}
                    onchainId={onchainId}
                    betAmount={hand?.betAmount.toString()}
                    opposingStack={opposingStack as number}
                  />
                )}
                {hand?.canFold && (
                  <FoldHand
                    id={hand._id}
                    onchainId={onchainId}
                    winner={opposingPlayer}
                  />
                )}
                {hand?.canReveal && (
                  <RevealCards id={hand._id} gameId={gameId} />
                )}
              </div>
            )}
          </>
        )}

        {handOver && (
          <div>
            {hand.hash ? (
              <div>
                {hand.result === 'fold' && <p>Hand hash settled</p>}
                <p>{hand.hash}</p>
                <NewHand id={hand._id} />
              </div>
            ) : (
              <>
                {hand.result === 'tie' && (
                  <SettleHand
                    id={hand._id}
                    onchainId={onchainId}
                    resultMessage={hand.resultMessage}
                  />
                )}
                {hand.result === 'win' && (
                  <ClaimHand
                    id={hand._id}
                    onchainId={onchainId}
                    resultMessage={hand.resultMessage}
                    winner={hand.winner}
                  />
                )}
              </>
            )}
          </div>
        )}
      </>
    );
  }
}
