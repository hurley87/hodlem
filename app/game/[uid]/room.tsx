'use client';
import { ReactNode } from 'react';
import { RoomProvider } from '@/liveblocks.config';
import { ClientSideSuspense } from '@liveblocks/react';
import { Id } from '@/convex/_generated/dataModel';

export function Room({
  children,
  gameId,
}: {
  children: ReactNode;
  gameId: Id<'games'>;
}) {
  return (
    <RoomProvider id={gameId} initialPresence={{ cursor: null }}>
      <ClientSideSuspense fallback={<div>Loading…</div>}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
