/**
 * Reads USDC and WETH token addresses from VWAPRFQSpot contract.
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
