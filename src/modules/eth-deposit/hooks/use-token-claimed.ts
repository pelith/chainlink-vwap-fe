/**
 * Reads tokenClaimed(address) from USDC faucet contract.
 */

import type { Address } from 'viem';
import { useReadContract } from 'wagmi';
import { USDCFaucetAbi } from '@/modules/contracts/constants/abis/USDCFaucet';
import { getFaucetAddress } from '@/modules/contracts/constants/faucet-address';

export interface UseTokenClaimedParams {
	chainId: number;
	address: string | undefined;
}

export function useTokenClaimed({ chainId, address }: UseTokenClaimedParams) {
	const faucetAddress = getFaucetAddress(chainId);
	const { data: claimed, refetch } = useReadContract({
		abi: USDCFaucetAbi,
		address: faucetAddress,
		functionName: 'tokenClaimed',
		args: address ? [address as Address] : undefined,
		query: {
			enabled: !!faucetAddress && !!address,
		},
	});

	return {
		tokenClaimed: claimed === true,
		refetch,
		isLoading: claimed === undefined && !!address && !!faucetAddress,
	};
}
