import { AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import type { MakerOrder } from '@/modules/my-quotes/types/my-quotes.types';

interface RiskMonitorProps {
	orders: MakerOrder[];
}

export function RiskMonitor({ orders }: RiskMonitorProps) {
	const activeOrders = orders.filter((o) => o.status === 'active');
	const totalExposureWETH = activeOrders
		.filter((o) => o.direction === 'SELL_WETH')
		.reduce((sum, o) => sum + o.amount, 0);
	const totalExposureUSDC = activeOrders
		.filter((o) => o.direction === 'SELL_USDC')
		.reduce((sum, o) => sum + o.amount, 0);
	const allowanceWETH = 50.0;
	const allowanceUSDC = 100000;
	const walletBalanceWETH = 45.5;
	const walletBalanceUSDC = 125000;
	const wethExposurePercent = (totalExposureWETH / allowanceWETH) * 100;
	const usdcExposurePercent = (totalExposureUSDC / allowanceUSDC) * 100;

	const getZoneColor = (percent: number) => {
		if (percent >= 90)
			return {
				bg: 'bg-red-100 dark:bg-red-900/30',
				border: 'border-red-300 dark:border-red-800',
				text: 'text-red-700 dark:text-red-400',
				bar: 'bg-red-500',
			};
		if (percent >= 60)
			return {
				bg: 'bg-yellow-100 dark:bg-yellow-900/30',
				border: 'border-yellow-300 dark:border-yellow-800',
				text: 'text-yellow-700 dark:text-yellow-400',
				bar: 'bg-yellow-500',
			};
		return {
			bg: 'bg-green-100 dark:bg-green-900/30',
			border: 'border-green-300 dark:border-green-800',
			text: 'text-green-700 dark:text-green-400',
			bar: 'bg-green-500',
		};
	};

	const wethColors = getZoneColor(wethExposurePercent);
	const usdcColors = getZoneColor(usdcExposurePercent);
	const needsAllowanceIncrease =
		wethExposurePercent >= 60 || usdcExposurePercent >= 60;

	return (
		<div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6'>
			<div className='flex items-center justify-between mb-6'>
				<div className='flex items-center space-x-2'>
					<Shield className='w-5 h-5 text-blue-600 dark:text-blue-400' />
					<h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
						Risk & Allowance Monitor
					</h2>
				</div>
				{needsAllowanceIncrease && (
					<button
						type='button'
						className='flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium'
					>
						<TrendingUp className='w-4 h-4' />
						<span>Increase Allowance</span>
					</button>
				)}
			</div>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				<div
					className={`p-4 rounded-lg border ${wethColors.border} ${wethColors.bg}`}
				>
					<div className='flex items-center justify-between mb-3'>
						<div>
							<h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
								WETH Exposure
							</h3>
							<p className='text-2xl font-semibold text-gray-900 dark:text-white mt-1'>
								{totalExposureWETH.toFixed(2)} / {allowanceWETH.toFixed(2)}
							</p>
						</div>
						{wethExposurePercent >= 60 && (
							<AlertTriangle className={`w-6 h-6 ${wethColors.text}`} />
						)}
					</div>
					<div className='relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
						<div
							className={`h-full ${wethColors.bar} transition-all duration-500`}
							style={{ width: `${Math.min(wethExposurePercent, 100)}%` }}
						/>
					</div>
					<div className='flex items-center justify-between mt-2'>
						<span className='text-xs text-gray-600 dark:text-gray-400'>
							Wallet: {walletBalanceWETH.toFixed(2)} WETH
						</span>
						<span className={`text-sm font-medium ${wethColors.text}`}>
							{wethExposurePercent.toFixed(1)}%
						</span>
					</div>
					{wethExposurePercent >= 90 && (
						<p className='text-xs text-red-700 dark:text-red-400 mt-2'>
							⚠️ Critical: Risk of failed fills
						</p>
					)}
				</div>
				<div
					className={`p-4 rounded-lg border ${usdcColors.border} ${usdcColors.bg}`}
				>
					<div className='flex items-center justify-between mb-3'>
						<div>
							<h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
								USDC Exposure
							</h3>
							<p className='text-2xl font-semibold text-gray-900 dark:text-white mt-1'>
								{totalExposureUSDC.toLocaleString()} /{' '}
								{allowanceUSDC.toLocaleString()}
							</p>
						</div>
						{usdcExposurePercent >= 60 && (
							<AlertTriangle className={`w-6 h-6 ${usdcColors.text}`} />
						)}
					</div>
					<div className='relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
						<div
							className={`h-full ${usdcColors.bar} transition-all duration-500`}
							style={{ width: `${Math.min(usdcExposurePercent, 100)}%` }}
						/>
					</div>
					<div className='flex items-center justify-between mt-2'>
						<span className='text-xs text-gray-600 dark:text-gray-400'>
							Wallet: {walletBalanceUSDC.toLocaleString()} USDC
						</span>
						<span className={`text-sm font-medium ${usdcColors.text}`}>
							{usdcExposurePercent.toFixed(1)}%
						</span>
					</div>
					{usdcExposurePercent >= 90 && (
						<p className='text-xs text-red-700 dark:text-red-400 mt-2'>
							⚠️ Critical: Risk of failed fills
						</p>
					)}
				</div>
			</div>
			<div className='mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
				<div className='flex items-center justify-center space-x-6 text-xs'>
					<div className='flex items-center space-x-2'>
						<div className='w-3 h-3 bg-green-500 rounded' />
						<span className='text-gray-600 dark:text-gray-400'>
							Safe (&lt;60%)
						</span>
					</div>
					<div className='flex items-center space-x-2'>
						<div className='w-3 h-3 bg-yellow-500 rounded' />
						<span className='text-gray-600 dark:text-gray-400'>
							Warning (60-90%)
						</span>
					</div>
					<div className='flex items-center space-x-2'>
						<div className='w-3 h-3 bg-red-500 rounded' />
						<span className='text-gray-600 dark:text-gray-400'>
							Critical (&gt;90%)
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
