'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toHumanReadable } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '../ui/card';
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

type Props = {
  handId: Id<'hands'>;
  activeStack: number | undefined;
  opposingStack: number | undefined;
};

function ActivePlayer({ handId, activeStack, opposingStack }: Props) {
  const { user } = usePrivy();
  const address = user?.wallet?.address;
  const hand = useQuery(api.hands.getHand, {
    handId,
  }) as any;

  const profile = useQuery(api.profiles.getByAddress, {
    address,
  }) as any;
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
    <Card>
      <CardHeader>
        <CardDescription>
          <div className="flex justify-between">
            <div>
              {profile.displayName} |{' '}
              {!activeStack ? 0 : toHumanReadable(activeStack)} $DEGEN
            </div>
            {isActivePlayer ? (
              <Badge className="bg-green-500">Your turn</Badge>
            ) : isBigBlind ? (
              <Badge variant="outline">Big blind</Badge>
            ) : (
              <Badge variant="outline">Small blind</Badge>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Cards cards={cards} />
      </CardContent>
      <CardFooter className="flex gap-2">
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
        {hand.hash && (
          <Link target="_blank" href={`https://basescan.org/tx/${hand.hash}`}>
            <Button variant="outline">View Transaction</Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}

export default ActivePlayer;
