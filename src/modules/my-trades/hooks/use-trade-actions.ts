import type { Address } from 'viem';
import { useWriteContract } from 'wagmi';
import { VWAPRFQSpotAbi } from '@/modules/contracts/constants/abis/VWAPRFQSpot';
import { env } from '@/env';
import { TARGET_CHAIN_ID } from '@/lib/constants';

export function useSettleTrade() {
	const {
		mutate,
		mutateAsync,
		isPending,
		isSuccess,
		data: hash,
		reset,
	} = useWriteContract();

	const vwapAddress = env.VITE_VWAP_CONTRACT_ADDRESS;

	const settle = (tradeId: string) => {
		if (!vwapAddress || !tradeId) return;

		mutate({
			abi: VWAPRFQSpotAbi,
			address: vwapAddress as Address,
			functionName: 'settle',
			args: [tradeId as Address],
			chainId: TARGET_CHAIN_ID,
		});
	};

	const settleAsync = async (tradeId: string) => {
		if (!vwapAddress) throw new Error('VWAP contract address is not configured');
		if (!tradeId) throw new Error('Trade ID is required');

		return mutateAsync({
			abi: VWAPRFQSpotAbi,
			address: vwapAddress as Address,
			functionName: 'settle',
			args: [tradeId as Address],
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
	};
}

export function useRefundTrade() {
	const {
		mutate,
		mutateAsync,
		isPending,
		isSuccess,
		data: hash,
		reset,
	} = useWriteContract();

	const vwapAddress = env.VITE_VWAP_CONTRACT_ADDRESS;

	const refund = (tradeId: string) => {
		if (!vwapAddress || !tradeId) return;
		mutate({
			abi: VWAPRFQSpotAbi,
			address: vwapAddress as Address,
			functionName: 'refund',
			args: [tradeId as Address],
			chainId: TARGET_CHAIN_ID,
		});
	};

	const refundAsync = async (tradeId: string) => {
		if (!vwapAddress) throw new Error('VWAP contract address is not configured');
		if (!tradeId) throw new Error('Trade ID is required');

		return mutateAsync({
			abi: VWAPRFQSpotAbi,
			address: vwapAddress as Address,
			functionName: 'refund',
			args: [tradeId as Address],
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
	};
}

