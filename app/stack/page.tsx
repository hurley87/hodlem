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
import { useToast } from '@/components/ui/use-toast';
import useProfile from '@/hooks/useProfile';
import { toHumanReadable } from '@/lib/utils';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ManageStack() {
  const { user, ready } = usePrivy();
  const address = user?.wallet?.address as `0x${string}`;
  const profile = useProfile({ address });
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        variant: 'destructive',
      });
      router.push('/');
      return;
    }
  }, [ready, user]);

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
              Right now you have an authorized stack of{' '}
              {toHumanReadable(profile?.allowance)} $DEGEN.
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
