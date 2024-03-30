'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';

function CreateHandForm({
  handleCreateHand,
  creatingHand,
  opposingStack,
  activeStack,
  raiseAmount,
}: {
  handleCreateHand: (buy: number) => void;
  creatingHand: boolean;
  opposingStack: number;
  activeStack: number;
  raiseAmount: number;
}) {
  const [buy, setBuy] = useState(raiseAmount);

  return (
    <>
      <div className="flex gap-2 py-4">
        <Slider
          value={[buy]}
          onValueChange={(e) => setBuy(e[0])}
          max={opposingStack > activeStack ? activeStack : opposingStack}
          step={100}
          min={raiseAmount}
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
