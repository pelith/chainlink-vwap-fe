/**
 * ERC20 approve write hook. Use when user needs to approve spender for token transfer.
 */

import type { Address } from 'viem';
import { erc20Abi, maxUint256 } from 'viem';
import { useWriteContract } from 'wagmi';

export interface UseApproveTokenParams {
	tokenAddress: string | undefined;
	spender: string | undefined;
	amount?: bigint;
	chainId?: number;
}

/**
 * Approve ERC20 token for spender. When amount is omitted, uses maxUint256 for unlimited approval.
 */
export function useApproveToken({
	tokenAddress,
	spender,
	amount = maxUint256,
	chainId,
}: UseApproveTokenParams) {
	const {
		mutate,
		mutateAsync,
		isPending,
		isSuccess,
		data: hash,
		reset,
	} = useWriteContract();

	const approve = () => {
		if (!tokenAddress || !spender) return;
		mutate({
			abi: erc20Abi,
			address: tokenAddress as Address,
			functionName: 'approve',
			args: [spender as Address, amount],
			chainId,
		});
	};

	const approveAsync = async () => {
		if (!tokenAddress || !spender) {
			throw new Error('tokenAddress and spender are required');
		}
		return mutateAsync({
			abi: erc20Abi,
			address: tokenAddress as Address,
			functionName: 'approve',
			args: [spender as Address, amount],
			chainId,
		});
	};

	return {
		approve,
		approveAsync,
		isPending,
		isSuccess,
		hash,
		reset,
	};
}
