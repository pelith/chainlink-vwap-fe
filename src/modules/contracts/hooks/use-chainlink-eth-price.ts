/**
 * Reads current ETH/USD price from Chainlink Aggregator.
 * Uses formatCommonNumber for display per web3-format-number skill.
 */

import type { Address } from 'viem';
import { formatUnits } from 'viem';
import { useReadContracts } from 'wagmi';
import { env } from '@/env';
import { formatCommonNumber, parseToBigNumber } from '@/lib/bignumber';
import {
	ChainlinkAggregatorV3Abi,
	CHAINLINK_ETH_USD_FEED_SEPOLIA,
} from '@/modules/contracts/constants/abis/ChainlinkAggregatorV3';

const feedAddress = (env.VITE_CHAINLINK_ETH_USD_FEED_ADDRESS ||
	CHAINLINK_ETH_USD_FEED_SEPOLIA) as Address;

export function useChainlinkEthPrice(chainId?: number) {
	const result = useReadContracts({
		contracts: [
			{
				abi: ChainlinkAggregatorV3Abi,
				address: feedAddress,
				functionName: 'latestRoundData',
				args: [],
				chainId,
			},
			{
				abi: ChainlinkAggregatorV3Abi,
				address: feedAddress,
				functionName: 'decimals',
				args: [],
				chainId,
			},
		] as const,
		query: {
			enabled: !!chainId,
			select: (data) => {
				const [roundDataResult, decimalsResult] = data ?? [];
				const roundData =
					roundDataResult?.status === 'success'
						? roundDataResult.result
						: undefined;
				const decimalsRaw =
					decimalsResult?.status === 'success' ? decimalsResult.result : 8;
				const decimals = Number(decimalsRaw);

				const answer = roundData?.[1];
				const answerRaw =
					answer !== undefined && !Number.isNaN(decimals)
						? (typeof answer === 'bigint' ? answer : BigInt(Number(answer)))
						: undefined;

				const priceFormattedStr =
					answerRaw !== undefined ? formatUnits(answerRaw, decimals) : undefined;
				return {
					price:
						priceFormattedStr !== undefined
							? parseToBigNumber(priceFormattedStr).toNumber()
							: undefined,
					priceFormatted:
						priceFormattedStr !== undefined
							? formatCommonNumber(priceFormattedStr)
							: undefined,
				};
			},
		},
	});

	const { price, priceFormatted } = result.data ?? {};

	return {
		price,
		priceFormatted,
		isLoading: result.isLoading,
		error: result.error,
		refetch: result.refetch,
	};
}
