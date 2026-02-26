/**
 * Reads USDC, WETH token addresses and constants from VWAPRFQSpot contract.
 */

import type { Address } from 'viem';
import { useReadContracts } from 'wagmi';
import { env } from '@/env';
import { VWAPRFQSpotAbi } from '@/modules/contracts/constants/abis/VWAPRFQSpot';

const contractAddress = env.VITE_VWAP_CONTRACT_ADDRESS as Address | undefined;

export function useVwapRfqTokenAddresses(chainId?: number) {
	const result = useReadContracts({
		contracts: [
			{
				abi: VWAPRFQSpotAbi,
				address: contractAddress!,
				functionName: 'USDC',
				args: [],
				chainId,
			},
			{
				abi: VWAPRFQSpotAbi,
				address: contractAddress!,
				functionName: 'WETH',
				args: [],
				chainId,
			},
		] as const,
		query: {
			enabled: !!contractAddress && !!chainId,
		},
	});

	const [usdcResult, wethResult] = result.data ?? [];
	const usdc = usdcResult?.status === 'success' ? usdcResult.result : undefined;
	const weth = wethResult?.status === 'success' ? wethResult.result : undefined;

	return {
		usdc: usdc as Address | undefined,
		weth: weth as Address | undefined,
		contractAddress,
		isLoading: result.isLoading,
		refetch: result.refetch,
	};
}

export function useVwapRfqConstants(chainId?: number) {
	const result = useReadContracts({
		contracts: [
			{
				abi: VWAPRFQSpotAbi,
				address: contractAddress!,
				functionName: 'REFUND_GRACE',
				args: [],
				chainId,
			},
			{
				abi: VWAPRFQSpotAbi,
				address: contractAddress!,
				functionName: 'VWAP_WINDOW',
				args: [],
				chainId,
			},
		] as const,
		query: {
			enabled: !!contractAddress && !!chainId,
		},
	});

	const [refundGraceResult, vwapWindowResult] = result.data ?? [];
	const refundGrace = refundGraceResult?.status === 'success' ? (refundGraceResult.result as bigint) : undefined;
	const vwapWindow = vwapWindowResult?.status === 'success' ? (vwapWindowResult.result as bigint) : undefined;

	return {
		refundGrace: refundGrace ? Number(refundGrace) : undefined,
		vwapWindow: vwapWindow ? Number(vwapWindow) : undefined,
		isLoading: result.isLoading,
		refetch: result.refetch,
	};
}
