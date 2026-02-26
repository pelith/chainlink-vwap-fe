export interface Trade {
	id: string;
	role: 'Maker' | 'Taker';
	status:
		| 'locking'
		| 'ready_to_settle'
		| 'settled'
		| 'refunded'
		| 'expired_refundable';
	depositedAmount: number;
	depositedToken: string;
	targetAmount: number;
	targetToken: string;
	fillTime: Date;
	endTime: Date;
	deltaBps: number;
	makerIsSellETH: boolean;
	makerAmountIn: number;
	takerDeposit: number;
	settledTime?: Date;
	finalVWAP?: number;
	receivedAmount?: number;
	refundedAmount?: number;
}
