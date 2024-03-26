'use client';
import { Id } from '@/convex/_generated/dataModel';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { toHumanReadable } from '@/lib/utils';
import CreateHand from '../hand/create';
import Link from 'next/link';
import useProfile from '@/hooks/useProfile';

export default function Challenger({
  id,
  address,
}: {
  id: Id<'games'>;
  address: `0x${string}`;
}) {
  const profile = useProfile({ address });

  return (
    <div className="flex items-center justify-between space-x-4">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src={profile?.pfp} />
          <AvatarFallback>OM</AvatarFallback>
        </Avatar>
        {profile && (
          <div className="flex-col gap-1">
            <Link
              target="_blank"
              href={`https://warpcast.com/${profile.username}`}
            >
              <div className="text-md font-medium leading-none">
                {profile.username === ''
                  ? profile.displayName
                  : profile.username}
              </div>
            </Link>
            <div className="text-xs leading-none text-muted-foreground pt-1">
              {toHumanReadable(profile.balance)} $DEGEN
            </div>
          </div>
        )}
      </div>
      <CreateHand gameId={id} smallBlind={address} />
    </div>
  );
}
