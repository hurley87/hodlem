import { useToast } from '@/components/ui/use-toast';
import {
  type WalletClient,
  createWalletClient,
  custom,
  type Chain,
} from 'viem';

type WalletClientType = {
  chain: Chain;
  wallet: any;
};

const useWalletClient = async ({ chain, wallet }: WalletClientType) => {
  const { toast } = useToast();

  if (!wallet) return null;

  try {
    // Switch your wallet to your target chain before getting the viem WalletClient
    await wallet?.switchChain(chain.id);
    // Get an EIP1193 provider from the user's wallet
    const ethereumProvider = await wallet?.getEthereumProvider();
    // get address from wallet
    const account = wallet?.address as `0x${string}`;
    // Create a Viem wallet client from the EIP1193 provider
    const walletClient = await createWalletClient({
      account,
      chain,
      transport: custom(ethereumProvider),
    });

    return walletClient as WalletClient;
  } catch (e) {
    toast({
      title: 'Error',
      description: 'switch to the Base network',
      variant: 'destructive',
    });
  }
};

export default useWalletClient;
