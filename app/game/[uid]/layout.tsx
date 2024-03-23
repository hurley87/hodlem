import { Id } from '@/convex/_generated/dataModel';
import { Room } from './room';

export default function GameLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { uid: Id<'games'> };
}) {
  return <Room gameId={params.uid}>{children}</Room>;
}
