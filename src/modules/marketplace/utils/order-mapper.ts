/**
 * Maps API Order to Marketplace Order for display.
 */

import { formatUnits } from 'viem';
import type { Order as ApiOrder } from '@/api/api.types';
import type { Order } from '@/modules/marketplace/types/marketplace.types';

const WETH_DECIMALS = 18;
const USDC_DECIMALS = 6;

/**
 * Maps API Order to Marketplace Order for Available Orders list.
 */
export function mapOrderToMarketplaceOrder(order: ApiOrder): Order {
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

	return {
		id: order.order_hash,
		direction,
		amount: Number.parseFloat(amountInFormatted),
		token: direction === 'SELL_WETH' ? 'WETH' : 'USDC',
		delta: order.delta_bps,
		minAmountOut: Number.parseFloat(minAmountOutFormatted),
		deadline: order.deadline,
	};
}
