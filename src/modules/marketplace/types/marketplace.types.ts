export interface Order {
	id: string;
	maker: string;
	direction: 'SELL_WETH' | 'SELL_USDC';
	amount: number;
	token: string;
	delta: number;
	minAmountOut: number;
	deadline: number;
}
