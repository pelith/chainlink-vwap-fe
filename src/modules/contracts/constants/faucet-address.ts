import { sepolia } from 'wagmi/chains';

const FAUCET_ADDRESS_BY_CHAIN: Partial<Record<number, `0x${string}`>> = {
	[sepolia.id]: '0x889a28163f08CdCF079C0692b23E4C586e811889' as `0x${string}`,
};

export const SEPOLIA_USDC_FAUCET_ADDRESS =
	FAUCET_ADDRESS_BY_CHAIN[sepolia.id];

export function getFaucetAddress(chainId: number): `0x${string}` | undefined {
	return FAUCET_ADDRESS_BY_CHAIN[chainId];
}