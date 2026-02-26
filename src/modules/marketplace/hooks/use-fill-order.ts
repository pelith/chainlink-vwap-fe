/**
 * Hook to execute fill() on VWAPRFQSpot contract.
 */

import type { Address } from 'viem';
import { useWriteContract } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import type { Order as ApiOrder } from '@/api/api.types';
import { env } from '@/env';
import { VWAPRFQSpotAbi } from '@/modules/contracts/constants/abis/VWAPRFQSpot';
import { buildFillOrderArgs } from '@/modules/marketplace/utils/fill-order-params';

const CHAIN_ID = sepolia.id;

export function useFillOrder() {
	const { mutateAsync, isPending, data: hash } = useWriteContract();

	const fillOrderAsync = async (apiOrder: ApiOrder, takerAmountIn: string) => {
		const contractAddress = env.VITE_VWAP_CONTRACT_ADDRESS;
		if (!contractAddress) {
			throw new Error('Contract address is not configured');
		}

		const { order, signature, takerAmountIn: takerAmountInRaw } =
			buildFillOrderArgs(apiOrder, takerAmountIn);

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
