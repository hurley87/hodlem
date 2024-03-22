'use client';
import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';

type Props = {
  id: Id<'hands'>;
  gameId: Id<'games'>;
};

function DealHand({ id, gameId }: Props) {
  const [isDealing, setIsDealing] = useState(false);
  const dealHand = useMutation(api.hands.deal);

  async function handleDealHand() {
    setIsDealing(true);

    await dealHand({
      id,
      gameId,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardDescription>Deal cards to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={handleDealHand}>
          {isDealing ? 'Dealing...' : 'Deal'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default DealHand;
