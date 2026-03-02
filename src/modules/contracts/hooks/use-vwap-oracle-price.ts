/**
 * Reads 12H VWAP price from IVWAPOracle.
 * Uses date-fns for whole-hour (整點) startTime/endTime per oracle spec.
 * Uses formatCommonNumber for display per web3-format-number skill.
 */

import { getUnixTime, startOfHour, subHours } from 'date-fns';
import { useMemo } from 'react';
import type { Address } from 'viem';
import { useReadContract, useReadContracts } from 'wagmi';
import { env } from '@/env';
import { formatCommonNumber } from '@/lib/bignumber';
import { IVWAPOracleAbi } from '@/modules/contracts/constants/abis/IVWAPOracle';
import { VWAPRFQSpotAbi } from '@/modules/contracts/constants/abis/VWAPRFQSpot';

const contractAddress = env.VITE_VWAP_CONTRACT_ADDRESS as Address | undefined;

/** Price = (USDC per 1 ETH) * 1e6, display = price / 1e6 */
const USDC_SCALE = 1e6;

export function useVwapOraclePrice(
	config: {
		startTime?: bigint;
		endTime?: bigint;
		chainId?: number;
		enabled?: boolean;
	} = {},
) {
	const { startTime: customStartTime, endTime: customEndTime, chainId, enabled: configEnabled = true } = config;

	const configResult = useReadContracts({
		contracts: [
			{
				abi: VWAPRFQSpotAbi,
				address: contractAddress!,
				functionName: 'oracle',
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
			enabled: !!contractAddress && !!chainId && configEnabled,
		},
	});

	const configData = configResult.data;
	const [oracleResult, vwapWindowResult] = configData ?? [];
	const oracleAddress =
		oracleResult?.status === 'success'
			? (oracleResult.result as Address)
			: undefined;
	const vwapWindowRaw =
		vwapWindowResult?.status === 'success' ? vwapWindowResult.result : 43200n;
	const vwapWindowSeconds = Number(vwapWindowRaw);

	const { defaultStartTime, defaultEndTime } = useMemo(() => {
		const now = new Date();
		const endTimeDate = startOfHour(now);
		const startTimeDate = subHours(endTimeDate, vwapWindowSeconds / 3600);
		return {
			defaultStartTime: BigInt(getUnixTime(startTimeDate)),
			defaultEndTime: BigInt(getUnixTime(endTimeDate)),
		};
	}, [vwapWindowSeconds]);

	const finalStartTime = customStartTime ?? defaultStartTime;
	const finalEndTime = customEndTime ?? defaultEndTime;

	const priceResult = useReadContract({
		abi: IVWAPOracleAbi,
		address: oracleAddress ?? '0x0000000000000000000000000000000000000000',
		functionName: 'getPrice',
		args: [finalStartTime, finalEndTime],
		chainId,
		query: {
			enabled: !!oracleAddress && !!chainId && configEnabled,
			select: (priceRaw: bigint | undefined) => {
				if (priceRaw === undefined)
					return { vwapPrice: undefined, vwapPriceFormatted: undefined };
				const vwapPrice = Number(priceRaw) / USDC_SCALE;
				return {
					vwapPrice,
					vwapPriceFormatted: formatCommonNumber(vwapPrice),
				};
			},
		},
	});

	const { vwapPrice, vwapPriceFormatted } = priceResult.data ?? {};

	const isLoading = configResult.isLoading || priceResult.isLoading;
	const error = configResult.error ?? priceResult.error;

	return {
		vwapPrice,
		vwapPriceFormatted,
		isLoading,
		error,
		refetch: async () => {
			await Promise.all([configResult.refetch(), priceResult.refetch()]);
		},
	};
}
