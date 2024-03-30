'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toHumanReadable } from '@/lib/utils';
import { Id } from '@/convex/_generated/dataModel';
import { usePrivy } from '@privy-io/react-auth';
import { Badge } from '../ui/badge';
import Cards from './cards';
import CheckHand from './check';
import CallHand from './call';
import BetHand from './bet';
import RaiseHand from './raise';
import FoldHand from './fold';
import RevealHand from './reveal';
import SettleHand from './settle';
import ClaimHand from './claim';
import NewHand from './new';
import Link from 'next/link';
import { Button } from '../ui/button';
import useProfile from '@/hooks/useProfile';

type Props = {
  handId: Id<'hands'>;
  activeStack: number | undefined;
  opposingStack: number | undefined;
};

function ActivePlayer({ handId, activeStack, opposingStack }: Props) {
  const { user } = usePrivy();
  const address = user?.wallet?.address as `0x${string}`;
  const hand = useQuery(api.hands.getHand, {
    handId,
  }) as any;
  const profile = useProfile({ address });
  const isBigBlind = address === hand?.bigBlind;
  const isActivePlayer = hand?.activePlayer === address;
  const cards = isBigBlind ? hand?.bigBlindCards : hand?.smallBlindCards;
  const opposingPlayer = isBigBlind ? hand?.smallBlind : hand?.bigBlind;
  const canBet =
    hand?.canBet && isActivePlayer && opposingStack !== 0 && activeStack !== 0;
  const canRaise =
    hand?.canRaise &&
    isActivePlayer &&
    opposingStack !== 0 &&
    activeStack !== 0;
  const canFold = hand?.canFold && isActivePlayer;
  const canReveal = hand?.canReveal && isActivePlayer && hand?.stage !== 'over';
  const handOver = hand?.stage === 'over';
  const canSettle =
    handOver && hand.result === 'tie' && !hand.hash && isActivePlayer;
  const canClaim =
    handOver && hand.result === 'win' && !hand.hash && hand.winner === address;
  const canNewHand = handOver && hand.hash;

  if (!profile) return null;

  return (
    <div className="flex flex-col gap-2 px-2 w-full">
      <div className="flex justify-center">
        <Cards cards={cards} />
      </div>
      <div
        className={`w-40 mx-auto rounded-sm relative bottom-16 bg-white p-3 text-center shadow-lg transition-all duration-300 ease-in ${
          isActivePlayer && 'shadow-green-200'
        }`}
      >
        <div className="absolute top-0 right-0">
          {isBigBlind ? (
            <Badge className="relative bottom-3 left-3">B</Badge>
          ) : (
            <Badge className="relative bottom-3 left-3">S</Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">{profile.username}</div>
        <div className="text-sm font-bold text-muted-foreground">
          {!activeStack ? 0 : toHumanReadable(parseInt(activeStack.toFixed(0)))}
        </div>
      </div>
      <div className="text-center relative bottom-10 flex gap-2 justify-center">
        {!isActivePlayer && handOver && hand.result === 'win' && (
          <div className="text-sm text-muted-foreground">
            Waiting on other player to claim ...
          </div>
        )}
        {!isActivePlayer && handOver && hand.result === 'tie' && (
          <div className="text-sm text-muted-foreground">
            Waiting on other player to settle ...
          </div>
        )}
        {!isActivePlayer && !handOver && (
          <div className="text-sm text-muted-foreground">
            Waiting on other player to act ...
          </div>
        )}
        {hand?.canCheck && isActivePlayer && <CheckHand id={handId} />}
        {hand?.canCall && isActivePlayer && (
          <CallHand
            id={hand._id}
            onchainId={hand.onchainId}
            betAmount={hand?.betAmount?.toString()}
          />
        )}
        {canBet && (
          <BetHand
            id={hand._id}
            onchainId={hand.onchainId}
            activeStack={activeStack}
            opposingStack={opposingStack}
          />
        )}
        {canRaise && (
          <RaiseHand
            id={hand._id}
            onchainId={hand.onchainId}
            opposingStack={opposingStack as number}
            betAmount={hand?.betAmount?.toString()}
            activeStack={activeStack as number}
          />
        )}
        {canFold && (
          <FoldHand
            id={hand._id}
            onchainId={hand.onchainId}
            winner={opposingPlayer}
          />
        )}
        {canReveal && <RevealHand id={hand._id} />}
        {canSettle && (
          <SettleHand
            id={hand._id}
            onchainId={hand.onchainId}
            resultMessage={hand.resultMessage}
          />
        )}
        {canClaim && (
          <ClaimHand
            id={hand._id}
            onchainId={hand.onchainId}
            resultMessage={hand.resultMessage}
            winner={hand.winner}
          />
        )}
        {canNewHand && isActivePlayer && <NewHand id={hand._id} />}
        {hand.hash && isActivePlayer && (
          <Link target="_blank" href={`https://basescan.org/tx/${hand.hash}`}>
            <Button variant="outline">View Transaction</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default ActivePlayer;
