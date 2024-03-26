'use client';
import { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';
import Cards from './cards';
import { toHumanReadable } from '@/lib/utils';

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
    <Card>
      <CardHeader>
        {hand.stage === 'over' ? (
          <CardDescription className="font-bold text-black">
            {hand.resultMessage}!
          </CardDescription>
        ) : (
          <CardDescription>
            Pot: {toHumanReadable(pot || 0)} $DEGEN
          </CardDescription>
        )}
      </CardHeader>
      {flopCards && (
        <CardContent>
          <div className="flex flex-col md:flex-row gap-2">
            <div>
              <h2
                className={`${
                  hand.stage === 'flop' && 'font-bold text-black'
                } text-sm pb-1 text-muted-foreground`}
              >
                Flop
              </h2>
              <Cards cards={flopCards} />
            </div>
            {turnCard && (
              <div className="flex gap-2">
                <div>
                  <h2
                    className={`${
                      hand.stage === 'turn' && 'font-bold text-black'
                    } text-sm pb-1 text-muted-foreground`}
                  >
                    Turn
                  </h2>
                  <Cards cards={[turnCard]} />
                </div>
                {riverCard && (
                  <div>
                    <h2
                      className={`${
                        hand.stage === 'river' && 'font-bold text-black'
                      } text-sm pb-1 text-muted-foreground`}
                    >
                      River
                    </h2>
                    <Cards cards={[riverCard]} />
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default Table;
