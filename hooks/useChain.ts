import { Address, createPublicClient, http, parseEther } from 'viem';
import { chain } from '@/constants/chain';
import Hodlem from '@/hooks/abis/Hodlem.json';
import { useWallets } from '@privy-io/react-auth';
import useWalletClient from './useWalletClient';
import Degen from './abis/Degen.json';

export default function useChain({ address }: { address: Address }) {
  if (!address) {
    return null;
  }
  const degenContract = process.env.NEXT_PUBLIC_DEGEN_CONTRACT as `0x${string}`;
  const hodlemContract = process.env
    .NEXT_PUBLIC_HODLEM_CONTRACT as `0x${string}`;
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });
  const { wallets } = useWallets();
  const wallet = wallets.filter((wallet) => wallet?.address === address)[0];
  const walletClient = useWalletClient({ chain, wallet });
  const account = address as `0x${string}`;

  const bet = async ({
    onchainId,
    betAmount,
  }: {
    onchainId: string;
    betAmount: string;
  }) => {
    const { request } = await publicClient.simulateContract({
      address: hodlemContract,
      abi: Hodlem.abi,
      functionName: 'makeBet',
      args: [onchainId, parseEther(betAmount)],
      account,
    });

    const client = await walletClient;
    const hash = (await client?.writeContract(request as any)) as `0x${string}`;

    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
    });

    return receipt;
  };

  const createHand = async ({
    buyIn,
    smallBlind,
  }: {
    buyIn: string;
    smallBlind: string;
  }) => {
    const { request } = await publicClient.simulateContract({
      address: hodlemContract,
      abi: Hodlem.abi,
      functionName: 'createHand',
      args: [parseEther(buyIn), smallBlind],
      account,
    });

    const client = await walletClient;
    const hash = (await client?.writeContract(request as any)) as `0x${string}`;

    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
    });

    return receipt;
  };

  const approve = async ({ balance }: { balance: string }) => {
    const { request } = await publicClient.simulateContract({
      address: degenContract,
      abi: Degen.abi,
      functionName: 'approve',
      args: [hodlemContract, parseEther(balance)],
      account,
    });

    const client = await walletClient;
    const hash = (await client?.writeContract(request as any)) as `0x${string}`;

    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
    });

    return receipt;
  };

  const call = async ({
    onchainId,
    betAmount,
  }: {
    onchainId: string;
    betAmount: string;
  }) => {
    const { request } = await publicClient.simulateContract({
      address: hodlemContract,
      abi: Hodlem.abi,
      functionName: 'makeBet',
      args: [onchainId, parseEther(betAmount)],
      account,
    });

    const client = await walletClient;
    const hash = (await client?.writeContract(request as any)) as `0x${string}`;

    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
    });

    return receipt;
  };

  const cancel = async ({ onchainId }: { onchainId: string }) => {
    const { request } = await publicClient.simulateContract({
      address: hodlemContract,
      abi: Hodlem.abi,
      functionName: 'cancelHand',
      args: [onchainId],
      account,
    });

    const client = await walletClient;
    const hash = (await client?.writeContract(request as any)) as `0x${string}`;

    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
    });

    return receipt;
  };

  const join = async ({ onchainId }: { onchainId: string }) => {
    const { request } = await publicClient.simulateContract({
      address: hodlemContract,
      abi: Hodlem.abi,
      functionName: 'joinHand',
      args: [onchainId],
      account,
    });

    const client = await walletClient;
    const hash = (await client?.writeContract(request as any)) as `0x${string}`;

    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
    });

    return receipt;
  };

  return {
    bet,
    createHand,
    approve,
    call,
    cancel,
    join,
  };
}
