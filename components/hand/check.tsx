'use client';
import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '../ui/button';
import { useBroadcastEvent } from '@/liveblocks.config';

function CheckHand({ id }: { id: Id<'hands'> }) {
  const [isChecking, setIsChecking] = useState(false);
  const checkHand = useMutation(api.hands.check);
  const broadcast = useBroadcastEvent();

  async function handleDealHand() {
    setIsChecking(true);

    await checkHand({
      id,
    });

    broadcast({ type: 'TOAST', message: 'Hand checked' });

    setIsChecking(false);
  }

  return (
    <Button disabled={isChecking} onClick={handleDealHand}>
      {isChecking ? 'Checking...' : 'Check'}
    </Button>
  );
}

export default CheckHand;
