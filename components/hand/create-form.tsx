'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { formatEther, parseEther } from 'viem';

function CreateHandForm({
  handleCreateHand,
  creatingHand,
  opposingStack,
  activeStack,
}: {
  handleCreateHand: (buy: number) => void;
  creatingHand: boolean;
  opposingStack: number;
  activeStack: number;
}) {
  const [buy, setBuy] = useState(100);

  return (
    <>
      <div className="flex gap-2 py-4">
        <Slider
          value={[buy]}
          onValueChange={(e) => setBuy(e[0])}
          max={opposingStack > activeStack ? activeStack : opposingStack}
          step={100}
          min={100}
        />
      </div>
      <DialogFooter>
        <Button
          className="w-full"
          disabled={creatingHand}
          onClick={(e) => handleCreateHand(buy)}
        >
          {creatingHand ? 'Betting...' : `Bet ${buy} $DEGEN`}
        </Button>
      </DialogFooter>
    </>
  );
}

export default CreateHandForm;
