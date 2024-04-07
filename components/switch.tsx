'use client';
import { Button } from '@/components/ui/button';
import { chain } from '@/constants/chain';
import { useState } from 'react';

export default function Switch({ wallet }: { wallet: any }) {
  const [isSwitching, setIsSwitching] = useState(false);

  const switchNetwork = async () => {
    setIsSwitching(true);
    await wallet?.switchChain(chain.id);
    window.location.reload();
  };

  return (
    <Button className="w-full" disabled={isSwitching} onClick={switchNetwork}>
      {isSwitching ? 'Switching...' : 'Switch to Base'}
    </Button>
  );
}
