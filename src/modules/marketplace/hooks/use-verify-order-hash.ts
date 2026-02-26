/**
 * Verifies that the order struct we build matches what the contract expects.
 * If hashOrder(order) !== apiOrder.order_hash, the order struct is wrong (e.g. field mismatch).
 * Use this to debug BadSignature: order hash mismatch suggests the maker signed different data.
 */

import type { Address } from 'viem';
import { useReadContract } from 'wagmi';
import type { Order as ApiOrder } from '@/api/api.types';
import { env } from '@/env';
import { TARGET_CHAIN_ID } from '@/lib/constants';
import { VWAPRFQSpotAbi } from '@/modules/contracts/constants/abis/VWAPRFQSpot';
import {
	buildOrderStruct,
	normalizeOrderHash,
	orderHashesMatch,
} from '@/modules/marketplace/utils/fill-order-params';

const CHAIN_ID = TARGET_CHAIN_ID;

export interface VerifyOrderHashResult {
	/** Contract's hashOrder(order) result */
	contractHash: `0x${string}` | undefined;
	/** API order_hash (normalized) */
	apiHash: string;
	/** True if contract hash matches API hash */
	matches: boolean;
	isLoading: boolean;
	error: Error | null;
	/** Human-readable diagnosis */
	diagnosis: string | null;
}

export function useVerifyOrderHash(apiOrder: ApiOrder | null): VerifyOrderHashResult {
	const contractAddress = env.VITE_VWAP_CONTRACT_ADDRESS as Address | undefined;
	const order = apiOrder ? buildOrderStruct(apiOrder) : null;

	const { data: contractHash, isLoading, error } = useReadContract({
		abi: VWAPRFQSpotAbi,
		address: contractAddress ?? '0x0000000000000000000000000000000000000000',
		functionName: 'hashOrder',
		args: order ? [order] : undefined,
		chainId: CHAIN_ID,
		query: {
			enabled: !!contractAddress && !!order,
		},
	});

	const apiHash = apiOrder?.order_hash ? normalizeOrderHash(apiOrder.order_hash) : '';
	const matches = !!(
		contractHash &&
		apiOrder?.order_hash &&
		orderHashesMatch(contractHash, apiOrder.order_hash)
	);

	let diagnosis: string | null = null;
	if (contractHash && apiOrder?.order_hash) {
		if (!matches) {
			diagnosis =
				'Order hash mismatch: contract hashOrder differs from API order_hash. ' +
				'This suggests the order struct does not match what the maker signed. ' +
				'Check: chainId, contract address, and EIP-712 domain used when creating the order.';
		} else {
			diagnosis =
				'Order hash matches. If fill still fails with BadSignature, the signature may be corrupted or signed with a different domain.';
		}
	}

	return {
		contractHash,
		apiHash,
		matches,
		isLoading,
		error: error ?? null,
		diagnosis,
	};
}
