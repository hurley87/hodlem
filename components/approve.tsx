'use client';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import useChain from '@/hooks/useChain';
import { toHumanReadable } from '@/lib/utils';
import { ToastAction } from '@radix-ui/react-toast';
import Link from 'next/link';
import { useState } from 'react';
import Switch from './switch';

export default function Approve({
  address,
  balance,
}: {
  address: `0x${string}`;
  balance: string;
}) {
  const [isApproving, setIsApproving] = useState(false);
  const onchain = useChain({ address });
  const isRightChain = onchain?.isRightChain;

  const approveTokenAllowance = async () => {
    setIsApproving(true);

    try {
      const receipt = await onchain?.approve({
        balance,
      });

      toast({
        title: 'Success',
        description: 'Token transfer approved',
        action: (
          <Link
            target="_blank"
            href={`https://basescan.org/tx/${receipt?.transactionHash}`}
          >
            <ToastAction altText="Try again">View transaction</ToastAction>
          </Link>
        ),
      });

      setIsApproving(false);
    } catch (e) {
      console.log(e);
      toast({
        title: 'Error',
        description: 'Error approving token allowance',
        variant: 'destructive',
      });
      setIsApproving(false);
    }
  };

  return (
    <>
      {!isRightChain ? (
        <Switch wallet={onchain?.wallet} />
      ) : (
        <Button onClick={approveTokenAllowance} className="w-full">
          {isApproving
            ? 'Approving...'
            : `Approve ${toHumanReadable(parseInt(balance))} $DEGEN`}
        </Button>
      )}
    </>
  );
}
