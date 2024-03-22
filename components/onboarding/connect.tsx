'use client';
import Link from 'next/link';
import { Button } from '../ui/button';
import { usePrivy } from '@privy-io/react-auth';

function ConnectWallet() {
  const { login } = usePrivy();

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
                &ldquo;You&apos;ve got to know when to hodl&apos;em. Know when
                to fold &apos;em. Know when to walk away. And know when to
                run.&rdquo;
              </div>
              <footer className="text-sm">Kenny Rogers</footer>
            </blockquote>
          </div>
        </div>
        <div className="p-20 lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
              <div className="text-sm text-muted-foreground">
                Connect a wallet that holds $DEGEN
              </div>
            </div>
            <Button onClick={login}>Connect</Button>
            <div className="px-8 text-center text-sm text-muted-foreground">
              <Link
                href="https://www.degen.tips"
                target="_blank"
                className="underline underline-offset-4 hover:text-primary"
              >
                $DEGEN
              </Link>{' '}
              is the official currency of Hodlem. You can buy tokens{' '}
              <Link
                href="https://app.uniswap.org/swap?outputCurrency=0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed&chain=base"
                target="_blank"
                className="underline underline-offset-4 hover:text-primary"
              >
                here
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ConnectWallet;
