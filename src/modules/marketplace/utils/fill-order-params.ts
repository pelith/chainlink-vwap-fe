/**
 * Builds fill() contract args from API Order and taker deposit amount.
 */

import { parseUnits } from 'viem';
import type { Order as ApiOrder } from '@/api/api.types';

const USDC_DECIMALS = 6;
const WETH_DECIMALS = 18;

function normalizeSignature(sig: string): `0x${string}` {
	const trimmed = sig.trim();
	if (!trimmed) throw new Error('Signature is required');
	return trimmed.startsWith('0x') ? (trimmed as `0x${string}`) : `0x${trimmed}`;
}

export interface FillOrderArgs {
	order: {
		maker: `0x${string}`;
		makerIsSellETH: boolean;
		amountIn: bigint;
		minAmountOut: bigint;
		deltaBps: number;
		salt: bigint;
		deadline: bigint;
	};
	signature: `0x${string}`;
	takerAmountIn: bigint;
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

	const order = {
		maker: apiOrder.maker as `0x${string}`,
		makerIsSellETH,
		amountIn: BigInt(apiOrder.amount_in),
		minAmountOut: BigInt(apiOrder.min_amount_out),
		deltaBps: apiOrder.delta_bps,
		salt: BigInt(apiOrder.salt),
		deadline: BigInt(apiOrder.deadline),
	};

	const signature = normalizeSignature(apiOrder.signature);
	const takerAmountInRaw = parseUnits(takerAmountIn, decimals);

	return {
		order,
		signature,
		takerAmountIn: takerAmountInRaw,
	};
}
