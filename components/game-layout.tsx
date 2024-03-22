import Link from 'next/link';
import { UserNav } from './user-nav';

type Props = {
  children: React.ReactNode;
};

export function GameLayout({ children }: Props) {
  return (
    <div className="flex flex-col">
      <div className="border-b">
        <div className="px-2 md:container flex h-14 max-w-screen-2xl items-center justify-between">
          <Link href="/">
            <h1 className="font-bold">hodl'em</h1>
          </Link>
          <UserNav />
        </div>
      </div>
      <div className="w-full max-w-lg mx-auto flex flex-col gap-2 pt-4 px-2">
        {children}
      </div>
    </div>
  );
}
