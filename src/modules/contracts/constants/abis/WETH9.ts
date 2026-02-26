/**
 * Minimal WETH9 ABI for deposit() - wrap ETH to WETH.
 * Only includes the deposit function to avoid bundle bloat.
 */

export const WETH9DepositAbi = [
	{
		type: 'function',
		name: 'deposit',
		inputs: [],
		outputs: [],
		stateMutability: 'payable',
	},
] as const;
