'use client';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';
import { usePrivy } from '@privy-io/react-auth';
import CreateHand from '@/components/hand/create';
import Challenge from '@/components/game/challenge';
import Hand from '@/components/game/hand';

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
    <>
      <h1>game: {params.uid}</h1>
      {isBigBlind && !hasSmallBlind && (
        <div>
          <p>Share this link with a friend</p>
          {challengers.map((challenger: `0x${string}`) => {
            return (
              <div key={challenger}>
                <p>{challenger}</p>

                {isBigBlind && (
                  <CreateHand gameId={gameId} smallBlind={challenger} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {!isBigBlind && !hasSmallBlind && !challengers?.includes(address) && (
        <Challenge id={gameId} challengers={challengers} address={address} />
      )}

      {!isBigBlind && !hasSmallBlind && challengers?.includes(address) && (
        <div>waiting on big blind to set the buy-in</div>
      )}

      {isBigBlind && hasSmallBlind && !activeHand && (
        <CreateHand gameId={gameId} smallBlind={game?.smallBlind} />
      )}

      {!isBigBlind && hasSmallBlind && !activeHand && (
        <div>waiting on your big blind to set the buy-in</div>
      )}

      {hasSmallBlind && activeHand && (
        <Hand
          isBigBlind={isBigBlind}
          handId={activeHand._id}
          gameId={gameId}
          player={address}
        />
      )}
    </>
  );
}
