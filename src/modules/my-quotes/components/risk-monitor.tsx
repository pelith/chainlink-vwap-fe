import { formatUnits } from 'viem';
import { sepolia } from 'wagmi/chains';
import { AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import { useAppKitAccount } from '@reown/appkit/react';
import { env } from '@/env';
import { formatCommonNumber } from '@/lib/bignumber';
import { useTokenAllowance } from '@/modules/contracts/hooks/use-token-allowance';
import { useTokenInfoAndBalance } from '@/modules/contracts/hooks/use-token-info-and-balance';
import { useVwapRfqTokenAddresses } from '@/modules/contracts/hooks/use-vwap-rfq-token-addresses';
import type { MakerOrder } from '@/modules/my-quotes/types/my-quotes.types';

const WETH_DECIMALS = 18;
const USDC_DECIMALS = 6;

interface RiskMonitorProps {
	orders: MakerOrder[];
}

export function RiskMonitor({ orders }: RiskMonitorProps) {
	const chainId = sepolia.id;
	const { address } = useAppKitAccount();
	const contractAddress = env.VITE_VWAP_CONTRACT_ADDRESS;
	const { weth: wethAddress, usdc: usdcAddress } =
		useVwapRfqTokenAddresses(chainId);

	const wethBalanceData = useTokenInfoAndBalance(
		address ?? '',
		wethAddress ?? '',
		chainId,
	);
	const usdcBalanceData = useTokenInfoAndBalance(
		address ?? '',
		usdcAddress ?? '',
		chainId,
	);

	const { allowance: allowanceWethRaw } = useTokenAllowance(
		address,
		wethAddress,
		contractAddress,
		chainId,
	);
	const { allowance: allowanceUsdcRaw } = useTokenAllowance(
		address,
		usdcAddress,
		contractAddress,
		chainId,
	);

	// Exposure: sum of open order amount / token allowance (智能合約授權額度)
	const activeOrders = orders.filter((o) => o.status === 'active');
	const totalExposureWETH = activeOrders
		.filter((o) => o.direction === 'SELL_WETH')
		.reduce((sum, o) => sum + o.amount, 0);
	const totalExposureUSDC = activeOrders
		.filter((o) => o.direction === 'SELL_USDC')
		.reduce((sum, o) => sum + o.amount, 0);

	const allowanceWETH =
		address && allowanceWethRaw != null
			? Number(formatUnits(allowanceWethRaw, WETH_DECIMALS))
			: null;
	const allowanceUSDC =
		address && allowanceUsdcRaw != null
			? Number(formatUnits(allowanceUsdcRaw, USDC_DECIMALS))
			: null;

	const walletBalanceWETH = wethBalanceData?.balance ?? null;
	const walletBalanceUSDC = usdcBalanceData?.balance ?? null;

	const wethExposurePercent =
		allowanceWETH != null && allowanceWETH > 0
			? (totalExposureWETH / allowanceWETH) * 100
			: 0;
	const usdcExposurePercent =
		allowanceUSDC != null && allowanceUSDC > 0
			? (totalExposureUSDC / allowanceUSDC) * 100
			: 0;

	const walletWethNum =
		walletBalanceWETH != null ? Number(walletBalanceWETH) : null;
	const walletUsdcNum =
		walletBalanceUSDC != null ? Number(walletBalanceUSDC) : null;

	const wethWalletPercent =
		walletWethNum != null && walletWethNum > 0
			? (totalExposureWETH / walletWethNum) * 100
			: null;
	const usdcWalletPercent =
		walletUsdcNum != null && walletUsdcNum > 0
			? (totalExposureUSDC / walletUsdcNum) * 100
			: null;
	const wethWalletSufficient =
		walletWethNum != null && walletWethNum >= totalExposureWETH;
	const usdcWalletSufficient =
		walletUsdcNum != null && walletUsdcNum >= totalExposureUSDC;

	// When wallet has sufficient balance but allowance is low, show Warning instead of Critical (user can fix by increasing allowance)
	const getZoneColor = (percent: number, walletSufficient: boolean) => {
		const wouldBeCritical = percent >= 90;
		if (wouldBeCritical && walletSufficient)
			return {
				bg: 'bg-yellow-100 dark:bg-yellow-900/30',
				border: 'border-yellow-300 dark:border-yellow-800',
				text: 'text-yellow-700 dark:text-yellow-400',
				bar: 'bg-yellow-500',
			};
		if (wouldBeCritical)
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

	const wethColors = getZoneColor(wethExposurePercent, wethWalletSufficient);
	const usdcColors = getZoneColor(usdcExposurePercent, usdcWalletSufficient);
	const wethIsCritical =
		wethExposurePercent >= 90 && !wethWalletSufficient;
	const usdcIsCritical =
		usdcExposurePercent >= 90 && !usdcWalletSufficient;
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
								{totalExposureWETH.toFixed(2)} /{' '}
								{allowanceWETH != null
									? allowanceWETH.toFixed(2)
									: '—'}
							</p>
							<p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
								Open orders / Allowance
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
							Wallet:{' '}
							{wethBalanceData?.isLoading
								? 'Loading…'
								: walletBalanceWETH != null
									? `${formatCommonNumber(walletBalanceWETH)} WETH`
									: '—'}
						</span>
						<div className='text-xs space-x-3'>
							<span
								className={wethExposurePercent >= 60 ? wethColors.text : ''}
								title='Exposure / Allowance'
							>
								Allowance {wethExposurePercent.toFixed(1)}%
							</span>
							<span className='text-gray-600 dark:text-gray-400' title='Exposure / Wallet'>
								Wallet{' '}
								{wethWalletPercent != null
									? `${wethWalletPercent.toFixed(1)}%`
									: '—'}
							</span>
						</div>
					</div>
					{wethExposurePercent >= 90 && (
						<p
							className={`text-xs mt-2 ${
								wethIsCritical
									? 'text-red-700 dark:text-red-400'
									: 'text-yellow-700 dark:text-yellow-400'
							}`}
						>
							{wethIsCritical
								? '⚠️ Critical: Risk of failed fills'
								: 'Increase allowance to enable fills'}
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
								{allowanceUSDC != null
									? allowanceUSDC.toLocaleString()
									: '—'}
							</p>
							<p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
								Open orders / Allowance
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
							Wallet:{' '}
							{usdcBalanceData?.isLoading
								? 'Loading…'
								: walletBalanceUSDC != null
									? `${formatCommonNumber(walletBalanceUSDC)} USDC`
									: '—'}
						</span>
						<div className='text-xs space-x-3'>
							<span
								className={usdcExposurePercent >= 60 ? usdcColors.text : ''}
								title='Exposure / Allowance'
							>
								Allowance {usdcExposurePercent.toFixed(1)}%
							</span>
							<span className='text-gray-600 dark:text-gray-400' title='Exposure / Wallet'>
								Wallet{' '}
								{usdcWalletPercent != null
									? `${usdcWalletPercent.toFixed(1)}%`
									: '—'}
							</span>
						</div>
					</div>
					{usdcExposurePercent >= 90 && (
						<p
							className={`text-xs mt-2 ${
								usdcIsCritical
									? 'text-red-700 dark:text-red-400'
									: 'text-yellow-700 dark:text-yellow-400'
							}`}
						>
							{usdcIsCritical
								? '⚠️ Critical: Risk of failed fills'
								: 'Increase allowance to enable fills'}
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
