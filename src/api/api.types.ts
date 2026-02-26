/**
 * API types aligned with doc/api.md (VWAP-RFQ backend REST contract).
 */

export type OrderStatus = 'active' | 'filled' | 'cancelled' | 'expired';

export interface Order {
	order_hash: string;
	maker: string;
	maker_is_sell_eth: boolean;
	amount_in: string;
	min_amount_out: string;
	delta_bps: number;
	salt: string;
	deadline: number;
	signature?: string;
	status: OrderStatus;
	created_at: string;
	filled_at: string | null;
	cancelled_at: string | null;
	expired_at: string | null;
}

export interface CreateOrderBody {
	maker: string;
	maker_is_sell_eth: boolean;
	amount_in: string;
	min_amount_out: string;
	delta_bps: number;
	salt: string;
	deadline: number;
	signature: string;
}

export interface OrdersQueryParams {
	maker?: string;
	status?: OrderStatus;
	limit?: number;
	offset?: number;
}

export type TradeStatus = 'open' | 'settled' | 'refunded';

export type TradeDisplayStatus =
	| 'locking'
	| 'ready_to_settle'
	| 'expired_refundable'
	| 'settled'
	| 'refunded';

export interface Trade {
	trade_id: string;
	maker: string;
	taker: string;
	maker_is_sell_eth: boolean;
	maker_amount_in: string;
	taker_deposit: string;
	delta_bps: number;
	start_time: number;
	end_time: number;
	status: TradeStatus;
	display_status: TradeDisplayStatus;
	settlement_price: string;
	maker_payout: string;
	taker_payout: string;
	maker_refund: string;
	taker_refund: string;
	created_at: string;
	settled_at: string | null;
	refunded_at: string | null;
}

export interface TradesQueryParams {
	address: string;
	status?: TradeStatus;
	limit?: number;
	offset?: number;
}

export interface ApiError {
	error: string;
}
