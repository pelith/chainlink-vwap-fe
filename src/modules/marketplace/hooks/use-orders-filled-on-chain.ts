/**
 * Reads on-chain status for orders via used(maker, orderHash) and getTrade(orderHash).
 * Backend indexer may lag; this ensures we show accurate fill/cancel state.
 */

import { useMemo } from 'react';
import type { Address } from 'viem';
import { useReadContracts } from 'wagmi';
import { env } from '@/env';
import { VWAPRFQSpotAbi } from '@/modules/contracts/constants/abis/VWAPRFQSpot';
import {
	normalizeOrderHash,
	toOrderHashBytes32,
} from '@/modules/marketplace/utils/fill-order-params';

const CHAIN_ID = env.VITE_TARGET_CHAIN_ID;

export type OrderOnChainStatus = 'available' | 'filled' | 'cancelled';

export interface OrderForStatus {
	order_hash: string;
	maker: string;
}

export interface UseOrdersFilledOnChainResult {
	orderStatusMap: Map<string, OrderOnChainStatus>;
	isLoading: boolean;
	error: Error | null;
}

export function useOrdersFilledOnChain(
	orders: OrderForStatus[],
	chainId: number = CHAIN_ID,
): UseOrdersFilledOnChainResult {
	const contractAddress = env.VITE_VWAP_CONTRACT_ADDRESS as Address | undefined;

	const contracts = useMemo(() => {
		if (!contractAddress) return [];
		return orders.flatMap((order) => {
			const orderHashBytes32 = toOrderHashBytes32(order.order_hash) as `0x${string}`;
			const maker = order.maker as Address;
			return [
				{
					abi: VWAPRFQSpotAbi,
					address: contractAddress,
					functionName: 'used' as const,
					args: [maker, orderHashBytes32] as const,
					chainId,
				},
				{
					abi: VWAPRFQSpotAbi,
					address: contractAddress,
					functionName: 'getTrade' as const,
					args: [orderHashBytes32] as const,
					chainId,
				},
			];
		});
	}, [orders, contractAddress, chainId]);

	const result = useReadContracts({
		contracts,
		query: {
			enabled: !!contractAddress && !!chainId && orders.length > 0,
		},
	});

	const orderStatusMap = useMemo(() => {
		const map = new Map<string, OrderOnChainStatus>();
		for (let i = 0; i < orders.length; i++) {
			const order = orders[i];
			const usedIdx = i * 2;
			const tradeIdx = i * 2 + 1;
			const usedResult = result.data?.[usedIdx];
			const tradeResult = result.data?.[tradeIdx];

			if (
				usedResult?.status === 'success' &&
				tradeResult?.status === 'success'
			) {
				const used = usedResult.result as boolean;
				const trade = tradeResult.result as {
					taker: `0x${string}`;
				};
				const zeroAddress = '0x0000000000000000000000000000000000000000' as const;
				const takerIsZero =
					!trade.taker ||
					trade.taker === zeroAddress ||
					trade.taker.toLowerCase() === zeroAddress;

				const key = normalizeOrderHash(order.order_hash);
				if (!used) {
					map.set(key, 'available');
				} else if (takerIsZero) {
					map.set(key, 'cancelled');
				} else {
					map.set(key, 'filled');
				}
			}
		}
		return map;
	}, [orders, result.data]);

	return {
		orderStatusMap,
		isLoading: result.isLoading,
		error: result.error ?? null,
	};
}
