import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { chain } from '@/constants/chain';
import Hodlem from '@/hooks/abis/Hodlem.json';

export async function POST(request: NextRequest) {
  const { onchainId } = await request.json();
  const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
  const hodlemContract = process.env
    .NEXT_PUBLIC_HODLEM_CONTRACT as `0x${string}`;
  const account = privateKeyToAccount(`0x${privateKey}`);
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const client = createWalletClient({
    account,
    chain,
    transport: http(),
  });

  const { request: writeRequest } = await publicClient.simulateContract({
    address: hodlemContract,
    abi: Hodlem.abi,
    functionName: 'settleDraw',
    args: [onchainId],
    account,
  });

  const hash = (await client?.writeContract(
    writeRequest as any
  )) as `0x${string}`;

  await publicClient.waitForTransactionReceipt({
    hash,
  });

  return NextResponse.json({ hash }, { status: 200 });
}
