import { Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useMemo } from 'react';
import type { Trade } from '@/modules/my-trades/types/my-trades.types';

interface HistoryTabProps {
	trades: Trade[];
}

/** Formats a number to max 4 decimals and trims trailing zeros */
const formatTrimmed = (n: number) => {
	return Number.parseFloat(n.toFixed(4)).toString();
};

export function HistoryTab({ trades }: HistoryTabProps) {
	// Optimized: Memoize summary stats to avoid re-filtering on every render
	const stats = useMemo(() => ({
		total: trades.length,
		settled: trades.filter((t) => t.status === 'settled').length,
		refunded: trades.filter((t) => t.status === 'refunded').length,
	}), [trades]);

	if (trades.length === 0) {
		return (
			<div className='p-12 text-center'>
				<Calendar className='w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
				<p className='text-gray-500 dark:text-gray-400 text-lg'>
					No trade history yet
				</p>
				<p className='text-gray-400 dark:text-gray-500 text-sm mt-2'>
					Settled and refunded trades will appear here.
				</p>
			</div>
		);
	}

	return (
		<div className='p-6'>
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
				<div className='bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-blue-700 dark:text-blue-300 mb-1'>
								Total Trades
							</p>
							<p className='text-2xl font-semibold text-blue-900 dark:text-blue-100'>
								{stats.total}
							</p>
						</div>
						<TrendingUp className='w-8 h-8 text-blue-500' />
					</div>
				</div>
				<div className='bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-green-700 dark:text-green-300 mb-1'>
								Successfully Settled
							</p>
							<p className='text-2xl font-semibold text-green-900 dark:text-green-100'>
								{stats.settled}
							</p>
						</div>
						<TrendingUp className='w-8 h-8 text-green-500' />
					</div>
				</div>
				<div className='bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-gray-700 dark:text-gray-300 mb-1'>
								Refunded
							</p>
							<p className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>
								{stats.refunded}
							</p>
						</div>
						<TrendingUp className='w-8 h-8 text-gray-500' />
					</div>
				</div>
			</div>
			<div className='overflow-x-auto'>
				<table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
					<thead className='bg-gray-50 dark:bg-gray-700/50'>
						<tr>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
								Date
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
								Trade ID
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
								Role
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
								Final VWAP Price
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
								Sent Amount
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
								Received Amount
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
								Refunded Change
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
								Status
							</th>
						</tr>
					</thead>
					<tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
						{trades.map((trade) => (
							<HistoryRow key={trade.id} trade={trade} />
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function HistoryRow({ trade }: { trade: Trade }) {
	const formatDate = (date: Date) =>
		date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});

	return (
		<tr className='hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'>
			<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
				{trade.settledTime ? formatDate(trade.settledTime) : '-'}
			</td>
			<td className='px-6 py-4 whitespace-nowrap'>
				<button
					type='button'
					onClick={() => { navigator.clipboard.writeText(trade.id); toast.success('Trade ID copied'); }}
					className='text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200'
					title='Copy trade ID'
				>
					#{trade.id.slice(0, 8)}...{trade.id.slice(-4)}
				</button>
			</td>
			<td className='px-6 py-4 whitespace-nowrap'>
				<span
					className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trade.role === 'Maker' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'}`}
				>
					{trade.role} ({trade.depositedToken} → {trade.targetToken})
				</span>
			</td>
			<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
				{trade.finalVWAP ? (
					`${formatTrimmed(trade.finalVWAP)} USDC`
				) : (
					<span className='text-gray-400'>-</span>
				)}
			</td>
			<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
				<div className='flex items-center space-x-1'>
					<span className='text-red-600 dark:text-red-400'>-</span>
					<span>
						{formatTrimmed(trade.depositedAmount)}{' '}
						{trade.depositedToken}
					</span>
				</div>
			</td>
			<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400'>
				{trade.receivedAmount ? (
					<div className='flex items-center space-x-1'>
						<span>+</span>
						<span>
							{formatTrimmed(trade.receivedAmount)}{' '}
							{trade.targetToken}
						</span>
					</div>
				) : (
					<span className='text-gray-400'>-</span>
				)}
			</td>
			<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
				{trade.refundedAmount && trade.refundedAmount > 0 ? (
					<div className='flex items-center space-x-1 text-blue-600 dark:text-blue-400'>
						<span>+</span>
						<span>
							{formatTrimmed(trade.refundedAmount)}{' '}
							{trade.depositedToken}
						</span>
					</div>
				) : (
					<span className='text-gray-400'>-</span>
				)}
			</td>
			<td className='px-6 py-4 whitespace-nowrap'>
				{trade.status === 'settled' ? (
					<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'>
						Settled
					</span>
				) : (
					<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'>
						Refunded
					</span>
				)}
			</td>
		</tr>
	);
}
