'use client';
import { GameCreate } from '@/components/game-create';

export default function NoGames() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          hodl&apos;em
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <div className="text-lg">
              &ldquo;Hodl&apos;em is to stud what chess is to checkers&rdquo;
            </div>
            <footer className="text-sm">Johnny Moss</footer>
          </blockquote>
        </div>
      </div>
      <div className="py-20 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create a Game
            </h1>
            <div className="text-sm text-muted-foreground">
              You&apos;ll have to invite a friend to play after
            </div>
          </div>
          <GameCreate />
          <div className="px-8 text-center text-sm text-muted-foreground">
            The game is Heads Up Texas Hold&apos;em and you&apos;ll start as the
            big blind after you create the buy-in.
          </div>
        </div>
      </div>
    </div>
  );
}
