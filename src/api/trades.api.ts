import { apiFetch } from './api-client';
import type { Trade, TradesQueryParams } from './api.types';

export function getTrades(params: TradesQueryParams): Promise<Trade[]> {
	const search = new URLSearchParams();
	search.set('address', params.address);
	if (params?.status != null) search.set('status', params.status);
	if (params?.limit != null) search.set('limit', String(params.limit));
	if (params?.offset != null) search.set('offset', String(params.offset));
	const path = `/v1/trades?${search.toString()}`;
	return apiFetch<Trade[]>(path);
}

export function getTrade(id: string): Promise<Trade> {
	return apiFetch<Trade>(`/v1/trades/${encodeURIComponent(id)}`);
}
