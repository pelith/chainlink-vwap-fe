import { Clock, XCircle } from 'lucide-react';
import type { MakerOrder } from '@/modules/my-quotes/types/my-quotes.types';

interface OrdersTableProps {
	orders: MakerOrder[];
	onCancelOrder: (orderId: string) => void;
	activeTab: 'active' | 'filled' | 'cancelled';
}

export function OrdersTable({
	orders,
	onCancelOrder,
	activeTab,
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
					<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'>
						Filled
					</span>
				);
			case 'cancelled':
				return (
					<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'>
						Cancelled
					</span>
				);
			case 'expired':
				return (
					<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'>
						Expired
					</span>
				);
			default:
				return null;
		}
	};

	return (
		<div className='overflow-x-auto'>
			<table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
				<thead className='bg-gray-50 dark:bg-gray-700/50'>
					<tr>
						<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
							Pair
						</th>
						<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
							Amount
						</th>
						<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
							Delta
						</th>
						<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
							Min Threshold
						</th>
						<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
							Expiry
						</th>
						<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
							Status
						</th>
						{activeTab === 'active' && (
							<th className='px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
								Action
							</th>
						)}
					</tr>
				</thead>
				<tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
					{orders.map((order) => {
						const receiveToken =
							order.direction === 'SELL_WETH' ? 'USDC' : 'WETH';
						return (
							<tr
								key={order.id}
								className='hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'
							>
								<td className='px-4 py-4 whitespace-nowrap'>
									<div className='text-sm font-medium text-gray-900 dark:text-white'>
										{order.pair}
									</div>
									<div className='text-xs text-gray-500 dark:text-gray-400'>
										{order.direction === 'SELL_WETH'
											? 'Sell WETH'
											: 'Sell USDC'}
									</div>
								</td>
								<td className='px-4 py-4 whitespace-nowrap'>
									<div className='text-sm text-gray-900 dark:text-white'>
										{formatAmount(order.amount, order.token)} {order.token}
									</div>
								</td>
								<td className='px-4 py-4 whitespace-nowrap'>
									<div
										className={`text-sm font-medium ${order.delta >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
									>
										{formatDelta(order.delta)} bps
									</div>
									<div className='text-xs text-gray-500 dark:text-gray-400'>
										{(order.delta / 100).toFixed(2)}%
									</div>
								</td>
								<td className='px-4 py-4 whitespace-nowrap'>
									<div className='text-sm text-gray-900 dark:text-white'>
										{formatAmount(order.minAmountOut, receiveToken)}{' '}
										{receiveToken}
									</div>
								</td>
								<td className='px-4 py-4 whitespace-nowrap'>
									<div className='flex items-center space-x-1 text-sm text-gray-900 dark:text-white'>
										<Clock className='w-4 h-4 text-gray-400' />
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
											className='inline-flex items-center space-x-1 px-3 py-1.5 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium'
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
