import type { Order } from '@/modules/marketplace/types/marketplace.types';
import { QuoteListItem } from './quote-list-item';

interface MarketListProps {
	orders: Order[];
	onFillClick: (order: Order) => void;
}

export function MarketList({ orders, onFillClick }: MarketListProps) {
	return (
		<div className='mt-8'>
			<div className='flex items-center justify-between mb-6'>
				<h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
					Available Orders
				</h2>
				<span className='text-sm text-gray-600 dark:text-gray-400'>
					{orders.length} active orders
				</span>
			</div>
			<div className='space-y-3'>
				{orders.map((order) => (
					<QuoteListItem
						key={order.id}
						order={order}
						onFillClick={onFillClick}
					/>
				))}
			</div>
		</div>
	);
}
