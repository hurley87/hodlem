'use client';
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';
import OnboardingWrapper from '@/app/OnboardingWrapper';

export default function Challenge({
  id,
  challengers,
  address,
}: {
  id: Id<'games'>;
  challengers: string[];
  address: `0x${string}`;
}) {
  const updateGame = useMutation(api.games.challenge);

  const handleChallenge = async () => {
    if (challengers?.includes(address)) return;
    challengers?.push(address);
    await updateGame({ id, challengers });
  };

  return (
    <OnboardingWrapper>
      <button onClick={handleChallenge}>Ask to join</button>
    </OnboardingWrapper>
  );
}
