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
import {
  useThreads,
  useOthers,
  useMyPresence,
  useEventListener,
} from '@/liveblocks.config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cursor } from './cursor';
import Loading from '@/components/loading';
import Link from 'next/link';
import { UserNav } from '@/components/user-nav';
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
  const { threads } = useThreads();
  const others = useOthers();
  const [_, updateMyPresence] = useMyPresence();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        variant: 'destructive',
      });
      router.push('/');
    }
  }, [user]);

  useEventListener(({ event }) => {
    if (event.type === 'TOAST') {
      toast({
        title: event.message,
      });
    }
  });

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
      <div className="w-full pb-10 block lg:hidden">
        <GameLayout>
          <Tabs defaultValue="game">
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
      <div className="min-h-screen h-full hidden lg:flex">
        <div className="w-full lg:flex justify-between">
          <div className="w-full">
            <div className="border-b">
              <div className="px-2 md:container flex h-14 max-w-screen-2xl items-center justify-between w-full">
                <Link href="/">
                  <h1 className="font-bold">hodl&apos;em</h1>
                </Link>
                <UserNav />
              </div>
            </div>
            <div className="flex w-full justify-center pt-4">
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
                  <div className="w-full max-w-lg mx-auto">
                    <Challenge
                      id={gameId}
                      challengers={challengers}
                      address={address}
                    />
                  </div>
                )}

              {!isBigBlind &&
                !hasSmallBlind &&
                challengers?.includes(address) && (
                  <div className="w-full max-w-lg mx-auto">
                    <Card>
                      <CardHeader>
                        <CardDescription>
                          Waiting on the big blind to set the buy-in ...
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
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
            </div>
          </div>

          <div className="w-full max-w-md flex flex-col h-screen justify-between bg-[#f1f5f9] p-0.5 text-xs relative">
            <div className="flex flex-col justify-normal overflow-scroll">
              {threads.reverse().map((thread) => (
                <Thread key={thread.id} thread={thread} />
              ))}
            </div>
            <Composer />
          </div>
        </div>
      </div>
    </div>
  );
}
