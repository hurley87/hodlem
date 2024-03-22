'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toHumanReadable } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';
import { Id } from '@/convex/_generated/dataModel';
import { usePrivy } from '@privy-io/react-auth';
import { Badge } from '../ui/badge';
import Cards from './cards';

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
  const profile = useQuery(api.profiles.getByAddress, {
    address,
  }) as any;
  const isBigBlind = userAddress !== hand?.bigBlind;
  const isActivePlayer = hand?.activePlayer !== userAddress;
  const cards = isBigBlind ? hand?.bigBlindCards : hand?.smallBlindCards;

  if (!profile) return null;

  return (
    <Card>
      <CardHeader>
        <CardDescription>
          <div className="flex justify-between">
            <p>
              {profile.displayName} | {!stack ? 0 : toHumanReadable(stack)}{' '}
              $DEGEN
            </p>
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
      {hand?.stage === 'over' && (
        <CardContent>
          <Cards cards={cards} />
        </CardContent>
      )}
    </Card>
  );
}

export default OpposingPlayer;
