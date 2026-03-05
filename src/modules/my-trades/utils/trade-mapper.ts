import { formatUnits } from 'viem';
import type { Trade as ApiTrade } from '@/api/api.types';
import type { Trade as UITrade } from '../types/my-trades.types';
import { calculateSettlement } from './settlement-math';

const WETH_DECIMALS = 18;
const USDC_DECIMALS = 6;
const VWAP_DECIMALS = 6; // Aligned with oracle scale (1e6)

/** Safely converts a potential numeric string to Number after unit formatting */
const safeFormatUnits = (value: string | undefined | null, decimals: number): number | undefined => {
	if (!value || value === '' || value === '0') return undefined;
	try {
		return Number(formatUnits(BigInt(value), decimals));
	} catch {
		return undefined;
	}
};

/**
 * Computes receivedAmount for settled trades using settlement math.
 * Avoids API maker_payout/taker_payout which may have format/scale issues from the Indexer.
 */
function computeReceivedAmount(apiTrade: ApiTrade, role: 'Maker' | 'Taker'): number | undefined {
	const status = apiTrade.display_status;
	if (status !== 'settled') return undefined;

	const finalVWAP = safeFormatUnits(apiTrade.settlement_price, VWAP_DECIMALS);
	if (finalVWAP == null) return undefined;

	const makerAmountIn = Number(formatUnits(BigInt(apiTrade.maker_amount_in), apiTrade.maker_is_sell_eth ? WETH_DECIMALS : USDC_DECIMALS));
	const takerDeposit = Number(formatUnits(BigInt(apiTrade.taker_deposit), apiTrade.maker_is_sell_eth ? USDC_DECIMALS : WETH_DECIMALS));
	const priceWithDelta = finalVWAP * (1 + apiTrade.delta_bps / 10000);

	const { payout } = calculateSettlement({
		makerAmountIn,
		takerDeposit,
		makerIsSellETH: apiTrade.maker_is_sell_eth,
		role,
		priceWithDelta,
	});

	return payout;
}

export function mapApiTradeToUITrade(apiTrade: ApiTrade, userAddress: string): UITrade {
	const isMaker = apiTrade.maker.toLowerCase() === userAddress.toLowerCase();
	const role: 'Maker' | 'Taker' = isMaker ? 'Maker' : 'Taker';

	const statusMap: Record<string, UITrade['status']> = {
		locking: 'locking',
		ready_to_settle: 'ready_to_settle',
		settled: 'settled',
		refunded: 'refunded',
		expired_refundable: 'expired_refundable',
	};

	const status = statusMap[apiTrade.display_status] || 'locking';

	const makerTokenDecimals = apiTrade.maker_is_sell_eth ? WETH_DECIMALS : USDC_DECIMALS;
	const takerTokenDecimals = apiTrade.maker_is_sell_eth ? USDC_DECIMALS : WETH_DECIMALS;

	const depositedAmountRaw = isMaker ? apiTrade.maker_amount_in : apiTrade.taker_deposit;
	const depositedDecimals = isMaker ? makerTokenDecimals : takerTokenDecimals;
	const depositedAmount = Number(formatUnits(BigInt(depositedAmountRaw), depositedDecimals));

	const depositedToken = isMaker
		? (apiTrade.maker_is_sell_eth ? 'WETH' : 'USDC')
		: (apiTrade.maker_is_sell_eth ? 'USDC' : 'WETH');

	const targetToken = isMaker
		? (apiTrade.maker_is_sell_eth ? 'USDC' : 'WETH')
		: (apiTrade.maker_is_sell_eth ? 'WETH' : 'USDC');

	return {
		id: apiTrade.trade_id,
		role,
		status,
		depositedAmount,
		depositedToken,
		targetAmount: isMaker 
			? Number(formatUnits(BigInt(apiTrade.taker_deposit), takerTokenDecimals))
			: Number(formatUnits(BigInt(apiTrade.maker_amount_in), makerTokenDecimals)),
		targetToken,
		fillTime: new Date(apiTrade.start_time * 1000),
		endTime: new Date(apiTrade.end_time * 1000),
		deltaBps: apiTrade.delta_bps,
		makerIsSellETH: apiTrade.maker_is_sell_eth,
		makerAmountIn: Number(formatUnits(BigInt(apiTrade.maker_amount_in), makerTokenDecimals)),
		takerDeposit: Number(formatUnits(BigInt(apiTrade.taker_deposit), takerTokenDecimals)),
		settledTime: apiTrade.settled_at ? new Date(apiTrade.settled_at) : undefined,
		finalVWAP: safeFormatUnits(apiTrade.settlement_price, VWAP_DECIMALS),
		receivedAmount: computeReceivedAmount(apiTrade, role),
		refundedAmount: isMaker
			? safeFormatUnits(apiTrade.maker_refund, makerTokenDecimals)
			: safeFormatUnits(apiTrade.taker_refund, takerTokenDecimals),
	};
}
