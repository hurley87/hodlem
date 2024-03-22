'use client';
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';

export default function Challenge({
  id,
  challengers,
  address,
}: {
  id: Id<'games'>;
  challengers: string[];
  address: `0x${string}`;
}) {
  const updateGame = useMutation(api.games.challenge);

  const handleChallenge = async () => {
    if (challengers?.includes(address)) return;
    challengers?.push(address);
    await updateGame({ id, challengers });
  };

  return (
    <Card>
      <CardHeader>
        <CardDescription>
          Ask to join this game as the small blind
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={handleChallenge}>
          Ask
        </Button>
      </CardContent>
    </Card>
  );
}
