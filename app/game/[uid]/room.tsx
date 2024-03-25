'use client';
import { ReactNode } from 'react';
import { RoomProvider } from '@/liveblocks.config';
import { ClientSideSuspense } from '@liveblocks/react';
import { Id } from '@/convex/_generated/dataModel';
import Loading from '@/components/loading';

export function Room({
  children,
  gameId,
}: {
  children: ReactNode;
  gameId: Id<'games'>;
}) {
  return (
    <RoomProvider id={gameId} initialPresence={{ cursor: null }}>
      <ClientSideSuspense fallback={<Loading />}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
