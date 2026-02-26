/**
 * Builds fill() contract args from API Order and taker deposit amount.
 */

import { parseSignature, parseUnits, serializeSignature } from 'viem';
import type { Order as ApiOrder } from '@/api/api.types';

const USDC_DECIMALS = 6;
const WETH_DECIMALS = 18;

/**
 * Robust signature normalization for EOA and Account Abstraction.
 * Supports EIP-2098, Standard ECDSA, and ERC-1271.
 */
function normalizeSignature(sig: string): `0x${string}` {
  const hex = serializeSignature(parseSignature(sig as `0x${string}`));
  return hex as `0x${string}`;
}

export function normalizeOrderHash(hash: string): string {
	const trimmed = hash.trim().toLowerCase();
	return trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`;
}

export type FillOrderStruct = {
	maker: `0x${string}`;
	makerIsSellETH: boolean;
	amountIn: bigint;
	minAmountOut: bigint;
	deltaBps: number;
	salt: bigint;
	deadline: bigint;
};

export interface FillOrderArgs {
	order: FillOrderStruct;
	signature: `0x${string}`;
	takerAmountIn: bigint;
}

/**
 * Builds the order struct for fill/hashOrder (without signature, takerAmountIn).
 * Use for verification: compare contract hashOrder(order) with API order_hash.
 */
export function buildOrderStruct(apiOrder: ApiOrder): FillOrderStruct {
	return {
		maker: apiOrder.maker as `0x${string}`,
		makerIsSellETH: apiOrder.maker_is_sell_eth,
		amountIn: BigInt(apiOrder.amount_in),
		minAmountOut: BigInt(apiOrder.min_amount_out),
		deltaBps: apiOrder.delta_bps,
		salt: BigInt(apiOrder.salt),
		deadline: BigInt(apiOrder.deadline),
	};
}

/**
 * Returns true if API order_hash matches what the contract would compute for our order struct.
 * Use to debug BadSignature: if this is false, the order struct differs from what was signed.
 */
export function orderHashesMatch(contractHash: `0x${string}`, apiOrderHash: string): boolean {
	return normalizeOrderHash(contractHash) === normalizeOrderHash(apiOrderHash);
}

/**
 * Builds fill() contract arguments from ApiOrder and human-readable taker amount.
 * Taker deposit token: USDC when Maker sells WETH, WETH when Maker sells USDC.
 */
export function buildFillOrderArgs(
	apiOrder: ApiOrder,
	takerAmountIn: string,
): FillOrderArgs {
	if (!apiOrder.signature) {
		throw new Error('Order signature is required for fill');
	}

	const makerIsSellETH = apiOrder.maker_is_sell_eth;
	const decimals = makerIsSellETH ? USDC_DECIMALS : WETH_DECIMALS;
	const order = buildOrderStruct(apiOrder);
	const signature = normalizeSignature(apiOrder.signature);
	const takerAmountInRaw = parseUnits(takerAmountIn, decimals);

	return {
		order,
		signature,
		takerAmountIn: takerAmountInRaw,
	};
}
