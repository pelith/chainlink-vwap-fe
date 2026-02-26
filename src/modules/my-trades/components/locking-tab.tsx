import { Clock, Hourglass, Info } from 'lucide-react';
import { useMemo } from 'react';
import { useChainId } from 'wagmi';
import type { Trade } from '@/modules/my-trades/types/my-trades.types';
import { useVwapOraclePrice } from '@/modules/contracts/hooks/use-vwap-oracle-price';
import { calculateSettlement } from '../utils/settlement-math';

interface LockingTabProps {
	trades: Trade[];
}

/** Formats a number to max 4 decimals and trims trailing zeros */
const formatTrimmed = (n: number) => {
	return Number.parseFloat(n.toFixed(4)).toString();
};

export function LockingTab({ trades }: LockingTabProps) {
	if (trades.length === 0) {
		return (
			<div className='p-12 text-center'>
				<Hourglass className='w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
				<p className='text-gray-500 dark:text-gray-400 text-lg'>
					No trades in locking phase
				</p>
				<p className='text-gray-400 dark:text-gray-500 text-sm mt-2'>
					Trades will appear here during their 12-hour VWAP calculation period.
				</p>
			</div>
		);
	}

	return (
		<div className='p-6 space-y-6'>
			{trades.map((trade) => (
				<LockingTradeCard key={trade.id} trade={trade} />
			))}
		</div>
	);
}

function LockingTradeCard({ trade }: { trade: Trade }) {
	const chainId = useChainId();
	const now = Date.now();
	const totalDuration = trade.endTime.getTime() - trade.fillTime.getTime();
	const elapsed = now - trade.fillTime.getTime();
	const remaining = trade.endTime.getTime() - now;
	const progress = Math.min((elapsed / totalDuration) * 100, 100);

	const { vwapPrice, isLoading: isPriceLoading } = useVwapOraclePrice({ chainId });

	const settlementData = useMemo(() => {
		if (!vwapPrice) return null;
		const priceWithDelta = vwapPrice * (1 + trade.deltaBps / 10000);
		return calculateSettlement({
			makerAmountIn: trade.makerAmountIn,
			takerDeposit: trade.takerDeposit,
			makerIsSellETH: trade.makerIsSellETH,
			role: trade.role,
			priceWithDelta,
		});
	}, [trade, vwapPrice]);

	const formatTime = (ms: number) => {
		const hours = Math.floor(ms / (1000 * 60 * 60));
		const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
		return `${hours}h ${minutes}m`;
	};

	const formatDateTime = (date: Date) =>
		date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});

	return (
		<div className='border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow'>
			<div className='flex items-center justify-between mb-4'>
				<div className='flex items-center space-x-3'>
					<h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
						Trade #{trade.id}
					</h3>
					<span className='text-sm text-gray-500'>|</span>
					<span className='text-sm text-gray-600 dark:text-gray-400'>
						Role: {trade.role} ({trade.depositedToken} → {trade.targetToken})
					</span>
				</div>
				<span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'>
					Locking Phase
				</span>
			</div>
			<div className='mb-6'>
				<div className='flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2'>
					<span>Fill Time</span>
					<div className='flex items-center space-x-1'>
						<Clock className='w-4 h-4' />
						<span className='font-medium text-blue-600 dark:text-blue-400'>
							{formatTime(remaining)} remaining
						</span>
					</div>
					<span>End Time (12h)</span>
				</div>
				<div className='relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
					<div
						className='h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500'
						style={{ width: `${progress}%` }}
					/>
				</div>
				<div className='flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1'>
					<span>{formatDateTime(trade.fillTime)}</span>
					<span>{formatDateTime(trade.endTime)}</span>
				</div>
			</div>
			<div className='grid grid-cols-2 gap-4 mb-4'>
				<div>
					<p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
						Deposited
					</p>
					<p className='text-lg font-semibold text-gray-900 dark:text-white'>
						{formatTrimmed(trade.depositedAmount)} {trade.depositedToken}
					</p>
				</div>
				<div>
					<p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
						Spread Offset (Delta)
					</p>
					<p className='text-lg font-semibold text-gray-900 dark:text-white'>
						{trade.deltaBps > 0 ? '+' : ''}{trade.deltaBps} bps
					</p>
				</div>
			</div>

			<div className='bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
				{isPriceLoading ? (
					<div className='flex items-center text-blue-700 dark:text-blue-300 text-sm'>
						<Hourglass className='w-4 h-4 mr-2 animate-spin' />
						Estimating current payout...
					</div>
				) : vwapPrice && settlementData ? (
					<div className='flex justify-between items-center'>
						<div>
							<p className='text-xs font-medium text-blue-900 dark:text-blue-200 mb-1'>Current Est. Price</p>
							<p className='text-lg font-bold text-blue-700 dark:text-blue-300'>{formatTrimmed(vwapPrice)} USDC</p>
						</div>
						<div className='text-right'>
							<p className='text-xs font-medium text-blue-900 dark:text-blue-200 mb-1'>Est. Payout</p>
							<p className='text-lg font-bold text-green-600 dark:text-green-400'>
								{formatTrimmed(settlementData.payout)} {settlementData.payoutToken}
							</p>
							{settlementData.refund > 0 && (
								<p className='text-[10px] text-blue-500'>+ {formatTrimmed(settlementData.refund)} refund</p>
							)}
						</div>
					</div>
				) : (
					<div>
						<p className='text-sm font-medium text-amber-900 dark:text-amber-200 mb-1 flex items-center'>
							<Info className='w-4 h-4 mr-1' />
							Pending Final 12H VWAP
						</p>
						<p className='text-xs text-amber-700 dark:text-amber-300'>
							Price will be finalized when the locking period ends.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
