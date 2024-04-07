'use client';
import Approve from '@/components/approve';
import { GameLayout } from '@/components/game-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import useProfile from '@/hooks/useProfile';
import { toHumanReadable } from '@/lib/utils';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';

export default function ManageStack() {
  const { user } = usePrivy();
  const address = user?.wallet?.address as `0x${string}`;
  const profile = useProfile({ address });

  return (
    <GameLayout>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardDescription>
              Right now you have a $DEGEN balance of{' '}
              {toHumanReadable(profile?.balance)}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              target="_blank"
              href="https://app.uniswap.org/swap?outputCurrency=0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed&chain=base"
            >
              <Button className="w-full">Buy more $DEGEN</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>
              You have a stack of {toHumanReadable(profile?.allowance)} $DEGEN.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Approve address={address} balance={profile?.balance?.toString()} />
          </CardContent>
        </Card>
      </div>
    </GameLayout>
  );
}
