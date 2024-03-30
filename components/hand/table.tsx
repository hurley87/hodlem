'use client';
import { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Cards from './cards';
import { toHumanReadable } from '@/lib/utils';
import { Badge } from '../ui/badge';

type Props = {
  handId: Id<'hands'>;
  pot: number | undefined;
};

function Table({ handId, pot }: Props) {
  const hand = useQuery(api.hands.getHand, {
    handId,
  }) as any;

  if (!hand) return null;

  const flopCards = hand.flopCards;
  const turnCard = hand.turnCard;
  const riverCard = hand.riverCard;

  return (
    <div className="shadow-2xl rounded-3xl p-3 lg:p-10 bg-gradient-to-r from-slate-200 to-slate-100">
      <div className="flex justify-center">
        {hand.stage === 'over' ? (
          <div className="font-black ">{hand.resultMessage}!</div>
        ) : (
          <Badge>Pot: {toHumanReadable(pot || 0)} $DEGEN</Badge>
        )}
      </div>
      <div className="flex justify-center pt-6 gap-1">
        {!flopCards && <Cards cards={['back', 'back', 'back']} />}
        {flopCards && (
          <Cards cards={flopCards.filter((card: string) => card !== 'back')} />
        )}
        {turnCard && <Cards cards={[turnCard]} />}
        {riverCard && <Cards cards={[riverCard]} />}
      </div>
    </div>
  );
}

export default Table;
