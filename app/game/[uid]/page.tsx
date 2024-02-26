'use client';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';

export default function Game({ params }: { params: { uid: Id<'games'> } }) {
  const gameId = params.uid;
  const game = useQuery(api.games.getGame, {
    gameId,
  });
  console.log(game);
  return <div>{params.uid}</div>;
}
