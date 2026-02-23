export interface Order {
	id: string;
	direction: "SELL_WETH" | "SELL_USDC";
	amount: number;
	token: string;
	delta: number;
	minAmountOut: number;
	expiryHours: number;
	expiryMinutes: number;
}
