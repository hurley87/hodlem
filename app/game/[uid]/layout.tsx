import { Room } from './room';

export default function GameLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return <Room>{children}</Room>;
}
