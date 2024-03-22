'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

function CreateHandForm({
  handleCreateHand,
  creatingHand,
  opposingStack,
}: {
  handleCreateHand: (buy: number) => void;
  creatingHand: boolean;
  opposingStack: number;
}) {
  const [buy, setBuy] = useState(100);

  return (
    <>
      <div className="flex gap-2 py-4">
        <Label className="text-xl font-bold text-center">{buy} $DEGEN</Label>
        <Slider
          value={[buy]}
          onValueChange={(e) => setBuy(e[0])}
          max={opposingStack}
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
          {creatingHand ? 'Betting...' : `Bet`}
        </Button>
      </DialogFooter>
    </>
  );
}

export default CreateHandForm;
