'use client';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { usePrivy } from '@privy-io/react-auth';
import { GameInvite } from '@/components/game-invite';
import { GamePlay } from '@/components/game-play';
import { GameCreate } from '@/components/game-create';
import { GameLayout } from '@/components/game-layout';
import Loading from '@/components/loading';
import NoGames from '@/components/no-games';
import OnboardingWrapper from './OnboardingWrapper';

export default function Home() {
  const { user, ready } = usePrivy();
  const address = user?.wallet?.address as `0x${string}`;
  const games = useQuery(api.games.get, {
    address,
  });
  const noGames = games?.length === 0;

  if (!ready) {
    return <Loading />;
  }

  return (
    <OnboardingWrapper>
      {noGames ? (
        <NoGames />
      ) : (
        <GameLayout>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight"></h2>
              <GameCreate />
            </div>
            {games?.map((game: any) => (
              <div key={game._id}>
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
              </div>
            ))}
          </div>
        </GameLayout>
      )}
    </OnboardingWrapper>
  );
}
