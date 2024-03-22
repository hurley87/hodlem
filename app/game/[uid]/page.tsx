'use client';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';
import { usePrivy } from '@privy-io/react-auth';
import CreateHand from '@/components/hand/create';
import Challenge from '@/components/game/challenge';
import Hand from '@/components/game/hand';
import { GameLayout } from '@/components/game-layout';
import Share from '@/components/game/share';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';

export default function Game({ params }: { params: { uid: Id<'games'> } }) {
  const gameId = params.uid;
  const game = useQuery(api.games.getGame, {
    gameId,
  });
  const { user, ready } = usePrivy();
  const address = user?.wallet?.address as `0x${string}`;
  const hands = useQuery(api.hands.get, {
    gameId,
  });
  const isBigBlind = game?.bigBlind === address;
  const smallBlind = game?.smallBlind;
  const hasSmallBlind = smallBlind !== '';
  const challengers = game?.challengers;
  const activeHand = hands?.find((hand) => hand?.isActive === true);

  if (!ready) {
    return <div>Loading...</div>;
  }

  return (
    <GameLayout>
      {isBigBlind && !hasSmallBlind && (
        <Share
          id={gameId}
          challengers={challengers}
          address={address}
          isBigBlind={isBigBlind}
        />
      )}

      {!isBigBlind && !hasSmallBlind && !challengers?.includes(address) && (
        <Challenge id={gameId} challengers={challengers} address={address} />
      )}

      {!isBigBlind && !hasSmallBlind && challengers?.includes(address) && (
        <Card>
          <CardHeader>
            <CardDescription>
              Waiting on the big blind to set the buy-in ...
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {isBigBlind && hasSmallBlind && !activeHand && (
        <Card>
          <CardHeader>
            <CardDescription>
              Start by creating a buy-in for the small blind ...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateHand gameId={gameId} smallBlind={game?.smallBlind} />
          </CardContent>
        </Card>
      )}

      {!isBigBlind && hasSmallBlind && !activeHand && (
        <Card>
          <CardHeader>
            <CardDescription>
              Waiting on the big blind to set the buy-in ...
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {hasSmallBlind && activeHand && (
        <Hand
          isBigBlind={isBigBlind}
          handId={activeHand._id}
          gameId={gameId}
          player={address}
        />
      )}
    </GameLayout>
  );
}
