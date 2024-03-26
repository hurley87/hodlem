'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toHumanReadable } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';
import { Id } from '@/convex/_generated/dataModel';
import { usePrivy } from '@privy-io/react-auth';
import { Badge } from '../ui/badge';
import Cards from './cards';
import useProfile from '@/hooks/useProfile';

type Props = {
  handId: Id<'hands'>;
  stack: number | undefined;
};

function OpposingPlayer({ handId, stack }: Props) {
  const { user } = usePrivy();
  const userAddress = user?.wallet?.address;
  const hand = useQuery(api.hands.getHand, {
    handId,
  }) as any;
  const address =
    userAddress === hand?.bigBlind ? hand?.smallBlind : hand?.bigBlind;
  const profile = useProfile({ address });
  const isBigBlind = userAddress !== hand?.bigBlind;
  const isActivePlayer = hand?.activePlayer !== userAddress;
  const cards = isBigBlind ? hand?.bigBlindCards : hand?.smallBlindCards;

  if (!profile) return null;

  return (
    <Card>
      <CardHeader>
        <CardDescription>
          <div className="flex justify-between">
            <div>
              {profile.displayName} | {!stack ? 0 : toHumanReadable(stack)}{' '}
              $DEGEN
            </div>
            {isActivePlayer ? (
              <Badge className="bg-green-500">Their turn</Badge>
            ) : isBigBlind ? (
              <Badge variant="outline">Big blind</Badge>
            ) : (
              <Badge variant="outline">Small blind</Badge>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      {hand?.stage === 'over' && hand?.result !== 'fold' && (
        <CardContent>
          <Cards cards={cards} />
        </CardContent>
      )}
    </Card>
  );
}

export default OpposingPlayer;
