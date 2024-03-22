'use client';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { usePrivy } from '@privy-io/react-auth';
import OnboardingWrapper from './OnboardingWrapper';
import { GameInvite } from '@/components/game-invite';
import { GamePlay } from '@/components/game-play';
import { GameCreate } from '@/components/game-create';
import { GameLayout } from '@/components/game-layout';

export default function Home() {
  const { user, ready } = usePrivy();
  const address = user?.wallet?.address as `0x${string}`;
  const games = useQuery(api.games.get, {
    address,
  });

  if (!ready) {
    return <div>Loading...</div>;
  }

  return (
    <OnboardingWrapper>
      {games?.length === 0 && (
        <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
          <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
            <div className="absolute inset-0 bg-zinc-900" />
            <div className="relative z-20 flex items-center text-lg font-medium">
              hodl&apos;em
            </div>
            <div className="relative z-20 mt-auto">
              <blockquote className="space-y-2">
                <p className="text-lg">
                  &ldquo;Hodl&apos;em is to stud what chess is to
                  checkers&rdquo;
                </p>
                <footer className="text-sm">Johnny Moss</footer>
              </blockquote>
            </div>
          </div>
          <div className="py-20 lg:p-8">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Create a Game
                </h1>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll have to invite a friend to play after
                </p>
              </div>
              <GameCreate />
              <p className="px-8 text-center text-sm text-muted-foreground">
                The game is Heads Up Texas Hold&apos;em and you&apos;ll start as
                the big blind after you create the buy-in.
              </p>
            </div>
          </div>
        </div>
      )}
      {!games?.length
        ? null
        : games?.length > 0 && (
            <GameLayout>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold tracking-tight"></h2>
                  <GameCreate />
                </div>
                {games?.map((game: any) => (
                  <>
                    {game.smallBlind === '' && (
                      <GameInvite
                        key={game._id}
                        gameId={game._id}
                        numOfChallengers={game.challengers.length}
                      />
                    )}
                    {game.smallBlind !== '' && (
                      <GamePlay
                        key={game._id}
                        gameId={game._id}
                        address={
                          address === game.smallBlind
                            ? game.bigBlind
                            : game.smallBlind
                        }
                      />
                    )}
                  </>
                ))}
              </div>
            </GameLayout>
          )}
    </OnboardingWrapper>
  );
}
