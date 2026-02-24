/**
 * Chainlink Aggregator V2V3 interface - for reading ETH/USD price feed.
 * Sepolia ETH/USD: 0x694AA1769357215DE4FAC081bf1f309aDC325306
 */

export const ChainlinkAggregatorV3Abi = [
	{
		type: 'function',
		name: 'latestAnswer',
		inputs: [],
		outputs: [{ name: '', type: 'int256', internalType: 'int256' }],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'latestRoundData',
		inputs: [],
		outputs: [
			{ name: 'roundId', type: 'uint80', internalType: 'uint80' },
			{ name: 'answer', type: 'int256', internalType: 'int256' },
			{ name: 'startedAt', type: 'uint256', internalType: 'uint256' },
			{ name: 'updatedAt', type: 'uint256', internalType: 'uint256' },
			{ name: 'answeredInRound', type: 'uint80', internalType: 'uint80' },
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'decimals',
		inputs: [],
		outputs: [{ name: '', type: 'uint8', internalType: 'uint8' }],
		stateMutability: 'view',
	},
] as const;

/** Sepolia ETH/USD price feed address */
export const CHAINLINK_ETH_USD_FEED_SEPOLIA =
	'0x694AA1769357215DE4FAC081bf1f309aDC325306' as const;
