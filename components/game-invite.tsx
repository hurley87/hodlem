import { Id } from '@/convex/_generated/dataModel';
import Link from 'next/link';

type Props = {
  gameId: Id<'games'>;
  numOfChallengers: number;
};

export function GameInvite({ gameId, numOfChallengers }: Props) {
  return (
    <Link href={`/game/${gameId}`}>
      <div className="flex justify-between items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent">
        {numOfChallengers === 0 ? (
          <div>No one has joined yet</div>
        ) : (
          <div>
            {numOfChallengers}{' '}
            {numOfChallengers === 1 ? ' person has ' : ' people have '} joined
          </div>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <polyline points="15 17 20 12 15 7"></polyline>
          <path d="M4 18v-2a4 4 0 0 1 4-4h12"></path>
        </svg>
      </div>
    </Link>
  );
}
