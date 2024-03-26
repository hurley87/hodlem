import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useProfile from '@/hooks/useProfile';
import { toHumanReadable } from '@/lib/utils';
import Link from 'next/link';

type Props = {
  gameId: string;
  address: `0x${string}`;
};

export function GamePlay({ gameId, address }: Props) {
  const profile = useProfile({ address });

  if (!profile) {
    return null;
  }

  return (
    <Link href={`/game/${gameId}`}>
      <div className="flex justify-between items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={profile.pfp} />
            <AvatarFallback>OM</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium leading-none">
              {profile.displayName}
            </div>
            <div className="text-xs text-muted-foreground pt-0.5">
              {toHumanReadable(profile.balance)} $DEGEN
            </div>
          </div>
        </div>
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
