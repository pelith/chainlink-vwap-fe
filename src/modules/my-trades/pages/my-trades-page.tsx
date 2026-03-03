import { useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import { useTrades } from '@/api/use-trades-api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HistoryTab } from '@/modules/my-trades/components/history-tab';
import { LockingTab } from '@/modules/my-trades/components/locking-tab';
import { ReadyToSettleTab } from '@/modules/my-trades/components/ready-to-settle-tab';
import { mapApiTradeToUITrade } from '../utils/trade-mapper';

export function MyTradesPage() {
	const { address } = useAccount();
	const { data: apiTrades, isLoading, isError, refetch } = useTrades({
		address: address as string,
	});

	const trades = useMemo(() => {
		if (!apiTrades || !address) return [];
		return apiTrades.map((t) => mapApiTradeToUITrade(t, address));
	}, [apiTrades, address]);

	const { lockingTrades, readyToSettleTrades, historyTrades } = useMemo(() => ({
		lockingTrades: trades.filter((t) => t.status === 'locking'),
		readyToSettleTrades: trades.filter(
			(t) => t.status === 'ready_to_settle' || t.status === 'expired_refundable',
		),
		historyTrades: trades.filter(
			(t) => t.status === 'settled' || t.status === 'refunded',
		),
	}), [trades]);

	const handleTradeSuccess = useCallback(
		(type: 'settle' | 'refund') => {
			toast.success(
				type === 'settle' ? 'Trade settled successfully!' : 'Refund claimed successfully!',
			);
			refetch();
		},
		[refetch],
	);

	if (!address) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center'>
				<p className='text-muted-foreground'>Please connect your wallet to view your trades.</p>
			</div>
		);
	}

	if (isError) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center'>
				<p className='text-destructive'>Failed to load trades. Please try again later.</p>
			</div>
		);
	}

	if (isLoading && !apiTrades) {
		return (
			<div className='min-h-screen bg-background'>
				<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
					<Skeleton className='h-9 w-48 mb-6' />
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
						<Skeleton className='h-20 rounded-xl' />
						<Skeleton className='h-20 rounded-xl' />
						<Skeleton className='h-20 rounded-xl' />
					</div>
					<Card>
						<CardContent className='pt-6'>
							<div className='space-y-4'>
								<Skeleton className='h-12 w-full rounded-xl' />
								<Skeleton className='h-32 w-full rounded-xl' />
								<Skeleton className='h-32 w-full rounded-xl' />
							</div>
						</CardContent>
					</Card>
				</main>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-background'>
			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<h1 className='text-3xl font-semibold text-foreground mb-6'>
					My Trades
				</h1>

				{/* KPI Summary - at-a-glance */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
					<Card className='cursor-default transition-colors duration-200 hover:bg-muted/50'>
						<CardContent className='pt-6'>
							<p className='text-sm text-muted-foreground mb-1'>Locking</p>
							<p className='text-2xl font-semibold text-foreground'>{lockingTrades.length}</p>
						</CardContent>
					</Card>
					<Card className='cursor-default transition-colors duration-200 hover:bg-muted/50'>
						<CardContent className='pt-6'>
							<p className='text-sm text-muted-foreground mb-1'>Executable</p>
							<p className='text-2xl font-semibold text-foreground'>{readyToSettleTrades.length}</p>
						</CardContent>
					</Card>
					<Card className='cursor-default transition-colors duration-200 hover:bg-muted/50'>
						<CardContent className='pt-6'>
							<p className='text-sm text-muted-foreground mb-1'>History</p>
							<p className='text-2xl font-semibold text-foreground'>{historyTrades.length}</p>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardContent className='pt-6'>
						<Tabs defaultValue='locking' className='w-full'>
							<TabsList className='w-full h-11 p-1 bg-muted/80 grid grid-cols-3 mb-4'>
							<TabsTrigger
								value='locking'
								className='rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-colors duration-200 cursor-pointer'
							>
								Locking
								{lockingTrades.length > 0 && (
									<span className='ml-2 px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-medium'>
										{lockingTrades.length}
									</span>
								)}
							</TabsTrigger>
							<TabsTrigger
								value='settle'
								className='rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-colors duration-200 cursor-pointer'
							>
								Executable
								{readyToSettleTrades.length > 0 && (
									<span className='ml-2 px-2 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs font-medium'>
										{readyToSettleTrades.length}
									</span>
								)}
							</TabsTrigger>
							<TabsTrigger
								value='history'
								className='rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-colors duration-200 cursor-pointer'
							>
								History
							</TabsTrigger>
						</TabsList>
						<TabsContent value='locking' className='mt-0'>
							<LockingTab trades={lockingTrades} />
						</TabsContent>
						<TabsContent value='settle' className='mt-0'>
							<ReadyToSettleTab
								trades={readyToSettleTrades}
								onSuccess={handleTradeSuccess}
							/>
						</TabsContent>
						<TabsContent value='history' className='mt-0'>
							<HistoryTab trades={historyTrades} />
						</TabsContent>
					</Tabs>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
