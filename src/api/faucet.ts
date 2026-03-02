/**
 * Faucet claim API. Requires backend GET /v1/faucet/claim?address=0x...
 * returning { v: number, r: string, s: string } (r, s hex with or without 0x).
 */

import { apiFetch } from '@/api/api-client';

export interface FaucetClaimSignature {
	v: number;
	r: `0x${string}`;
	s: `0x${string}`;
}

function ensureHexPrefix(hex: string): `0x${string}` {
	if (hex.startsWith('0x')) return hex as `0x${string}`;
	return `0x${hex}` as `0x${string}`;
}

export async function getFaucetClaimSignature(
	address: string,
): Promise<FaucetClaimSignature> {
	const params = new URLSearchParams({ address });
	const raw = (await apiFetch(
		`/v1/faucet/claim?${params.toString()}`,
	)) as { v: number; r: string; s: string };
	return {
		v: Number(raw.v),
		r: ensureHexPrefix(raw.r),
		s: ensureHexPrefix(raw.s),
	};
}
