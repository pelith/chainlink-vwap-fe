import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useOrders } from '@/api/use-orders-api';
import { useModalActions } from '@/modules/commons/hooks/modal/use-modal-actions';
import {
	FillOrderModal,
	FILL_ORDER_MODAL_KEY,
} from '@/modules/marketplace/components/fill-order-modal';
import { MarketList } from '@/modules/marketplace/components/market-list';
import { StatsSection } from '@/modules/marketplace/components/stats-section';
import type { Order } from '@/modules/marketplace/types/marketplace.types';
import { mapOrderToMarketplaceOrder } from '@/modules/marketplace/utils/order-mapper';

export function MarketplacePage() {
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const { onOpen, onClose } = useModalActions(FILL_ORDER_MODAL_KEY);

	const {
		data: orders,
		error: ordersError,
		isError: isOrdersError,
		isLoading: isOrdersLoading,
	} = useOrders(
		{ status: 'active' },
		{ select: (data) => data.map(mapOrderToMarketplaceOrder) },
	);

	const handleFillClick = (order: Order) => {
		setSelectedOrder(order);
		onOpen();
	};

	const handleConfirmFill = (_amount: string) => {
		onClose();
		setSelectedOrder(null);
		toast.success('Trade initiated! Funds locked for 12h settlement.', {
			duration: 5000,
		});
	};

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
				{!isOrdersError && !isOrdersLoading && (orders ?? []).length === 0 && (
					<div className='text-center py-12'>
						<p className='text-gray-500 dark:text-gray-400 text-lg'>
							No available orders
						</p>
					</div>
				)}
				{!isOrdersError && !isOrdersLoading && (orders ?? []).length > 0 && (
					<MarketList orders={orders ?? []} onFillClick={handleFillClick} />
				)}
			</main>
			<FillOrderModal
				order={selectedOrder}
				onConfirm={handleConfirmFill}
				onCloseCallback={() => setSelectedOrder(null)}
			/>
		</div>
	);
}
