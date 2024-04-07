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
import {
  useOthers,
  useMyPresence,
  useEventListener,
} from '@/liveblocks.config';
import { Cursor } from './cursor';
import Loading from '@/components/loading';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
  const others = useOthers();
  const [_, updateMyPresence] = useMyPresence();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        variant: 'destructive',
      });
      router.push('/');
    }
  }, [ready, user]);

  useEventListener(({ event }) => {
    if (event.type === 'TOAST') {
      toast({
        title: event.message,
      });
    }
  });

  console.log('hands', hands);
  console.log('isBigBlind', isBigBlind);

  if (!ready && !game && !hands) {
    return <Loading />;
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const cursor = { x: Math.floor(e.clientX), y: Math.floor(e.clientY) };
    updateMyPresence({ cursor });
  }

  function handlePointerLeave(e: React.PointerEvent<HTMLDivElement>) {
    updateMyPresence({ cursor: null });
  }

  return (
    <div onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
      {others
        .filter((other) => other.presence.cursor !== null)
        .map(({ connectionId, presence }) => (
          <Cursor
            key={connectionId}
            x={presence?.cursor?.x as number}
            y={presence?.cursor?.y as number}
          />
        ))}
      <GameLayout>
        <div className="relative">
          {activeHand ? (
            <Hand
              isBigBlind={isBigBlind}
              handId={activeHand._id}
              gameId={gameId}
              player={address}
            />
          ) : (
            <>
              {isBigBlind && !hasSmallBlind && (
                <div className="w-full max-w-lg mx-auto">
                  <Share
                    id={gameId}
                    challengers={challengers}
                    address={address}
                  />
                </div>
              )}

              {!isBigBlind &&
                !hasSmallBlind &&
                !challengers?.includes(address) && (
                  <Challenge
                    id={gameId}
                    challengers={challengers}
                    address={address}
                  />
                )}

              {!isBigBlind &&
                !hasSmallBlind &&
                challengers?.includes(address) && (
                  <Card>
                    <CardHeader>
                      <CardDescription>
                        Waiting on the big blind to set the buy-in ...
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}

              {isBigBlind && hasSmallBlind && (
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

              {!isBigBlind && hasSmallBlind && (
                <Card>
                  <CardHeader>
                    <CardDescription>
                      Waiting on the big blind to set the buy-in ...
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </>
          )}
        </div>
      </GameLayout>
    </div>
  );
}
