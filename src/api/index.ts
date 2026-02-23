// Types (Data layer contract)
export type {
	ApiError,
	CreateOrderBody,
	Order,
	OrderStatus,
	OrdersQueryParams,
	Trade,
	TradeDisplayStatus,
	TradesQueryParams,
	TradeStatus,
} from "./api.types";

// Client (for error handling / base URL only; fetchers are internal)
export { ApiClientError, getBaseUrl } from "./api-client";

// Orders API hooks (Data layer: typed hooks only, no raw fetchers)
export {
	useCancelOrder,
	useCreateOrder,
	useOrder,
	useOrders,
} from "./use-orders-api";
export type { CreateOrderVariables } from "./use-orders-api";

// Trades API hooks
export { useTrade, useTrades } from "./use-trades-api";
