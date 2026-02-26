import { Loader2, RefreshCw } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Order as ApiOrder } from '@/api/api.types';
import { getOrder } from '@/api/orders.api';
import { useOrders } from '@/api/use-orders-api';
import { useModalActions } from '@/modules/commons/hooks/modal/use-modal-actions';
import {
	FillOrderModal,
	FILL_ORDER_MODAL_KEY,
} from '@/modules/marketplace/components/fill-order-modal';
import { useFillOrder } from '@/modules/marketplace/hooks/use-fill-order';
import { MarketList } from '@/modules/marketplace/components/market-list';
import { StatsSection } from '@/modules/marketplace/components/stats-section';
import type { Order } from '@/modules/marketplace/types/marketplace.types';
import { parseFillError } from '@/modules/marketplace/utils/parse-fill-error';
import { mapOrderToMarketplaceOrder } from '@/modules/marketplace/utils/order-mapper';

export function MarketplacePage() {
	const queryClient = useQueryClient();
	const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
	const { onOpen, onClose } = useModalActions(FILL_ORDER_MODAL_KEY);
	const { fillOrderAsync, isPending } = useFillOrder();

	const {
		data: apiOrders,
		error: ordersError,
		isError: isOrdersError,
		isLoading: isOrdersLoading,
		refetch,
		isFetching,
	} = useOrders({ status: 'active' });

	const displayOrders = useMemo(
		() => (apiOrders ?? []).map(mapOrderToMarketplaceOrder),
		[apiOrders],
	);

	const handleFillClick = useCallback(
		async (displayOrder: Order) => {
			let apiOrder = apiOrders?.find((o) => o.order_hash === displayOrder.id);
			if (!apiOrder) return;
			if (!apiOrder.signature) {
				apiOrder = await getOrder(displayOrder.id);
			}
			setSelectedOrder(apiOrder);
			onOpen();
		},
		[apiOrders, onOpen],
	);

	const handleConfirmFill = useCallback(
		async (amount: string) => {
			if (!selectedOrder) return;
			try {
				await fillOrderAsync(selectedOrder, amount);
				queryClient.invalidateQueries({ queryKey: ['orders'] });
				onClose();
				setSelectedOrder(null);
				toast.success('Trade initiated! Funds locked for 12h settlement.', {
					duration: 5000,
				});
			} catch (err) {
				toast.error(parseFillError(err));
			}
		},
		[selectedOrder, fillOrderAsync, queryClient, onClose],
	);

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16'>
				<StatsSection />
				{isOrdersError && (
					<div className='mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'>
						<p className='text-red-700 dark:text-red-300 font-medium'>
							Failed to load orders
						</p>
						<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
							{ordersError instanceof Error
								? ordersError.message
								: String(ordersError)}
						</p>
					</div>
				)}
				{!isOrdersError && isOrdersLoading && (
					<div className='flex flex-col items-center justify-center py-12'>
						<Loader2 className='w-12 h-12 text-blue-500 dark:text-blue-400 animate-spin mb-4' />
						<p className='text-gray-500 dark:text-gray-400'>Loading orders…</p>
					</div>
				)}
				{!isOrdersError && !isOrdersLoading && displayOrders.length === 0 && (
					<div className='text-center py-12'>
						<p className='text-gray-500 dark:text-gray-400 text-lg mb-4'>
							No available orders
						</p>
						<Button
							variant='outline'
							size='sm'
							onClick={() => refetch()}
							disabled={isFetching}
							className='gap-2'
						>
							<RefreshCw
								className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
							/>
							Refresh
						</Button>
					</div>
				)}
				{!isOrdersError && !isOrdersLoading && displayOrders.length > 0 && (
					<MarketList
						orders={displayOrders}
						onFillClick={handleFillClick}
						onRefresh={() => refetch()}
						isRefreshing={isFetching}
					/>
				)}
			</main>
			<FillOrderModal
				order={selectedOrder}
				onConfirm={handleConfirmFill}
				onCloseCallback={() => setSelectedOrder(null)}
				isSubmitPending={isPending}
			/>
		</div>
	);
}
