import { apiFetch } from './api-client';
import type { CreateOrderBody, Order, OrdersQueryParams } from './api.types';

export function getOrders(params?: OrdersQueryParams): Promise<Order[]> {
	const search = new URLSearchParams();
	if (params?.maker != null) search.set('maker', params.maker);
	if (params?.status != null) search.set('status', params.status);
	if (params?.limit != null) search.set('limit', String(params.limit));
	if (params?.offset != null) search.set('offset', String(params.offset));
	const qs = search.toString();
	const path = qs ? `/v1/orders?${qs}` : '/v1/orders';
	return apiFetch<Order[]>(path);
}

export function getOrder(hash: string): Promise<Order> {
	return apiFetch<Order>(`/v1/orders/${encodeURIComponent(hash)}`);
}

export function createOrder(body: CreateOrderBody): Promise<Order> {
	return apiFetch<Order>('/v1/orders', {
		method: 'POST',
		body,
	});
}

export function cancelOrder(hash: string, maker: string): Promise<Order> {
	return apiFetch<Order>(`/v1/orders/${encodeURIComponent(hash)}/cancel`, {
		method: 'PATCH',
		body: { maker },
	});
}
