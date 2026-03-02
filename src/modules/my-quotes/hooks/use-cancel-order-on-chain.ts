/**
 * Hook to execute cancelOrderHash() on VWAPRFQSpot contract and sync backend.
 * Flow: Chain tx first (source of truth) → PATCH /orders/{hash}/cancel (immediate backend update).
 */

import type { Address } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import { useWriteContract } from 'wagmi';
import { cancelOrder } from '@/api/orders.api';
import { env } from '@/env';
import { TARGET_CHAIN_ID } from '@/lib/constants';
import { VWAPRFQSpotAbi } from '@/modules/contracts/constants/abis/VWAPRFQSpot';
import { toOrderHashBytes32 } from '@/modules/marketplace/utils/fill-order-params';

const CHAIN_ID = TARGET_CHAIN_ID;

export function useCancelOrderOnChain() {
	const queryClient = useQueryClient();
	const { mutateAsync, isPending, data: hash } = useWriteContract();

	const cancelOrderAsync = async (orderHash: string, maker: string) => {
		const contractAddress = env.VITE_VWAP_CONTRACT_ADDRESS;
		if (!contractAddress) {
			throw new Error('Contract address is not configured');
		}

		const orderHashBytes32 = toOrderHashBytes32(orderHash);

		const result = await mutateAsync({
			abi: VWAPRFQSpotAbi,
			address: contractAddress as Address,
			functionName: 'cancelOrderHash',
			args: [orderHashBytes32],
			chainId: CHAIN_ID,
		});

		try {
			await cancelOrder(orderHash, maker);
		} catch {
			// Backend may already be updated by Indexer; chain tx is source of truth
		}

		queryClient.invalidateQueries({ queryKey: ['orders'] });
		queryClient.invalidateQueries({ queryKey: ['orders', orderHash] });

		return result;
	};

	return {
		cancelOrderAsync,
		isPending,
		hash,
	};
}
