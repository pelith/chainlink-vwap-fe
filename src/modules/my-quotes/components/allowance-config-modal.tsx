import { useAppKitAccount } from '@reown/appkit/react';
import { Info, Shield, Wallet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { sepolia } from 'wagmi/chains';
import { toast } from 'sonner';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { env } from '@/env';
import { formatCommonNumber } from '@/lib/bignumber';
import { useModalRegister } from '@/modules/commons/hooks/modal/use-modal-register';
import { useWeb3SubmitButton } from '@/modules/commons/hooks/use-web3-submit-button';
import { useTokenAllowance } from '@/modules/contracts/hooks/use-token-allowance';
import { useTokenInfoAndBalance } from '@/modules/contracts/hooks/use-token-info-and-balance';
import { useVwapRfqTokenAddresses } from '@/modules/contracts/hooks/use-vwap-rfq-token-addresses';
import type { MakerOrder } from '@/modules/my-quotes/types/my-quotes.types';

const MODAL_KEY = 'allowance-config';
const WETH_DECIMALS = 18;
const USDC_DECIMALS = 6;

export const ALLOWANCE_CONFIG_MODAL_KEY = MODAL_KEY;

interface AllowanceConfigModalProps {
	orders: MakerOrder[];
}

type TokenTab = 'WETH' | 'USDC';

function computeTotalExposure(
	orders: MakerOrder[],
	direction: 'SELL_WETH' | 'SELL_USDC',
): number {
	const activeOrders = orders.filter((o) => o.status === 'active');
	return activeOrders
		.filter((o) => o.direction === direction)
		.reduce((sum, o) => sum + o.amount, 0);
}

interface TokenAllowanceFormProps {
	token: TokenTab;
	tokenAddress: string | undefined;
	decimals: number;
	tokenSymbol: string;
	totalExposure: number;
	onDone?: () => void;
}

function TokenAllowanceForm({
	token,
	tokenAddress,
	decimals,
	tokenSymbol,
	totalExposure,
	onDone,
}: TokenAllowanceFormProps) {
	const chainId = sepolia.id;
	const { address } = useAppKitAccount();
	const contractAddress = env.VITE_VWAP_CONTRACT_ADDRESS;

	const balanceData = useTokenInfoAndBalance(
		address ?? '',
		tokenAddress ?? '',
		chainId,
	);
	const { allowance: allowanceRaw, refetch: refetchAllowance } =
		useTokenAllowance(address, tokenAddress, contractAddress, chainId);

	const balanceStr =
		typeof balanceData?.balance === 'string' ? balanceData.balance : null;
	const walletBalanceNum = balanceStr != null ? Number(balanceStr) : 0;
	const currentAllowanceNum =
		allowanceRaw != null ? Number(formatUnits(allowanceRaw, decimals)) : 0;

	const minAmount = Math.max(totalExposure, 0);
	const maxAmount = Math.max(walletBalanceNum, minAmount);
	const range = maxAmount - minAmount;

	const formatAmount = useCallback(
		(val: number) => val.toFixed(decimals === 18 ? 4 : 2),
		[decimals],
	);

	const [amount, setAmount] = useState<string>(() =>
		range > 0 ? formatAmount(maxAmount) : '0',
	);

	// Reset amount when token/data changes
	useEffect(() => {
		const min = Math.max(totalExposure, 0);
		const max = Math.max(walletBalanceNum, min);
		const r = max - min;
		if (r > 0) {
			setAmount(formatAmount(max));
		} else {
			setAmount(formatAmount(min));
		}
	}, [token, totalExposure, walletBalanceNum, decimals, formatAmount]);

	const amountNum = Number.parseFloat(amount) || 0;
	const clampedAmount = Math.max(minAmount, Math.min(maxAmount, amountNum));
	const displayedSliderValue =
		range > 0 ? Math.round(((clampedAmount - minAmount) / range) * 100) : 0;

	const handleSliderChange = useCallback(
		(value: number[]) => {
			const pct = value[0] ?? 0;
			if (range > 0) {
				const v = minAmount + (range * pct) / 100;
				setAmount(formatAmount(v));
			}
		},
		[minAmount, range, formatAmount],
	);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setAmount(e.target.value);
		},
		[],
	);

	let amountRaw: bigint;
	try {
		amountRaw = parseUnits(amount || '0', decimals);
	} catch {
		amountRaw = 0n;
	}

	const allowanceConfig = useMemo(() => {
		if (!contractAddress || !tokenAddress || amountRaw <= 0n) return null;
		return {
			tokenAddress,
			amountRaw,
			spender: contractAddress,
			tokenSymbol,
		};
	}, [contractAddress, tokenAddress, amountRaw, tokenSymbol]);

	const hasError = amountNum < minAmount || amountNum > maxAmount;

	const { label, onClick, isPending, disabled } = useWeb3SubmitButton({
		requiredChainId: sepolia.id,
		onSubmit: () => {
			toast.success(`Allowance updated for ${tokenSymbol}`);
			refetchAllowance();
			onDone?.();
		},
		allowanceConfig,
		submitLabel: 'Done',
		submitPendingLabel: 'Done',
		formDisabled: hasError || amountNum <= 0,
	});

	const handleClick = useCallback(async () => {
		try {
			await onClick();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : String(err));
		}
	}, [onClick]);

	const tokenBadgeClass =
		token === 'WETH'
			? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
			: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';

	return (
		<div className='space-y-6'>
			<div className='p-4 rounded-xl bg-muted/50 dark:bg-muted/20 border border-border space-y-3'>
				<div className='flex items-center justify-between'>
					<span className='flex items-center gap-2 text-sm text-muted-foreground'>
						<Shield className='size-4' />
						Current Allowance
					</span>
					<span className='font-semibold tabular-nums'>
						{currentAllowanceNum > 0
							? formatCommonNumber(currentAllowanceNum.toString())
							: '0'}{' '}
						{tokenSymbol}
					</span>
				</div>
				<div className='flex items-center justify-between'>
					<span className='flex items-center gap-2 text-sm text-muted-foreground'>
						<Wallet className='size-4' />
						Wallet Balance
					</span>
					<span className='font-semibold tabular-nums'>
						{balanceData?.isLoading
							? 'Loading…'
							: balanceStr != null
								? `${formatCommonNumber(balanceStr)} ${tokenSymbol}`
								: '—'}
					</span>
				</div>
				<div className='flex items-center justify-between pt-1 border-t border-border'>
					<span className='text-sm text-muted-foreground'>
						Open Orders Exposure
					</span>
					<span className='font-medium tabular-nums'>
						{formatCommonNumber(totalExposure.toString())} {tokenSymbol}
					</span>
				</div>
			</div>

			<div>
				<label
					htmlFor={`allowance-amount-${token}`}
					className='block text-sm font-medium mb-2'
				>
					Set allowance amount
				</label>
				<div className='relative'>
					<Input
						id={`allowance-amount-${token}`}
						type='number'
						value={amount}
						onChange={handleInputChange}
						placeholder={formatAmount(minAmount)}
						className={`h-12 text-base pr-16 ${
							hasError
								? 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
								: ''
						}`}
					/>
					<span
						className={`absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md text-sm font-medium ${tokenBadgeClass}`}
					>
						{tokenSymbol}
					</span>
				</div>
			</div>

			{range > 0 && (
				<fieldset className='space-y-3 border-0 p-0 m-0'>
					<div className='flex justify-between text-xs text-muted-foreground'>
						<span>{formatAmount(minAmount)}</span>
						<span>Slider</span>
						<span>{formatAmount(maxAmount)}</span>
					</div>
					<Slider
						value={[displayedSliderValue]}
						onValueChange={handleSliderChange}
						min={0}
						max={100}
						className='py-2'
					/>
				</fieldset>
			)}

			{hasError && amount !== '' && (
				<p className='text-sm text-red-600 dark:text-red-400 flex items-center gap-2'>
					<Info className='size-4 shrink-0' />
					Amount must be between {formatAmount(minAmount)} and {formatAmount(maxAmount)}{' '}
					{tokenSymbol}
				</p>
			)}

			<button
				type='button'
				onClick={handleClick}
				disabled={disabled}
				className='w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 active:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed'
			>
				{isPending ? (
					<span className='flex items-center justify-center gap-2'>
						<span className='size-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
						{label}
					</span>
				) : (
					label
				)}
			</button>
		</div>
	);
}

export function AllowanceConfigModal({ orders }: AllowanceConfigModalProps) {
	const { isOpen, setOpen } = useModalRegister(MODAL_KEY);
	const chainId = sepolia.id;
	const { weth: wethAddress, usdc: usdcAddress } =
		useVwapRfqTokenAddresses(chainId);

	const totalExposureWETH = computeTotalExposure(orders, 'SELL_WETH');
	const totalExposureUSDC = computeTotalExposure(orders, 'SELL_USDC');

	const handleOpenChange = useCallback(
		(open: boolean) => {
			setOpen(open);
		},
		[setOpen],
	);

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent
				className='max-w-md p-0 gap-0 overflow-hidden sm:rounded-2xl'
				onPointerDownOutside={(e) => e.preventDefault()}
			>
				<div className='w-full p-6'>
					<DialogHeader className='space-y-1 mb-6'>
						<div className='flex items-center gap-2'>
							<div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
								<Shield className='size-5' />
							</div>
							<div>
								<DialogTitle className='text-xl font-semibold tracking-tight'>
									Allowance Config
								</DialogTitle>
								<p className='text-sm text-muted-foreground'>
									Approve token spending for the VWAP contract
								</p>
							</div>
						</div>
					</DialogHeader>
					<Tabs defaultValue='WETH' className='w-full'>
						<TabsList className='grid w-full grid-cols-2 h-11 mb-6 p-1 bg-muted/80'>
							<TabsTrigger
								value='WETH'
								className='rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm'
							>
								WETH
							</TabsTrigger>
							<TabsTrigger
								value='USDC'
								className='rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm'
							>
								USDC
							</TabsTrigger>
						</TabsList>
						<TabsContent value='WETH' className='mt-0'>
							<TokenAllowanceForm
								token='WETH'
								tokenAddress={wethAddress}
								decimals={WETH_DECIMALS}
								tokenSymbol='WETH'
								totalExposure={totalExposureWETH}
								onDone={() => setOpen(false)}
							/>
						</TabsContent>
						<TabsContent value='USDC' className='mt-0'>
							<TokenAllowanceForm
								token='USDC'
								tokenAddress={usdcAddress}
								decimals={USDC_DECIMALS}
								tokenSymbol='USDC'
								totalExposure={totalExposureUSDC}
								onDone={() => setOpen(false)}
							/>
						</TabsContent>
					</Tabs>
				</div>
			</DialogContent>
		</Dialog>
	);
}
