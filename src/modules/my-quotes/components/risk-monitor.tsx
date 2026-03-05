import { formatUnits } from 'viem';
import { AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import { useAppKitAccount } from '@reown/appkit/react';
import { env } from '@/env';
import { Card, CardContent } from '@/components/ui/card';
import { formatCommonNumber } from '@/lib/bignumber';
import { TARGET_CHAIN_ID } from '@/lib/constants';
import { useTokenAllowance } from '@/modules/contracts/hooks/use-token-allowance';
import { useTokenInfoAndBalance } from '@/modules/contracts/hooks/use-token-info-and-balance';
import { useVwapRfqTokenAddresses } from '@/modules/contracts/hooks/use-vwap-rfq-token-addresses';
import type { MakerOrder } from '@/modules/my-quotes/types/my-quotes.types';

const WETH_DECIMALS = 18;
const USDC_DECIMALS = 6;

interface RiskMonitorProps {
	orders: MakerOrder[];
	onIncreaseAllowanceClick?: () => void;
}

export function RiskMonitor({ orders, onIncreaseAllowanceClick }: RiskMonitorProps) {
	const chainId = TARGET_CHAIN_ID;
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

	const getZoneColor = (percent: number, walletSufficient: boolean) => {
		const wouldBeCritical = percent >= 90;
		if (wouldBeCritical && walletSufficient)
			return {
				bar: 'bg-yellow-500',
				textClass: 'text-yellow-700 dark:text-yellow-400',
			};
		if (wouldBeCritical)
			return {
				bar: 'bg-destructive',
				textClass: 'text-destructive',
			};
		if (percent >= 60)
			return {
				bar: 'bg-yellow-500',
				textClass: 'text-yellow-700 dark:text-yellow-400',
			};
		return {
			bar: 'bg-green-500',
			textClass: 'text-green-700 dark:text-green-400',
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
		<Card>
			<CardContent className='pt-6'>
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center space-x-2'>
						<Shield className='w-5 h-5 text-primary' />
						<h2 className='text-lg font-semibold text-foreground'>
							Risk & Allowance Monitor
						</h2>
					</div>
					{needsAllowanceIncrease && (
						<button
							type='button'
							onClick={onIncreaseAllowanceClick}
							className='flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 text-sm font-medium cursor-pointer'
						>
							<TrendingUp className='w-4 h-4' />
							<span>Increase Allowance</span>
						</button>
					)}
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					<div
						className={`p-4 rounded-lg border ${
							wethExposurePercent >= 90
								? wethIsCritical
									? 'border-destructive/50 bg-destructive/5'
									: 'border-yellow-500/50 bg-yellow-500/5'
								: wethExposurePercent >= 60
									? 'border-yellow-500/50 bg-yellow-500/5'
									: 'border-green-500/30 bg-green-500/5'
						}`}
					>
						<div className='flex items-center justify-between mb-3'>
							<div>
								<h3 className='text-sm font-medium text-foreground'>
									WETH Exposure
								</h3>
								<p className='text-2xl font-semibold text-foreground mt-1'>
									{totalExposureWETH.toFixed(2)} /{' '}
									{allowanceWETH != null
										? formatCommonNumber(allowanceWETH.toString())
										: '—'}
								</p>
								<p className='text-xs text-muted-foreground mt-0.5'>
									Open orders / Allowance
								</p>
							</div>
							{wethExposurePercent >= 60 && (
								<AlertTriangle className={`w-6 h-6 ${wethColors.textClass}`} />
							)}
						</div>
						<div className='relative w-full h-3 bg-muted rounded-full overflow-hidden'>
							<div
								className={`h-full ${wethColors.bar} transition-all duration-500`}
								style={{ width: `${Math.min(wethExposurePercent, 100)}%` }}
							/>
						</div>
						<div className='flex items-center justify-between mt-2'>
							<span className='text-xs text-muted-foreground'>
								Wallet:{' '}
								{wethBalanceData?.isLoading
									? 'Loading…'
									: walletBalanceWETH != null
										? `${formatCommonNumber(walletBalanceWETH)} WETH`
										: '—'}
							</span>
							<div className='text-xs space-x-3'>
								<span
									className={wethExposurePercent >= 60 ? wethColors.textClass : 'text-muted-foreground'}
									title='Exposure / Allowance'
								>
									Allowance {wethExposurePercent.toFixed(1)}%
								</span>
								<span className='text-muted-foreground' title='Exposure / Wallet'>
									Wallet{' '}
									{wethWalletPercent != null
										? `${wethWalletPercent.toFixed(1)}%`
										: '—'}
								</span>
							</div>
						</div>
						{wethExposurePercent >= 90 && (
							<p
								className={`text-xs mt-2 flex items-center gap-1 ${
									wethIsCritical ? 'text-destructive' : 'text-yellow-700 dark:text-yellow-400'
								}`}
							>
								<AlertTriangle className='w-3.5 h-3.5 shrink-0' />
								{wethIsCritical
									? 'Critical: Risk of failed fills'
									: 'Increase allowance to enable fills'}
							</p>
						)}
					</div>
					<div
						className={`p-4 rounded-lg border ${
							usdcExposurePercent >= 90
								? usdcIsCritical
									? 'border-destructive/50 bg-destructive/5'
									: 'border-yellow-500/50 bg-yellow-500/5'
								: usdcExposurePercent >= 60
									? 'border-yellow-500/50 bg-yellow-500/5'
									: 'border-green-500/30 bg-green-500/5'
						}`}
					>
						<div className='flex items-center justify-between mb-3'>
							<div>
								<h3 className='text-sm font-medium text-foreground'>
									USDC Exposure
								</h3>
								<p className='text-2xl font-semibold text-foreground mt-1'>
									{totalExposureUSDC.toLocaleString()} /{' '}
									{allowanceUSDC != null
										? formatCommonNumber(allowanceUSDC.toString())
										: '—'}
								</p>
								<p className='text-xs text-muted-foreground mt-0.5'>
									Open orders / Allowance
								</p>
							</div>
							{usdcExposurePercent >= 60 && (
								<AlertTriangle className={`w-6 h-6 ${usdcColors.textClass}`} />
							)}
						</div>
						<div className='relative w-full h-3 bg-muted rounded-full overflow-hidden'>
							<div
								className={`h-full ${usdcColors.bar} transition-all duration-500`}
								style={{ width: `${Math.min(usdcExposurePercent, 100)}%` }}
							/>
						</div>
						<div className='flex items-center justify-between mt-2'>
							<span className='text-xs text-muted-foreground'>
								Wallet:{' '}
								{usdcBalanceData?.isLoading
									? 'Loading…'
									: walletBalanceUSDC != null
										? `${formatCommonNumber(walletBalanceUSDC)} USDC`
										: '—'}
							</span>
							<div className='text-xs space-x-3'>
								<span
									className={usdcExposurePercent >= 60 ? usdcColors.textClass : 'text-muted-foreground'}
									title='Exposure / Allowance'
								>
									Allowance {usdcExposurePercent.toFixed(1)}%
								</span>
								<span className='text-muted-foreground' title='Exposure / Wallet'>
									Wallet{' '}
									{usdcWalletPercent != null
										? `${usdcWalletPercent.toFixed(1)}%`
										: '—'}
								</span>
							</div>
						</div>
						{usdcExposurePercent >= 90 && (
							<p
								className={`text-xs mt-2 flex items-center gap-1 ${
									usdcIsCritical ? 'text-destructive' : 'text-yellow-700 dark:text-yellow-400'
								}`}
							>
								<AlertTriangle className='w-3.5 h-3.5 shrink-0' />
								{usdcIsCritical
									? 'Critical: Risk of failed fills'
									: 'Increase allowance to enable fills'}
							</p>
						)}
					</div>
				</div>
				<div className='mt-4 pt-4 border-t border-border'>
					<div className='flex items-center justify-center space-x-6 text-xs'>
						<div className='flex items-center space-x-2'>
							<div className='w-3 h-3 bg-green-500 rounded' />
							<span className='text-muted-foreground'>
								Safe (&lt;60%)
							</span>
						</div>
						<div className='flex items-center space-x-2'>
							<div className='w-3 h-3 bg-yellow-500 rounded' />
							<span className='text-muted-foreground'>
								Warning (60-90%)
							</span>
						</div>
						<div className='flex items-center space-x-2'>
							<div className='w-3 h-3 bg-destructive rounded' />
							<span className='text-muted-foreground'>
								Critical (&gt;90%)
							</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
