import { useState } from 'react';
import { toast } from 'sonner';
import { useModalActions } from '@/modules/commons/hooks/modal/use-modal-actions';
import {
	FillOrderModal,
	FILL_ORDER_MODAL_KEY,
} from '@/modules/marketplace/components/fill-order-modal';
import { MarketList } from '@/modules/marketplace/components/market-list';
import { StatsSection } from '@/modules/marketplace/components/stats-section';
import type { Order } from '@/modules/marketplace/types/marketplace.types';
import { mockOrders } from '@/modules/marketplace/utils/mock-orders';

export function MarketplacePage() {
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const { onOpen, onClose } = useModalActions(FILL_ORDER_MODAL_KEY);

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
				<MarketList orders={mockOrders} onFillClick={handleFillClick} />
			</main>
			<FillOrderModal
				order={selectedOrder}
				onConfirm={handleConfirmFill}
				onCloseCallback={() => setSelectedOrder(null)}
			/>
		</div>
	);
}
