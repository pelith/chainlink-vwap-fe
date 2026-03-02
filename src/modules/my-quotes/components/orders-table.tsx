import { Clock, XCircle } from 'lucide-react';
import type { MakerOrder } from '@/modules/my-quotes/types/my-quotes.types';

interface OrdersTableProps {
	orders: MakerOrder[];
	onCancelOrder: (orderId: string) => void;
	activeTab: 'active' | 'filled' | 'cancelled';
	isCancelling?: boolean;
}

export function OrdersTable({
	orders,
	onCancelOrder,
	activeTab,
	isCancelling = false,
}: OrdersTableProps) {
	const formatAmount = (amount: number, token: string) => {
		if (token === 'USDC')
			return amount.toLocaleString('en-US', {
				minimumFractionDigits: 0,
				maximumFractionDigits: 0,
			});
		return amount.toFixed(2);
	};
	const formatDelta = (delta: number) => `${delta >= 0 ? '+' : ''}${delta}`;

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'active':
				return (
					<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'>
						Active
					</span>
				);
			case 'filled':
				return (
					<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary'>
						Filled
					</span>
				);
			case 'cancelled':
				return (
					<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground'>
						Cancelled
					</span>
				);
			case 'expired':
				return (
					<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive'>
						Expired
					</span>
				);
			default:
				return null;
		}
	};

	return (
		<div className='overflow-x-auto rounded-lg border'>
			<table className='min-w-full divide-y divide-border'>
				<thead className='bg-muted/50'>
					<tr>
						<th className='px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
							Pair
						</th>
						<th className='px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
							Amount
						</th>
						<th className='px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
							Delta
						</th>
						<th className='px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
							Min Threshold
						</th>
						<th className='px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
							Expiry
						</th>
						<th className='px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
							Status
						</th>
						{activeTab === 'active' && (
							<th className='px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider'>
								Action
							</th>
						)}
					</tr>
				</thead>
				<tbody className='bg-card divide-y divide-border'>
					{orders.map((order) => {
						const receiveToken =
							order.direction === 'SELL_WETH' ? 'USDC' : 'WETH';
						return (
							<tr
								key={order.id}
								className='hover:bg-muted/50 transition-colors duration-200'
							>
								<td className='px-4 py-4 whitespace-nowrap'>
									<div className='text-sm font-medium text-foreground'>
										{order.pair}
									</div>
									<div className='text-xs text-muted-foreground'>
										{order.direction === 'SELL_WETH'
											? 'Sell WETH'
											: 'Sell USDC'}
									</div>
								</td>
								<td className='px-4 py-4 whitespace-nowrap'>
									<div className='text-sm text-foreground'>
										{formatAmount(order.amount, order.token)} {order.token}
									</div>
								</td>
								<td className='px-4 py-4 whitespace-nowrap'>
									<div
										className={`text-sm font-medium ${order.delta >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
									>
										{formatDelta(order.delta)} bps
									</div>
									<div className='text-xs text-muted-foreground'>
										{(order.delta / 100).toFixed(2)}%
									</div>
								</td>
								<td className='px-4 py-4 whitespace-nowrap'>
									<div className='text-sm text-foreground'>
										{formatAmount(order.minAmountOut, receiveToken)}{' '}
										{receiveToken}
									</div>
								</td>
								<td className='px-4 py-4 whitespace-nowrap'>
									<div className='flex items-center space-x-1 text-sm text-foreground'>
										<Clock className='w-4 h-4 text-muted-foreground' />
										<span>{order.expiryHours}h</span>
									</div>
								</td>
								<td className='px-4 py-4 whitespace-nowrap'>
									{getStatusBadge(order.status)}
								</td>
								{activeTab === 'active' && (
									<td className='px-4 py-4 whitespace-nowrap text-right'>
										<button
											type='button'
											onClick={() => onCancelOrder(order.id)}
											disabled={isCancelling}
											className='inline-flex items-center space-x-1 px-3 py-1.5 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
										>
											<XCircle className='w-4 h-4' />
											<span>Cancel</span>
										</button>
									</td>
								)}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
