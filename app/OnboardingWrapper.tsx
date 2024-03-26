'use client';
import { usePrivy } from '@privy-io/react-auth';
import ConnectWallet from '@/components/onboarding/connect';
import LinkFarcaster from '@/components/onboarding/link';
import FundAccount from '@/components/onboarding/fund';
import Approve from '@/components/onboarding/approve';
import Loading from '@/components/loading';
import useProfile from '@/hooks/useProfile';

function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  const { user, ready } = usePrivy();
  const address = user?.wallet?.address as `0x${string}`;
  const profile = useProfile({ address });
  const hasFarcasterLinked = user?.farcaster;

  if (!ready) {
    return <Loading />;
  }

  const noBalance = profile?.balance === 0;
  const hasBalanceButNoAllowance =
    profile?.balance !== 0 && profile?.allowance === 0;

  return (
    <div className="md:pt-0">
      {/* user must connect their account */}
      {!user && <ConnectWallet />}

      {/* user must link their Farcaster account */}
      {user && !hasFarcasterLinked && <LinkFarcaster />}

      {/* user must have DEGEN */}
      {user && hasFarcasterLinked && noBalance && <FundAccount />}

      {/* user must allow Hodlem contract to transfer tokens */}
      {user && hasFarcasterLinked && hasBalanceButNoAllowance && (
        <Approve balance={profile.balance.toString()} />
      )}

      {/* let user see page if they fit the requirements above */}
      {user && hasFarcasterLinked && profile.allowance !== 0 && children}
    </div>
  );
}

export default OnboardingWrapper;
