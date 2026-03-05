/**
 * Form data to API/order params conversion for create order.
 * Naming aligned with web3-format-number: *Raw (bigint), *Formatted (string).
 */

import { parseUnits } from 'viem';
import type { CreateOrderBody } from '@/api/api.types';

const WETH_DECIMALS = 18;
const USDC_DECIMALS = 6;

export interface CreateQuoteFormData {
	direction: 'SELL_WETH' | 'SELL_USDC';
	amount: string;
	delta: string;
	minAmountOut: string;
	deadline: string;
}

/** Params for signing and API body (without signature). */
export interface OrderParams {
	amountInRaw: bigint;
	minAmountOutRaw: bigint;
	deltaBps: number;
	salt: bigint;
	deadline: number;
	makerIsSellETH: boolean;
}

function generateSalt(): bigint {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	const hex = Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
	return BigInt('0x' + hex);
}

/**
 * Converts form data to order params (for signing).
 * Validates 10000 + deltaBps > 0 per doc/eip712.md.
 */
export function formDataToOrderParams(
	formData: CreateQuoteFormData,
	blockTimestamp?: number,
): OrderParams {
	const deltaBps = Number.parseInt(formData.delta, 10);
	if (Number.isNaN(deltaBps)) {
		throw new Error('Invalid delta');
	}
	if (10000 + deltaBps <= 0) {
		throw new Error('delta_bps must satisfy 10000 + deltaBps > 0');
	}

	const makerIsSellETH = formData.direction === 'SELL_WETH';
	const amountInDecimals = makerIsSellETH ? WETH_DECIMALS : USDC_DECIMALS;
	const minAmountOutDecimals = makerIsSellETH ? USDC_DECIMALS : WETH_DECIMALS;

	const amountInRaw = parseUnits(formData.amount, amountInDecimals);
	const minAmountOutRaw = parseUnits(
		formData.minAmountOut,
		minAmountOutDecimals,
	);
	const salt = generateSalt();
	
	const currentTimestamp = blockTimestamp ?? Math.floor(Date.now() / 1000);
	const deadline =
		currentTimestamp +
		Number.parseInt(formData.deadline, 10) * 3600;

	return {
		amountInRaw,
		minAmountOutRaw,
		deltaBps,
		salt,
		deadline,
		makerIsSellETH,
	};
}

/**
 * Builds CreateOrderBody for POST /v1/orders from params and signature.
 */
export function buildCreateOrderBody(
	params: OrderParams,
	maker: string,
	signature: `0x${string}`,
): CreateOrderBody {
	return {
		maker,
		maker_is_sell_eth: params.makerIsSellETH,
		amount_in: String(params.amountInRaw),
		min_amount_out: String(params.minAmountOutRaw),
		delta_bps: params.deltaBps,
		salt: String(params.salt),
		deadline: params.deadline,
		signature,
	};
}
