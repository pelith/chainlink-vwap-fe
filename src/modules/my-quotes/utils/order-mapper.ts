/**
 * Maps API Order to MakerOrder for display.
 * Naming aligned with web3-format-number: *Formatted for formatUnits output.
 */

import { formatUnits } from 'viem';
import type { Order } from '@/api/api.types';
import type { MakerOrder } from '@/modules/my-quotes/types/my-quotes.types';

const WETH_DECIMALS = 18;
const USDC_DECIMALS = 6;

/**
 * Maps API Order to MakerOrder for My Quotes display.
 */
export function mapOrderToMakerOrder(order: Order): MakerOrder {
	const direction = order.maker_is_sell_eth ? 'SELL_WETH' : 'SELL_USDC';
	const amountDecimals = order.maker_is_sell_eth
		? WETH_DECIMALS
		: USDC_DECIMALS;
	const minAmountOutDecimals = order.maker_is_sell_eth
		? USDC_DECIMALS
		: WETH_DECIMALS;

	const amountInFormatted = formatUnits(
		BigInt(order.amount_in),
		amountDecimals,
	);
	const minAmountOutFormatted = formatUnits(
		BigInt(order.min_amount_out),
		minAmountOutDecimals,
	);

	const createdAtSeconds = Math.floor(
		new Date(order.created_at).getTime() / 1000,
	);
	const expirySeconds = order.deadline - createdAtSeconds;
	const expiryHours = Math.max(0, Math.floor(expirySeconds / 3600));

	return {
		id: order.order_hash,
		pair: 'WETH/USDC',
		direction,
		amount: Number.parseFloat(amountInFormatted),
		token: direction === 'SELL_WETH' ? 'WETH' : 'USDC',
		delta: order.delta_bps,
		minAmountOut: Number.parseFloat(minAmountOutFormatted),
		expiryHours,
		status: order.status,
		createdAt: new Date(order.created_at),
	};
}
