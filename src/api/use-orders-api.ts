import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelOrder, createOrder, getOrder, getOrders } from './orders.api';
import type { CreateOrderBody, Order, OrdersQueryParams } from './api.types';

export function useOrders<TData = Order[]>(
	params?: OrdersQueryParams,
	options?: { enabled?: boolean; select?: (data: Order[]) => TData },
) {
	return useQuery({
		queryKey: ['orders', params],
		queryFn: () => getOrders(params),
		enabled: options?.enabled ?? true,
		select: options?.select,
	});
}

export function useOrder(hash: string | undefined) {
	return useQuery({
		queryKey: ['orders', hash],
		queryFn: () => getOrder(hash!),
		enabled: !!hash,
	});
}

export function useCreateOrder() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createOrder,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['orders'] });
		},
	});
}

export function useCancelOrder() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ hash, maker }: { hash: string; maker: string }) =>
			cancelOrder(hash, maker),
		onSuccess: (_, { hash }) => {
			queryClient.invalidateQueries({ queryKey: ['orders'] });
			queryClient.invalidateQueries({ queryKey: ['orders', hash] });
		},
	});
}

export type CreateOrderVariables = CreateOrderBody;
