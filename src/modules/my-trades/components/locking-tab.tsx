import { Clock, Hourglass, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { useChainId } from 'wagmi';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
				<Hourglass className='w-12 h-12 text-muted-foreground/50 mx-auto mb-4' />
				<p className='text-muted-foreground text-lg'>
					No trades in locking phase
				</p>
				<p className='text-muted-foreground/80 text-sm mt-2'>
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
		<Card className='transition-colors duration-200 hover:bg-muted/30 cursor-default'>
			<CardHeader className='pb-2'>
				<div className='flex items-center justify-between'>
					<div className='flex flex-col gap-1'>
						<h3 className='text-lg font-semibold text-foreground'>
							{trade.role} · {trade.depositedToken} → {trade.targetToken}
						</h3>
						<button
							type='button'
							onClick={() => {
								navigator.clipboard.writeText(trade.id);
								toast.success('Trade ID copied');
							}}
							className='text-xs text-muted-foreground hover:text-foreground text-left transition-colors duration-200 cursor-pointer'
							title='Copy trade ID'
						>
							#{trade.id.slice(0, 8)}...{trade.id.slice(-4)}
						</button>
					</div>
					<span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary'>
						Locking Phase
					</span>
				</div>
			</CardHeader>
			<CardContent className='space-y-6'>
				<div>
					<div className='flex items-center justify-between text-xs text-muted-foreground mb-2'>
						<span>Fill Time</span>
						<div className='flex items-center space-x-1'>
							<Clock className='w-4 h-4' />
							<span className='font-medium text-primary'>
								{formatTime(remaining)} remaining
							</span>
						</div>
						<span>End Time (12h)</span>
					</div>
					<Progress value={progress} className='h-3' />
					<div className='flex items-center justify-between text-xs text-muted-foreground mt-1'>
						<span>{formatDateTime(trade.fillTime)}</span>
						<span>{formatDateTime(trade.endTime)}</span>
					</div>
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<div>
						<p className='text-sm text-muted-foreground mb-1'>Deposited</p>
						<p className='text-lg font-semibold text-foreground'>
							{formatTrimmed(trade.depositedAmount)} {trade.depositedToken}
						</p>
					</div>
					<div>
						<p className='text-sm text-muted-foreground mb-1'>Spread Offset (Delta)</p>
						<p className='text-lg font-semibold text-foreground'>
							{trade.deltaBps > 0 ? '+' : ''}{trade.deltaBps} bps
						</p>
					</div>
				</div>

				<div className='bg-primary/5 border border-primary/20 rounded-lg p-4'>
					{isPriceLoading ? (
						<div className='flex items-center text-primary text-sm'>
							<Hourglass className='w-4 h-4 mr-2 animate-spin' />
							Estimating current payout...
						</div>
					) : vwapPrice && settlementData ? (
						<div className='flex justify-between items-center'>
							<div>
								<p className='text-xs font-medium text-primary/80 mb-1'>Current Est. Price</p>
								<p className='text-lg font-bold text-primary'>{formatTrimmed(vwapPrice)} USDC</p>
							</div>
							<div className='text-right'>
								<p className='text-xs font-medium text-primary/80 mb-1'>Est. Payout</p>
								<p className='text-lg font-bold text-green-600 dark:text-green-400'>
									{formatTrimmed(settlementData.payout)} {settlementData.payoutToken}
								</p>
								{settlementData.refund > 0 && (
									<p className='text-[10px] text-primary/70'>+ {formatTrimmed(settlementData.refund)} refund</p>
								)}
							</div>
						</div>
					) : (
						<div>
							<p className='text-sm font-medium text-amber-600 dark:text-amber-400 mb-1 flex items-center'>
								<Info className='w-4 h-4 mr-1' />
								Pending Final 12H VWAP
							</p>
							<p className='text-xs text-amber-600/80 dark:text-amber-400/80'>
								Price will be finalized when the locking period ends.
							</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
