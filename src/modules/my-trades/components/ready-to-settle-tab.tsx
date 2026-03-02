import {
	AlertTriangle,
	CheckCircle,
	ChevronDown,
	ChevronUp,
	Clock,
	Info,
	Loader2,
	RefreshCw,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useChainId, useWaitForTransactionReceipt } from 'wagmi';
import { shortenHash } from '@/lib/shorten-hash';
import { useVwapOraclePrice } from '@/modules/contracts/hooks/use-vwap-oracle-price';
import { useVwapRfqConstants } from '@/modules/contracts/hooks/use-vwap-rfq-token-addresses';
import type { Trade } from '@/modules/my-trades/types/my-trades.types';
import { useRefundTrade, useSettleTrade } from '../hooks/use-trade-actions';
import { calculateSettlement } from '../utils/settlement-math';

interface ReadyToSettleTabProps {
	trades: Trade[];
	onSuccess: (type: 'settle' | 'refund') => void;
}

/** Formats a number to max 4 decimals and trims trailing zeros */
const formatTrimmed = (n: number) => {
	return Number.parseFloat(n.toFixed(4)).toString();
};

export function ReadyToSettleTab({ trades, onSuccess }: ReadyToSettleTabProps) {
	const chainId = useChainId();
	const { refundGrace } = useVwapRfqConstants(chainId);

	if (trades.length === 0) {
		return (
			<div className='p-12 text-center'>
				<CheckCircle className='w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
				<p className='text-gray-500 dark:text-gray-400 text-lg'>
					No executable trades
				</p>
				<p className='text-gray-400 dark:text-gray-500 text-sm mt-2'>
					Completed trades will appear here when the locking period ends.
				</p>
			</div>
		);
	}

	return (
		<div className='p-6 space-y-4'>
			{trades.map((trade) => (
				<SettleTradeCard
					key={trade.id}
					trade={trade}
					onSuccess={onSuccess}
					refundGrace={refundGrace}
				/>
			))}
		</div>
	);
}

function SettleTradeCard({
	trade,
	onSuccess,
	refundGrace,
}: {
	trade: Trade;
	onSuccess: (type: 'settle' | 'refund') => void;
	refundGrace?: number;
}) {
	const chainId = useChainId();
	const [isExpanded, setIsExpanded] = useState(false);

	const { settle, hash: settleHash, isPending: isSettleSubmitPending, error: settleError, reset: resetSettle } = useSettleTrade();
	const { refund, hash: refundHash, isPending: isRefundSubmitPending, error: refundError, reset: resetRefund } = useRefundTrade();

	const { isLoading: isSettleConfirming, isSuccess: isSettleSuccess } = useWaitForTransactionReceipt({ hash: settleHash });
	const { isLoading: isRefundConfirming, isSuccess: isRefundSuccess } = useWaitForTransactionReceipt({ hash: refundHash });

	const isSettlePending = isSettleSubmitPending || isSettleConfirming;
	const isRefundPending = isRefundSubmitPending || isRefundConfirming;

	useEffect(() => {
		if (isSettleSuccess) {
			onSuccess('settle');
			resetSettle();
		}
	}, [isSettleSuccess, onSuccess, resetSettle]);

	useEffect(() => {
		if (isRefundSuccess) {
			onSuccess('refund');
			resetRefund();
		}
	}, [isRefundSuccess, onSuccess, resetRefund]);

	useEffect(() => {
		if (settleError) toast.error(`Settlement failed: ${settleError.message}`);
	}, [settleError]);

	useEffect(() => {
		if (refundError) toast.error(`Refund failed: ${refundError.message}`);
	}, [refundError]);

	// Determine if refundable based on contract constants (fallback to 7 days if not loaded)
	const isRefundable = useMemo(() => {
		if (trade.status === 'expired_refundable') return true;
		const grace = refundGrace ?? 604800; // default 7 days
		const now = Date.now() / 1000;
		return trade.endTime.getTime() / 1000 + grace < now;
	}, [trade, refundGrace]);

	// Calculate aligned time window for oracle: next full hour
	const alignedEndTime = useMemo(() => {
		return BigInt(Math.ceil(trade.endTime.getTime() / 1000 / 3600) * 3600);
	}, [trade.endTime]);

	const alignedStartTime = useMemo(() => {
		return alignedEndTime - 43200n; // 12 hours
	}, [alignedEndTime]);

	const { vwapPrice, isLoading: isPriceLoading } = useVwapOraclePrice({
		startTime: alignedStartTime,
		endTime: alignedEndTime,
		chainId,
		enabled: isExpanded,
	});

	const formatDateTime = (date: Date) =>
		date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});

	// Calculation Logic using Utility
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

	const estimatedReceived = settlementData?.payout ?? 0;
	const estimatedRefund = settlementData?.refund ?? 0;
	const payoutToken = settlementData?.payoutToken ?? trade.targetToken;
	const refundToken = settlementData?.refundToken ?? trade.depositedToken;

	const isWaitingForOracle = isPriceLoading && !vwapPrice && !isRefundable;

	const statusBadge = isRefundable ? (
		<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-200 dark:bg-orange-800/50 text-orange-800 dark:text-orange-200'>
			<AlertTriangle className='w-3.5 h-3.5 mr-1' />
			Expired / Refundable
		</span>
	) : isWaitingForOracle ? (
		<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-200 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200'>
			<Clock className='w-3.5 h-3.5 mr-1 animate-pulse' />
			Waiting for Oracle
		</span>
	) : (
		<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-200 dark:bg-green-800/50 text-green-800 dark:text-green-200'>
			<CheckCircle className='w-3.5 h-3.5 mr-1' />
			Ready to Settle
		</span>
	);

	const borderStyles = isRefundable
		? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/30'
		: isWaitingForOracle
			? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10'
			: 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30';

	return (
		<div
			className={`border-2 rounded-lg transition-all ${borderStyles}`}
		>
			{/* Collapsed header - always visible, clickable */}
			<button
				type='button'
				onClick={() => setIsExpanded((prev) => !prev)}
				className='w-full flex items-center justify-between p-4 text-left hover:bg-black/5 dark:hover:bg-white/5 rounded-t-lg transition-colors'
			>
				<div className='flex items-center gap-3 flex-wrap'>
					<h3 className='text-base font-semibold text-gray-900 dark:text-white'>
						Trade #{shortenHash(trade.id)}
					</h3>
					<span className='text-sm text-gray-500 dark:text-gray-400'>
						{trade.role} · {formatTrimmed(trade.depositedAmount)} {trade.depositedToken} → {trade.targetToken}
					</span>
					{statusBadge}
				</div>
				{isExpanded ? (
					<ChevronUp className='w-5 h-5 text-gray-500 shrink-0' />
				) : (
					<ChevronDown className='w-5 h-5 text-gray-500 shrink-0' />
				)}
			</button>

			{/* Expanded content */}
			{isExpanded && (
				<div className='px-4 pb-4 pt-0 space-y-4 border-t border-gray-200/50 dark:border-gray-700/50 animate-in slide-in-from-top-2 duration-200'>
					{isRefundable ? (
						<div className='pt-4 p-4 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-lg'>
							<p className='text-sm font-medium text-orange-900 dark:text-orange-200 mb-1'>
								Settlement Window Passed
							</p>
							<p className='text-sm text-orange-700 dark:text-orange-300'>
								The grace period has ended. You can now retrieve your original deposit.
							</p>
						</div>
					) : isWaitingForOracle ? (
						<div className='pt-4 p-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg'>
							<p className='text-sm font-medium text-amber-900 dark:text-amber-200 mb-1'>
								Trade Matured, Pending Price
							</p>
							<p className='text-sm text-amber-700 dark:text-amber-300'>
								Waiting for the VWAP report ending {formatDateTime(new Date(Number(alignedEndTime) * 1000))} to be published. This usually happens shortly after the hour.
							</p>
						</div>
					) : (
						<div className='pt-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg'>
							<p className='text-sm font-medium text-green-900 dark:text-green-200 mb-1'>
								12H Window Closed
							</p>
							<p className='text-sm text-green-700 dark:text-green-300'>
								VWAP data for window ending {formatDateTime(new Date(Number(alignedEndTime) * 1000))} is ready.
							</p>
						</div>
					)}

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>Deposited</p>
							<p className='text-lg font-semibold text-gray-900 dark:text-white'>
								{formatTrimmed(trade.depositedAmount)} {trade.depositedToken}
							</p>
						</div>
						<div>
							<p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>Spread Offset (Delta)</p>
							<p className='text-lg font-semibold text-gray-900 dark:text-white'>
								{trade.deltaBps > 0 ? '+' : ''}{trade.deltaBps} bps
							</p>
						</div>
					</div>

					{!isRefundable && (
						<div className='bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
							{isPriceLoading ? (
								<div className='flex items-center justify-center py-2'>
									<Loader2 className='w-5 h-5 animate-spin text-blue-600 mr-2' />
									<span className='text-blue-700'>Fetching VWAP Price...</span>
								</div>
							) : vwapPrice ? (
								<div className='flex items-center justify-between'>
									<div className='flex-1'>
										<p className='text-sm font-medium text-blue-900 dark:text-blue-200 mb-1'>
											12H VWAP for Period
										</p>
										<p className='text-2xl font-semibold text-blue-700 dark:text-blue-300'>
											{vwapPrice.toLocaleString()} USDC
										</p>
									</div>
									<div className='text-right flex-1'>
										<p className='text-sm text-blue-700 dark:text-blue-300 mb-1'>Est. Payout</p>
										<p className='text-xl font-semibold text-green-600 dark:text-green-400'>
											{formatTrimmed(estimatedReceived)} {payoutToken}
										</p>
										<p className='text-[10px] text-blue-500 mt-1 flex items-center justify-end'>
											<Info className='w-3 h-3 mr-1' />
											Incl. {trade.deltaBps} bps spread
										</p>
									</div>
								</div>
							) : (
								<div className='flex items-center text-amber-700 dark:text-amber-300'>
									<AlertTriangle className='w-5 h-5 mr-2' />
									<span>Price report not yet published for this period.</span>
								</div>
							)}
							{!isPriceLoading && vwapPrice && estimatedRefund > 0 && (
								<div className='mt-3 pt-3 border-t border-blue-200 dark:border-blue-800/50 flex justify-between items-center'>
									<p className='text-xs font-medium text-blue-800 dark:text-blue-300'>Estimated Refund (Unused)</p>
									<p className='text-sm font-bold text-blue-600 dark:text-blue-400'>+{formatTrimmed(estimatedRefund)} {refundToken}</p>
								</div>
							)}
						</div>
					)}

					{/* Button group - only when expanded */}
					<div className='flex gap-3'>
						{isRefundable ? (
							<>
								<button
									type='button'
									onClick={(e) => {
										e.stopPropagation();
										refund(trade.id);
									}}
									disabled={isRefundPending}
									className='flex-1 flex items-center justify-center gap-2 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
								>
									{isRefundPending ? (
										<Loader2 className='w-5 h-5 animate-spin' />
									) : (
										<RefreshCw className='w-5 h-5' />
									)}
									<span>{isRefundPending ? 'Confirming...' : 'Claim Refund'}</span>
								</button>
								<button
									type='button'
									disabled
									className='flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed font-medium'
								>
									Settlement Expired
								</button>
							</>
						) : (
							<>
								<button
									type='button'
									onClick={(e) => {
										e.stopPropagation();
										settle(trade.id);
									}}
									disabled={isSettlePending || isWaitingForOracle}
									className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors font-medium text-lg ${
										isWaitingForOracle
											? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
											: 'bg-green-600 text-white hover:bg-green-700'
									} disabled:opacity-50`}
								>
									{isSettlePending ? (
										<Loader2 className='w-5 h-5 animate-spin' />
									) : isWaitingForOracle ? (
										<Clock className='w-5 h-5' />
									) : (
										<CheckCircle className='w-5 h-5' />
									)}
									<span>
										{isSettlePending
											? 'Confirming...'
											: isWaitingForOracle
												? 'Waiting for Price'
												: 'Settle Trade'}
									</span>
								</button>
								<button
									type='button'
									disabled
									className='flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed font-medium'
									title='Refund becomes active if settlement is delayed'
								>
									Refund (Locked)
								</button>
							</>
						)}
					</div>

					{!isRefundable && (
						<p className='text-xs text-gray-500 dark:text-gray-400 text-center'>
							Note: If Oracle fails or settlement is delayed beyond the grace period, Refund will become active.
						</p>
					)}
				</div>
			)}
		</div>
	);
}
