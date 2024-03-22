'use client';
import Link from 'next/link';
import { Button } from '../ui/button';
import { usePrivy } from '@privy-io/react-auth';

function LinkFarcaster() {
  const { linkFarcaster } = usePrivy();

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
                &ldquo;Poker may be a branch of psychological warfare, an art
                form or indeed a way of life, but it is also merely a game in
                which money is simply the means of keeping score.&rdquo;
              </div>
              <footer className="text-sm">Anthony Hodlen</footer>
            </blockquote>
          </div>
        </div>
        <div className="p-20 lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Link Your Farcaster
              </h1>
              <div className="text-sm text-muted-foreground">
                All players must link their Farcaster to play
              </div>
            </div>
            <Button onClick={linkFarcaster}>Link Your Farcaster</Button>
            <div className="px-8 text-center text-sm text-muted-foreground">
              If you don&apos;t have a Farcaster profile you can create one{' '}
              <Link
                href="https://warpcast.com"
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

export default LinkFarcaster;
