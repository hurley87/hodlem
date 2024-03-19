'use client';
import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function CheckHand({ id }: { id: Id<'hands'> }) {
  const [isChecking, setIsChecking] = useState(false);
  const checkHand = useMutation(api.hands.check);

  async function handleDealHand() {
    setIsChecking(true);

    await checkHand({
      id,
    });

    setIsChecking(false);
  }

  return (
    <div>
      <button onClick={handleDealHand}>
        {isChecking ? 'Checking...' : 'Check'}
      </button>
    </div>
  );
}

export default CheckHand;
