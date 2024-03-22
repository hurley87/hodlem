import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/convex/_generated/api';
import { toHumanReadable } from '@/lib/utils';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from 'convex/react';
import Link from 'next/link';

export function UserNav() {
  const { user, logout } = usePrivy();
  const address = user?.wallet?.address as `0x${string}`;
  const profile = useQuery(api.profiles.getByAddress, {
    address,
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.pfp} alt="@shadcn" />
            <AvatarFallback>{profile?.username}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile?.username === ''
                ? profile?.displayName
                : profile?.username}
            </p>
            {profile && (
              <p className="text-xs leading-none text-muted-foreground">
                {toHumanReadable(parseInt(profile.degen))} $DEGEN
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link target="_blank" href="https://warpcast.com/hurls">
            <DropdownMenuItem>Questions?</DropdownMenuItem>
          </Link>
          <Link href="/">
            <DropdownMenuItem>Games</DropdownMenuItem>
          </Link>
          <Link
            target="_blank"
            href="https://app.uniswap.org/swap?outputCurrency=0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed&chain=base"
          >
            <DropdownMenuItem>Buy $DEGEN</DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
