/**
 * Builds fill() contract args from API Order and taker deposit amount.
 */

import { parseUnits } from 'viem';
import type { Order as ApiOrder } from '@/api/api.types';

const USDC_DECIMALS = 6;
const WETH_DECIMALS = 18;

/**
 * Expands EIP-2098 compact (64-byte) signature to standard 65-byte (r,s,v) format.
 * OpenZeppelin ECDSA.recover only accepts 65 bytes.
 */
function expandCompactSignature(hex: string): string {
	const r = hex.slice(0, 64);
	const vs = BigInt('0x' + hex.slice(64, 128));
	const sMask = (1n << 255n) - 1n;
	const s = (vs & sMask).toString(16).padStart(64, '0');
	const v = Number((vs >> 255n) & 1n) + 27;
	return r + s + v.toString(16).padStart(2, '0');
}

/**
 * Normalizes EIP-712 signature for contract.fill().
 * - Ensures 0x prefix
 * - Expands 64-byte EIP-2098 compact to 65-byte standard if needed
 * - Fixes v: OpenZeppelin ECDSA requires v=27 or 28; some wallets return v=0 or 1
 */
function normalizeSignature(sig: string): `0x${string}` {
	const trimmed = sig.trim();
	if (!trimmed) throw new Error('Signature is required');
	let hex = trimmed.startsWith('0x') ? trimmed.slice(2) : trimmed;
	if (hex.length === 128) {
		hex = expandCompactSignature(hex);
	} else if (hex.length !== 130) {
		throw new Error(`Signature must be 64 or 65 bytes (got ${hex.length / 2})`);
	}
	const vByte = Number.parseInt(hex.slice(128, 130), 16);
	if (vByte === 0 || vByte === 1) {
		hex = hex.slice(0, 128) + (vByte + 27).toString(16).padStart(2, '0');
	}
	return (`0x${hex}`) as `0x${string}`;
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
