/**
 * Settlement math logic aligned with VWAPRFQSpot.sol
 */

export interface SettlementResult {
	payout: number;
	refund: number;
	payoutToken: string;
	refundToken: string;
}

export interface SettlementParams {
	makerAmountIn: number;
	takerDeposit: number;
	makerIsSellETH: boolean;
	role: 'Maker' | 'Taker';
	priceWithDelta: number;
}

export function calculateSettlement({
	makerAmountIn,
	takerDeposit,
	makerIsSellETH,
	role,
	priceWithDelta,
}: SettlementParams): SettlementResult {
	let payout = 0;
	let refund = 0;
	let payoutToken = '';
	let refundToken = '';

	if (makerIsSellETH) {
		// Maker sells WETH for USDC
		// makerDeposit = WETH, takerDeposit = USDC
		const maxEthFromUsdc = takerDeposit / priceWithDelta;
		const ethUsed = Math.min(makerAmountIn, maxEthFromUsdc);
		const usdcPaid = ethUsed * priceWithDelta;

		if (role === 'Maker') {
			payout = usdcPaid; // Gets USDC
			refund = makerAmountIn - ethUsed; // Gets WETH
			payoutToken = 'USDC';
			refundToken = 'WETH';
		} else {
			payout = ethUsed; // Gets WETH
			refund = takerDeposit - usdcPaid; // Gets USDC
			payoutToken = 'WETH';
			refundToken = 'USDC';
		}
	} else {
		// Maker sells USDC for WETH
		// makerDeposit = USDC, takerDeposit = WETH
		const maxUsdcFromEth = takerDeposit * priceWithDelta;
		const usdcUsed = Math.min(makerAmountIn, maxUsdcFromEth);
		const ethPaid = usdcUsed / priceWithDelta;

		if (role === 'Maker') {
			payout = ethPaid; // Gets WETH
			refund = makerAmountIn - usdcUsed; // Gets USDC
			payoutToken = 'WETH';
			refundToken = 'USDC';
		} else {
			payout = usdcUsed; // Gets USDC
			refund = takerDeposit - ethPaid; // Gets WETH
			payoutToken = 'USDC';
			refundToken = 'WETH';
		}
	}

	return { payout, refund, payoutToken, refundToken };
}
