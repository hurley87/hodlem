'use client';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { toHumanReadable } from '@/lib/utils';
import CreateHand from '../hand/create';
import Link from 'next/link';

export default function Challenger({
  id,
  address,
}: {
  id: Id<'games'>;
  address: `0x${string}`;
}) {
  const profile = useQuery(api.profiles.getByAddress, {
    address,
  });

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
              <p className="text-md font-medium leading-none">
                {profile.username === ''
                  ? profile.displayName
                  : profile.username}
              </p>
            </Link>
            <p className="text-xs leading-none text-muted-foreground pt-1">
              {toHumanReadable(parseInt(profile.degen))} $DEGEN
            </p>
          </div>
        )}
      </div>
      <CreateHand gameId={id} smallBlind={address} />
    </div>
  );
}
