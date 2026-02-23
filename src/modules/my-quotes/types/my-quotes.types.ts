export interface MakerOrder {
	id: string;
	pair: string;
	direction: "SELL_WETH" | "SELL_USDC";
	amount: number;
	token: string;
	delta: number;
	minAmountOut: number;
	expiryHours: number;
	status: "active" | "filled" | "cancelled" | "expired";
	createdAt: Date;
}
