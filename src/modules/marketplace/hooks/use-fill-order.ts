/**
 * Hook to execute fill() on VWAPRFQSpot contract.
 * Estimates gas first to detect reverts before prompting wallet signature.
 */

import { useAppKitAccount } from '@reown/appkit/react';
import type { Address } from 'viem';
import { usePublicClient, useWriteContract } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import type { Order as ApiOrder } from '@/api/api.types';
import { env } from '@/env';
import { VWAPRFQSpotAbi } from '@/modules/contracts/constants/abis/VWAPRFQSpot';
import { buildFillOrderArgs } from '@/modules/marketplace/utils/fill-order-params';
import { parseFillError } from '@/modules/marketplace/utils/parse-fill-error';

const CHAIN_ID = sepolia.id;

export function useFillOrder() {
	const { address } = useAppKitAccount();
	const publicClient = usePublicClient({ chainId: CHAIN_ID });
	const { mutateAsync, isPending, data: hash } = useWriteContract();

	const fillOrderAsync = async (apiOrder: ApiOrder, takerAmountIn: string) => {
		const contractAddress = env.VITE_VWAP_CONTRACT_ADDRESS;
		if (!contractAddress) {
			throw new Error('Contract address is not configured');
		}

		const { order, signature, takerAmountIn: takerAmountInRaw } =
			buildFillOrderArgs(apiOrder, takerAmountIn);

		// Estimate gas to detect reverts before prompting wallet signature
		if (publicClient && address) {
			try {
				await publicClient.estimateContractGas({
					abi: VWAPRFQSpotAbi,
					address: contractAddress as Address,
					functionName: 'fill',
					args: [order, signature, takerAmountInRaw],
					account: address as Address,
				});
			} catch (err) {
				console.error('Gas estimation failed:', err);
				throw new Error(parseFillError(err));
			}
		}

		return mutateAsync({
			abi: VWAPRFQSpotAbi,
			address: contractAddress as Address,
			functionName: 'fill',
			args: [order, signature, takerAmountInRaw],
			chainId: CHAIN_ID,
		});
	};

	return {
		fillOrderAsync,
		isPending,
		hash,
	};
}
