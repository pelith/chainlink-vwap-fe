import { useQuery } from "@tanstack/react-query";
import { getTrade, getTrades } from "./trades.api";
import type { TradesQueryParams } from "./api.types";

export function useTrades(params: TradesQueryParams) {
	return useQuery({
		queryKey: ["trades", params],
		queryFn: () => getTrades(params),
		enabled: !!params.address,
	});
}

export function useTrade(id: string | undefined) {
	return useQuery({
		queryKey: ["trades", id],
		queryFn: () => getTrade(id!),
		enabled: !!id,
	});
}
