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
import { Composer, Thread } from '@liveblocks/react-comments';
import { useThreads, useOthers, useMyPresence } from '@/liveblocks.config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cursor } from './cursor';
import Loading from '@/components/loading';

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
  const { threads } = useThreads();
  const others = useOthers();
  const [_, updateMyPresence] = useMyPresence();

  if (!ready) {
    return <Loading />;
  }

  // Update cursor coordinates on pointer move
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const cursor = { x: Math.floor(e.clientX), y: Math.floor(e.clientY) };
    updateMyPresence({ cursor });
  }

  // Set cursor to null on pointer leave
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
        <Tabs defaultValue="game" className="w-full pb-10">
          <TabsList className="w-full">
            <TabsTrigger className="w-full" value="game">
              Game
            </TabsTrigger>
            <TabsTrigger className="w-full" value="chat">
              Chat
            </TabsTrigger>
          </TabsList>
          <TabsContent value="game">
            {isBigBlind && !hasSmallBlind && (
              <Share
                id={gameId}
                challengers={challengers}
                address={address}
                isBigBlind={isBigBlind}
              />
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
          </TabsContent>
          <TabsContent className="bg-[#f1f5f9] p-1" value="chat">
            {threads.reverse().map((thread) => (
              <Thread key={thread.id} thread={thread} />
            ))}
            <Composer />
          </TabsContent>
        </Tabs>
      </GameLayout>
    </div>
  );
}
