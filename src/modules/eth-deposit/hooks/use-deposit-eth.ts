/**
 * WETH9 deposit hook. Calls deposit() with value (ETH wei) to wrap ETH to WETH.
 */

import type { Address } from 'viem';
import { useWriteContract } from 'wagmi';
import { WETH9DepositAbi } from '@/modules/contracts/constants/abis/WETH9';
import { TARGET_CHAIN_ID } from '@/lib/constants';

export interface UseDepositEthParams {
	wethAddress: string | undefined;
	amountRaw: bigint;
}

export function useDepositEth({
	wethAddress,
	amountRaw,
}: UseDepositEthParams) {
	const {
		mutate,
		mutateAsync,
		isPending,
		isSuccess,
		data: hash,
		reset,
	} = useWriteContract();

	const deposit = () => {
		if (!wethAddress || amountRaw <= 0n) return;

		mutate({
			abi: WETH9DepositAbi,
			address: wethAddress as Address,
			functionName: 'deposit',
			args: [],
			value: amountRaw,
			chainId: TARGET_CHAIN_ID,
		});
	};

	const depositAsync = async () => {
		if (!wethAddress) {
			throw new Error('WETH address is required');
		}
		if (amountRaw <= 0n) {
			throw new Error('Amount must be greater than 0');
		}

		return mutateAsync({
			abi: WETH9DepositAbi,
			address: wethAddress as Address,
			functionName: 'deposit',
			args: [],
			value: amountRaw,
			chainId: TARGET_CHAIN_ID,
		});
	};

	return {
		deposit,
		depositAsync,
		isPending,
		isSuccess,
		hash,
		reset,
	};
}
