import { Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Trade } from '@/modules/my-trades/types/my-trades.types';

interface HistoryTabProps {
	trades: Trade[];
}

/** Formats a number to max 4 decimals and trims trailing zeros */
const formatTrimmed = (n: number) => {
	return Number.parseFloat(n.toFixed(4)).toString();
};

export function HistoryTab({ trades }: HistoryTabProps) {
	const stats = useMemo(() => ({
		total: trades.length,
		settled: trades.filter((t) => t.status === 'settled').length,
		refunded: trades.filter((t) => t.status === 'refunded').length,
	}), [trades]);

	if (trades.length === 0) {
		return (
			<div className='p-12 text-center'>
				<Calendar className='w-12 h-12 text-muted-foreground/50 mx-auto mb-4' />
				<p className='text-muted-foreground text-lg'>
					No trade history yet
				</p>
				<p className='text-muted-foreground/80 text-sm mt-2'>
					Settled and refunded trades will appear here.
				</p>
			</div>
		);
	}

	return (
		<div className='p-6'>
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
				<Card className='cursor-default transition-colors duration-200 hover:bg-muted/50'>
					<CardContent className='pt-6'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-primary mb-1'>Total Trades</p>
								<p className='text-2xl font-semibold text-foreground'>{stats.total}</p>
							</div>
							<TrendingUp className='w-8 h-8 text-primary' />
						</div>
					</CardContent>
				</Card>
				<Card className='cursor-default transition-colors duration-200 hover:bg-muted/50'>
					<CardContent className='pt-6'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-green-600 dark:text-green-400 mb-1'>Successfully Settled</p>
								<p className='text-2xl font-semibold text-foreground'>{stats.settled}</p>
							</div>
							<TrendingUp className='w-8 h-8 text-green-500' />
						</div>
					</CardContent>
				</Card>
				<Card className='cursor-default transition-colors duration-200 hover:bg-muted/50'>
					<CardContent className='pt-6'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-muted-foreground mb-1'>Refunded</p>
								<p className='text-2xl font-semibold text-foreground'>{stats.refunded}</p>
							</div>
							<TrendingUp className='w-8 h-8 text-muted-foreground' />
						</div>
					</CardContent>
				</Card>
			</div>
			<div className='rounded-lg border w-full h-[70vh] min-h-[320px]'>
				<ScrollArea className='h-full w-full'>
					<table className='min-w-full divide-y divide-border'>
					<thead className='bg-muted/50'>
						<tr>
							<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
								Date
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
								Trade ID
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
								Role
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
								Final VWAP Price
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
								Sent Amount
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
								Received Amount
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
								Refunded Change
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
								Status
							</th>
						</tr>
					</thead>
					<tbody className='bg-card divide-y divide-border'>
						{trades.map((trade) => (
							<HistoryRow key={trade.id} trade={trade} />
						))}
					</tbody>
				</table>
				</ScrollArea>
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
		<tr className='hover:bg-muted/50 transition-colors duration-200 cursor-default'>
			<td className='px-6 py-4 whitespace-nowrap text-sm text-foreground'>
				{trade.settledTime ? formatDate(trade.settledTime) : '-'}
			</td>
			<td className='px-6 py-4 whitespace-nowrap'>
				<button
					type='button'
					onClick={() => {
						navigator.clipboard.writeText(trade.id);
						toast.success('Trade ID copied');
					}}
					className='text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200 cursor-pointer'
					title='Copy trade ID'
				>
					#{trade.id.slice(0, 8)}...{trade.id.slice(-4)}
				</button>
			</td>
			<td className='px-6 py-4 whitespace-nowrap'>
				<span
					className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
						trade.role === 'Maker'
							? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
							: 'bg-primary/10 text-primary'
					}`}
				>
					{trade.role} ({trade.depositedToken} → {trade.targetToken})
				</span>
			</td>
			<td className='px-6 py-4 whitespace-nowrap text-sm text-foreground'>
				{trade.finalVWAP ? (
					`${formatTrimmed(trade.finalVWAP)} USDC`
				) : (
					<span className='text-muted-foreground'>-</span>
				)}
			</td>
			<td className='px-6 py-4 whitespace-nowrap text-sm text-foreground'>
				<div className='flex items-center space-x-1'>
					<span className='text-destructive'>-</span>
					<span>
						{formatTrimmed(trade.depositedAmount)} {trade.depositedToken}
					</span>
				</div>
			</td>
			<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400'>
				{trade.receivedAmount ? (
					<div className='flex items-center space-x-1'>
						<span>+</span>
						<span>
							{formatTrimmed(trade.receivedAmount)} {trade.targetToken}
						</span>
					</div>
				) : (
					<span className='text-muted-foreground'>-</span>
				)}
			</td>
			<td className='px-6 py-4 whitespace-nowrap text-sm text-foreground'>
				{trade.refundedAmount && trade.refundedAmount > 0 ? (
					<div className='flex items-center space-x-1 text-primary'>
						<span>+</span>
						<span>
							{formatTrimmed(trade.refundedAmount)} {trade.depositedToken}
						</span>
					</div>
				) : (
					<span className='text-muted-foreground'>-</span>
				)}
			</td>
			<td className='px-6 py-4 whitespace-nowrap'>
				{trade.status === 'settled' ? (
					<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'>
						Settled
					</span>
				) : (
					<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground'>
						Refunded
					</span>
				)}
			</td>
		</tr>
	);
}
