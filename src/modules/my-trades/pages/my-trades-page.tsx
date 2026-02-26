import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { HistoryTab } from '@/modules/my-trades/components/history-tab';
import { LockingTab } from '@/modules/my-trades/components/locking-tab';
import { ReadyToSettleTab } from '@/modules/my-trades/components/ready-to-settle-tab';
import { useTrades } from '@/api/use-trades-api';
import { mapApiTradeToUITrade } from '../utils/trade-mapper';
import { useSettleTrade, useRefundTrade } from '../hooks/use-trade-actions';

export function MyTradesPage() {
	const { address } = useAccount();
	// Auto-refresh trades every 30 seconds
	const { data: apiTrades, isLoading, isError, refetch } = useTrades({ 
		address: address as string,
	});

	const { settle, data: settleHash, isPending: isSettleSubmitPending, error: settleError, reset: resetSettle } = useSettleTrade();
	const { refund, data: refundHash, isPending: isRefundSubmitPending, error: refundError, reset: resetRefund } = useRefundTrade();

	const { isLoading: isSettleConfirming, isSuccess: isSettleSuccess } = useWaitForTransactionReceipt({ hash: settleHash });
	const { isLoading: isRefundConfirming, isSuccess: isRefundSuccess } = useWaitForTransactionReceipt({ hash: refundHash });

	const [activeTab, setActiveTab] = useState<'locking' | 'settle' | 'history'>(
		'locking',
	);

	const trades = useMemo(() => {
		if (!apiTrades || !address) return [];
		return apiTrades.map((t) => mapApiTradeToUITrade(t, address));
	}, [apiTrades, address]);

	// Optimized: Memoize filtered lists to avoid re-calculating on every render
	const { lockingTrades, readyToSettleTrades, historyTrades } = useMemo(() => ({
		lockingTrades: trades.filter((t) => t.status === 'locking'),
		readyToSettleTrades: trades.filter(
			(t) => t.status === 'ready_to_settle' || t.status === 'expired_refundable',
		),
		historyTrades: trades.filter(
			(t) => t.status === 'settled' || t.status === 'refunded',
		),
	}), [trades]);

	// Refetch trades when a transaction is confirmed on-chain
	useEffect(() => {
		if (isSettleSuccess) {
			toast.success('Trade settled successfully!');
			refetch();
			resetSettle();
		}
		if (isRefundSuccess) {
			toast.success('Refund claimed successfully!');
			refetch();
			resetRefund();
		}
	}, [isSettleSuccess, isRefundSuccess, refetch, resetSettle, resetRefund]);

	// Error handling
	useEffect(() => {
		if (settleError) toast.error(`Settlement failed: ${settleError.message}`);
		if (refundError) toast.error(`Refund failed: ${refundError.message}`);
	}, [settleError, refundError]);

	// Optimized: Use useCallback to maintain stable function references
	const handleSettle = useCallback((tradeId: string) => {
		settle(tradeId);
	}, [settle]);

	const handleRefund = useCallback((tradeId: string) => {
		refund(tradeId);
	}, [refund]);

	if (!address) {
		return (
			<div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
				<p className='text-gray-500 dark:text-gray-400'>Please connect your wallet to view your trades.</p>
			</div>
		);
	}

	if (isLoading && !apiTrades) {
		return (
			<div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600' />
			</div>
		);
	}

	if (isError) {
		return (
			<div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
				<p className='text-red-500'>Failed to load trades. Please try again later.</p>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<h1 className='text-3xl font-semibold text-gray-900 dark:text-white mb-8'>
					My Trades
				</h1>
				<div className='bg-white dark:bg-gray-800 rounded-t-xl border border-b-0 border-gray-200 dark:border-gray-700 shadow-sm'>
					<div className='flex space-x-8 px-6'>
						<button
							type='button'
							onClick={() => setActiveTab('locking')}
							className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
								activeTab === 'locking'
									? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
									: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
							}`}
						>
							Locking (In Progress)
							{lockingTrades.length > 0 && (
								<span className='ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs'>
									{lockingTrades.length}
								</span>
							)}
						</button>
						<button
							type='button'
							onClick={() => setActiveTab('settle')}
							className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
								activeTab === 'settle'
									? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
									: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
							}`}
						>
							Executable
							{readyToSettleTrades.length > 0 && (
								<span className='ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs'>
									{readyToSettleTrades.length}
								</span>
							)}
						</button>
						<button
							type='button'
							onClick={() => setActiveTab('history')}
							className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
								activeTab === 'history'
									? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
									: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
							}`}
						>
							History
						</button>
					</div>
				</div>
				<div className='bg-white dark:bg-gray-800 rounded-b-xl border border-gray-200 dark:border-gray-700 shadow-sm'>
					{activeTab === 'locking' && <LockingTab trades={lockingTrades} />}
					{activeTab === 'settle' && (
						<ReadyToSettleTab
							trades={readyToSettleTrades}
							onSettle={handleSettle}
							onRefund={handleRefund}
							isSettlePending={isSettleSubmitPending || isSettleConfirming}
							isRefundPending={isRefundSubmitPending || isRefundConfirming}
						/>
					)}
					{activeTab === 'history' && <HistoryTab trades={historyTrades} />}
				</div>
			</main>
		</div>
	);
}
