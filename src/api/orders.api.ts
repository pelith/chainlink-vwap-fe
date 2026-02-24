import { apiFetch } from './api-client';
import type { CreateOrderBody, Order, OrdersQueryParams } from './api.types';

/**
 * 訂單列表 - 對應 Postman: 訂單列表-市集 / My Quotes / 分頁 / 全部
 * - 市集: getOrders({ status: 'active' })
 * - My Quotes: getOrders({ maker: address })
 * - 分頁: getOrders({ status: 'active', limit: 10, offset: 0 })
 * - 全部: getOrders()
 */
export function getOrders(params?: OrdersQueryParams): Promise<Order[]> {
	const search = new URLSearchParams();
	if (params?.maker != null && params.maker !== '')
		search.set('maker', params.maker);
	if (params?.status != null) search.set('status', params.status);
	if (params?.limit != null) search.set('limit', String(params.limit));
	if (params?.offset != null) search.set('offset', String(params.offset));
	const qs = search.toString();
	const path = qs ? `/v1/orders?${qs}` : '/v1/orders';
	return apiFetch<Order[]>(path);
}

/**
 * 單筆訂單 - 對應 Postman: 單筆訂單
 * GET /v1/orders/{hash}
 */
export function getOrder(hash: string): Promise<Order> {
	return apiFetch<Order>(`/v1/orders/${encodeURIComponent(hash)}`);
}

/**
 * 建立訂單 - 對應 Postman: 建立訂單
 * POST /v1/orders
 */
export function createOrder(body: CreateOrderBody): Promise<Order> {
	return apiFetch<Order>('/v1/orders', {
		method: 'POST',
		body,
	});
}

/**
 * 取消訂單 - 對應 Postman: 取消訂單
 * PATCH /v1/orders/{hash}/cancel
 */
export function cancelOrder(hash: string, maker: string): Promise<Order> {
	return apiFetch<Order>(`/v1/orders/${encodeURIComponent(hash)}/cancel`, {
		method: 'PATCH',
		body: { maker },
	});
}
