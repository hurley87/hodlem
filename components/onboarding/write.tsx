'use client';
import { Button } from '../ui/button';
import { useExperimentalFarcasterSigner } from '@privy-io/react-auth';

function Write() {
  const { requestFarcasterSigner } = useExperimentalFarcasterSigner();

  return (
    <>
      <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            hodl &apos;em
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
        <div className="p-10 lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Authorize Write Access
              </h1>
              <div className="text-sm text-muted-foreground">
                This will allow you to share games and chat with friends while
                you play.
              </div>
            </div>
            <Button onClick={() => requestFarcasterSigner()}>
              Authorize my Farcaster signer
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Write;
