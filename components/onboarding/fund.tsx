'use client';
import { Button } from '../ui/button';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { useToast } from '../ui/use-toast';

function FundAccount() {
  const { user } = usePrivy();
  const { toast } = useToast();

  const copyAddress = () => {
    navigator.clipboard.writeText(user?.wallet?.address as string);
    toast({
      description: 'Address copied to clipboard',
    });
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
                &ldquo;No-limit hodlem: Hours of boredom followed by moments of
                sheer terror.&rdquo;
              </div>
              <footer className="text-sm">Tom McEvoy</footer>
            </blockquote>
          </div>
        </div>
        <div className="p-20 lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Buy $DEGEN Tokens
              </h1>
              <div className="text-sm text-muted-foreground">
                True degens start with at least 1,000 $DEGEN.
              </div>
            </div>
            <Link
              target="_blank"
              className="w-full"
              href="https://app.uniswap.org/swap?outputCurrency=0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed&chain=base"
            >
              <Button className="w-full">Buy</Button>
            </Link>
            <div className="px-8 text-center text-sm text-muted-foreground">
              Refresh this screen after you have $DEGEN in this wallet,{' '}
              <span className="cursor-pointer" onClick={copyAddress}>
                {user?.wallet?.address.slice(0, 6)}...
                {user?.wallet?.address.slice(-4)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FundAccount;
