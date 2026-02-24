/**
 * Reads ERC20 allowance(owner, spender) for checking if approval is needed.
 */

import type { Address } from 'viem';
import { erc20Abi, isAddress, zeroAddress } from 'viem';
import { useReadContract } from 'wagmi';

export function useTokenAllowance(
	owner: string | undefined,
	tokenAddress: string | undefined,
	spender: string | undefined,
	chainId?: number,
) {
	const isNative = !tokenAddress || tokenAddress.toLowerCase() === zeroAddress;

	const result = useReadContract({
		abi: erc20Abi,
		address: tokenAddress as Address,
		functionName: 'allowance',
		args: [owner as Address, spender as Address],
		chainId,
		query: {
			enabled:
				!isNative &&
				isAddress(owner ?? '') &&
				isAddress(tokenAddress ?? '') &&
				isAddress(spender ?? ''),
		},
	});

	return {
		allowance: result.data,
		allowanceRaw: result.data,
		isLoading: result.isLoading,
		refetch: result.refetch,
	};
}
