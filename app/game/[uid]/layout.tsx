import { Id } from '@/convex/_generated/dataModel';
import { Room } from './room';

export default function GameLayout({
  children, // will be a page or nested layout
  params, // will be the uid
}: {
  children: React.ReactNode;
  params: { uid: Id<'games'> };
}) {
  console.log('params', params);
  const gameId = params.uid;
  return <Room gameId={gameId}>{children}</Room>;
}
