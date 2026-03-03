/**
 * Hook to claim USDC from faucet. Fetches v,r,s from API then calls contract claimToken(v,r,s).
 */

import type { Address } from 'viem';
import { useWriteContract } from 'wagmi';
import { USDCFaucetAbi } from '@/modules/contracts/constants/abis/USDCFaucet';
import { getFaucetAddress } from '@/modules/contracts/constants/faucet-address';

export interface UseClaimFaucetParams {
	chainId: number;
	address: string | undefined;
}

export function useClaimFaucet({ chainId, address }: UseClaimFaucetParams) {
	const faucetAddress = getFaucetAddress(chainId);
	const {
		mutateAsync: writeContractAsync,
		isPending,
		data: hash,
		reset,
	} = useWriteContract();

	const claimAsync = async () => {
		if (!address) throw new Error('Wallet address is required');
		if (!faucetAddress) throw new Error('Faucet not available on this network');

		return writeContractAsync({
			abi: USDCFaucetAbi,
			address: faucetAddress as Address,
			functionName: 'claimToken',
			args: [],
			chainId,
		});
	};

	return {
		claimAsync,
		isPending,
		hash,
		reset,
		isSupported: !!faucetAddress,
	};
}
