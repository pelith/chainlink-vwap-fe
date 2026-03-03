import type { Address } from 'viem';
import { useWriteContract } from 'wagmi';
import { env } from '@/env';
import { TARGET_CHAIN_ID } from '@/lib/constants';
import { VWAPRFQSpotAbi } from '@/modules/contracts/constants/abis/VWAPRFQSpot';
import { toOrderHashBytes32 } from '@/modules/marketplace/utils/fill-order-params';

export function useSettleTrade() {
	const {
		mutate,
		mutateAsync,
		isPending,
		isSuccess,
		data: hash,
		error,
		reset,
	} = useWriteContract();

	const vwapAddress = env.VITE_VWAP_CONTRACT_ADDRESS;

	const settle = (tradeId: string) => {
		if (!vwapAddress || !tradeId) return;

		const tradeIdBytes32 = toOrderHashBytes32(tradeId);

		mutate({
			abi: VWAPRFQSpotAbi,
			address: vwapAddress as Address,
			functionName: 'settle',
			args: [tradeIdBytes32],
			chainId: TARGET_CHAIN_ID,
		});
	};

	const settleAsync = async (tradeId: string) => {
		if (!vwapAddress) throw new Error('VWAP contract address is not configured');
		if (!tradeId) throw new Error('Trade ID is required');

		const tradeIdBytes32 = toOrderHashBytes32(tradeId);

		return mutateAsync({
			abi: VWAPRFQSpotAbi,
			address: vwapAddress as Address,
			functionName: 'settle',
			args: [tradeIdBytes32],
			chainId: TARGET_CHAIN_ID,
		});
	};

	return {
		settle,
		settleAsync,
		isPending,
		isSuccess,
		hash,
		reset,
		error,
	};
}

export function useRefundTrade() {
	const {
		mutate,
		mutateAsync,
		isPending,
		isSuccess,
		data: hash,
		error,
		reset,
	} = useWriteContract();

	const vwapAddress = env.VITE_VWAP_CONTRACT_ADDRESS;

	const refund = (tradeId: string) => {
		if (!vwapAddress || !tradeId) return;
		const tradeIdBytes32 = toOrderHashBytes32(tradeId);
		mutate({
			abi: VWAPRFQSpotAbi,
			address: vwapAddress as Address,
			functionName: 'refund',
			args: [tradeIdBytes32],
			chainId: TARGET_CHAIN_ID,
		});
	};

	const refundAsync = async (tradeId: string) => {
		if (!vwapAddress) throw new Error('VWAP contract address is not configured');
		if (!tradeId) throw new Error('Trade ID is required');

		const tradeIdBytes32 = toOrderHashBytes32(tradeId);

		return mutateAsync({
			abi: VWAPRFQSpotAbi,
			address: vwapAddress as Address,
			functionName: 'refund',
			args: [tradeIdBytes32],
			chainId: TARGET_CHAIN_ID,
		});
	};

	return {
		refund,
		refundAsync,
		isPending,
		isSuccess,
		hash,
		reset,
		error,
	};
}

