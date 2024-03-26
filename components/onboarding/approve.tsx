'use client';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import useChain from '@/hooks/useChain';
import { useToast } from '../ui/use-toast';
import { ToastAction } from '../ui/toast';

function Approve({ balance }: { balance: string }) {
  const { user } = usePrivy();
  const address = user?.wallet?.address as `0x${string}`;
  const [isApproving, setIsApproving] = useState(false);
  const onchain = useChain({ address });
  const { toast } = useToast();

  const approveTokenAllowance = async () => {
    setIsApproving(true);

    try {
      const receipt = await onchain?.approve({
        balance,
      });

      toast({
        title: 'Success',
        description: 'Bet made onchain',
        action: (
          <Link
            target="_blank"
            href={`https://basescan.org/tx/${receipt?.transactionHash}`}
          >
            <ToastAction altText="Try again">View transaction</ToastAction>
          </Link>
        ),
      });

      setIsApproving(false);
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Error approving token allowance',
        variant: 'destructive',
      });
      setIsApproving(false);
    }
  };

  return (
    <>
      <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            hodl&apos;em
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <div className="text-lg">
                &ldquo;Life is not always a matter of hodling good cards, but
                sometimes playing a poor hand well.&rdquo;
              </div>
              <footer className="text-sm">Jack London</footer>
            </blockquote>
          </div>
        </div>
        <div className="p-20 lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Approve $DEGEN Allowance
              </h1>
              <div className="text-sm text-muted-foreground">
                This will let you bet with $DEGEN.
              </div>
            </div>
            <Button onClick={approveTokenAllowance}>
              {isApproving ? 'Approving...' : 'Approve'}
            </Button>
            <div className="px-8 text-center text-sm text-muted-foreground">
              Review the{' '}
              <Link
                href="https://basescan.org/address/0xC8B2113c4EA4F09B44CD5A13F57a7124D800899C#code"
                target="_blank"
                className="underline underline-offset-4 hover:text-primary"
              >
                Hodlem contract
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Approve;
