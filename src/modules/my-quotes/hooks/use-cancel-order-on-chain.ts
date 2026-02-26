/**
 * Hook to execute cancelOrderHash() on VWAPRFQSpot contract and sync backend.
 * Flow: Chain tx first (source of truth) → PATCH /orders/{hash}/cancel (immediate backend update).
 */

import type { Address } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import { useWriteContract } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { cancelOrder } from '@/api/orders.api';
import { env } from '@/env';
import { VWAPRFQSpotAbi } from '@/modules/contracts/constants/abis/VWAPRFQSpot';

const CHAIN_ID = sepolia.id;

function toOrderHashBytes32(hash: string): `0x${string}` {
	const trimmed = hash.trim();
	return (trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`) as `0x${string}`;
}

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
