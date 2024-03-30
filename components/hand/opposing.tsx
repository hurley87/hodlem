'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toHumanReadable } from '@/lib/utils';
import { Id } from '@/convex/_generated/dataModel';
import { usePrivy } from '@privy-io/react-auth';
import { Badge } from '../ui/badge';
import Cards from './cards';
import useProfile from '@/hooks/useProfile';
import Image from 'next/image';

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
    <div className="flex flex-col gap-2 px-2 relative w-40 mx-auto">
      <div className="flex justify-center">
        {hand?.stage === 'over' && hand?.result !== 'fold' ? (
          <Cards cards={cards} />
        ) : (
          <div className="flex gap-1">
            {[1, 2].map((card: number) => (
              <div key={card} className="bg-white rounded-md shadow-xl">
                <Image
                  alt={`card-${card}`}
                  src={`/cards/back.svg`}
                  width={75}
                  height={90}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        className={` rounded-sm absolute bottom-0 left-0 right-0 bg-white p-3 text-center shadow-lg transition-all duration-300 ease-in ${
          isActivePlayer && 'shadow-green-200'
        }`}
      >
        <div className="absolute top-0 right-0">
          {isBigBlind ? (
            <Badge className="relative bottom-3 left-3">B</Badge>
          ) : (
            <Badge className="relative bottom-3 left-3">S</Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">{profile.username}</div>
        <div className="text-sm font-bold text-muted-foreground">
          {!stack ? 0 : toHumanReadable(stack)}
        </div>
      </div>
    </div>
  );
}

export default OpposingPlayer;
