import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Order } from '@/modules/marketplace/types/marketplace.types';
import { QuoteListItem } from './quote-list-item';

interface MarketListProps {
	orders: Order[];
	onFillClick: (order: Order) => void;
	onRefresh: () => void;
	isRefreshing: boolean;
}

export function MarketList({
	orders,
	onFillClick,
	onRefresh,
	isRefreshing,
}: MarketListProps) {
	return (
		<div className='mt-8'>
			<div className='flex items-center justify-between mb-6'>
				<div className='flex items-center gap-4'>
					<h2 className='text-2xl font-semibold text-foreground'>
						Available Orders
					</h2>
					<span className='text-sm text-muted-foreground'>
						{orders.length} active orders
					</span>
				</div>
				<Button
					variant='outline'
					size='sm'
					onClick={onRefresh}
					disabled={isRefreshing}
					className='gap-2 bg-background/80 backdrop-blur-sm disabled:bg-background disabled:backdrop-blur-none transition-colors duration-200 cursor-pointer'
				>
					<RefreshCw
						className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
					/>
					Refresh
				</Button>
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
