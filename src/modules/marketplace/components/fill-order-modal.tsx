import { useAppKitAccount } from '@reown/appkit/react';
import { AlertCircle, AlertTriangle, Calendar, Clock, Info, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { parseUnits } from 'viem';
import type { Order as ApiOrder } from '@/api/api.types';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { env } from '@/env';
import { formatCommonNumber, parseToBigNumber } from '@/lib/bignumber';
import { TARGET_CHAIN_ID } from '@/lib/constants';
import { shortenHash } from '@/lib/shorten-hash';
import { useModalRegister } from '@/modules/commons/hooks/modal/use-modal-register';
import { Web3SubmitButton } from '@/modules/commons/components/web3-submit-button';
import { useChainlinkEthPrice } from '@/modules/contracts/hooks/use-chainlink-eth-price';
import { useTokenAllowance } from '@/modules/contracts/hooks/use-token-allowance';
import { useTokenInfoAndBalance } from '@/modules/contracts/hooks/use-token-info-and-balance';
import { useVwapRfqTokenAddresses } from '@/modules/contracts/hooks/use-vwap-rfq-token-addresses';
import { useVerifyOrderHash } from '@/modules/marketplace/hooks/use-verify-order-hash';
import { mapOrderToMarketplaceOrder } from '@/modules/marketplace/utils/order-mapper';

const MODAL_KEY = 'fill-order';
const USDC_DECIMALS = 6;
const WETH_DECIMALS = 18;

interface FillOrderModalProps {
	order: ApiOrder | null;
	onConfirm: (amount: string) => void | Promise<void>;
	onCloseCallback?: () => void;
	isSubmitPending?: boolean;
}

/** Form body that depends on `order`. Only mounted when `order` is set; avoids undefined access. */
interface FillOrderFormContentProps {
	apiOrder: ApiOrder;
	depositAmount: string;
	setDepositAmount: (v: string) => void;
	onConfirm: (amount: string) => void | Promise<void>;
	isSubmitPending?: boolean;
}

function FillOrderFormContent({
	apiOrder,
	depositAmount,
	setDepositAmount,
	onConfirm: onConfirmProp,
	isSubmitPending = false,
}: FillOrderFormContentProps) {
	const chainId = TARGET_CHAIN_ID;
	const { address } = useAppKitAccount();
	const { usdc, weth } = useVwapRfqTokenAddresses(chainId);
	const { matches, diagnosis, isLoading: isVerifying } =
		useVerifyOrderHash(apiOrder);

	const displayOrder = mapOrderToMarketplaceOrder(apiOrder);
	const isSellWeth = displayOrder.direction === 'SELL_WETH';
	const depositToken = isSellWeth ? 'USDC' : 'WETH';
	const tokenAddress = isSellWeth ? usdc : weth;
	const decimals = isSellWeth ? USDC_DECIMALS : WETH_DECIMALS;

	const { price, isLoading: priceLoading } =
		useChainlinkEthPrice(chainId);
	const balanceData = useTokenInfoAndBalance(
		address ?? '',
		tokenAddress ?? '',
		chainId,
	);
	const balanceStr =
		typeof balanceData?.balance === 'string' ? balanceData.balance : null;

	const contractAddress = env.VITE_VWAP_CONTRACT_ADDRESS;
	const makerTokenAddress = isSellWeth ? weth : usdc;
	const requiredAmountRaw = BigInt(apiOrder.amount_in);
	const makerBalanceData = useTokenInfoAndBalance(
		apiOrder.maker,
		makerTokenAddress ?? '',
		chainId,
	);
	const { allowance: makerAllowanceRaw, isLoading: isMakerAllowanceLoading } =
		useTokenAllowance(
			apiOrder.maker,
			makerTokenAddress,
			contractAddress ?? undefined,
			chainId,
		);
	const isMakerCapacityLoading =
		makerBalanceData?.isLoading === true || isMakerAllowanceLoading;
	const makerBalanceRaw =
		makerBalanceData && 'balanceRaw' in makerBalanceData
			? (makerBalanceData.balanceRaw as bigint | undefined)
			: undefined;
	const makerBalanceSufficient =
		!isMakerCapacityLoading &&
		makerBalanceRaw != null &&
		makerBalanceRaw >= requiredAmountRaw;
	const makerAllowanceSufficient =
		!isMakerCapacityLoading &&
		makerAllowanceRaw != null &&
		makerAllowanceRaw >= requiredAmountRaw;

	const depositAmountBn = parseToBigNumber(depositAmount);
	const balanceBn = parseToBigNumber(balanceStr ?? '0');
	const minAmountBn = parseToBigNumber(displayOrder.minAmountOut);

	const handleMinimumDeposit = useCallback(() => {
		setDepositAmount(String(displayOrder.minAmountOut));
	}, [displayOrder.minAmountOut, setDepositAmount]);

	const handleFillToMatchCurrentPrice = useCallback(() => {
		if (price === undefined) return;
		const amountBn = parseToBigNumber(displayOrder.amount);
		const marketPriceBn = parseToBigNumber(price);
		const receiveDecimals = isSellWeth ? USDC_DECIMALS : WETH_DECIMALS;
		const calculated = isSellWeth
			? amountBn.times(marketPriceBn).toFixed(receiveDecimals)
			: amountBn.div(marketPriceBn).toFixed(receiveDecimals);
		const calculatedBn = parseToBigNumber(calculated);
		const final = calculatedBn.gte(minAmountBn)
			? calculated
			: minAmountBn.toFixed(receiveDecimals);
		setDepositAmount(final);
	}, [
		price,
		displayOrder.amount,
		isSellWeth,
		minAmountBn,
		setDepositAmount,
	]);

	const hasMinError = depositAmount !== '' && depositAmountBn.lt(minAmountBn);
	const insufficientBalance =
		depositAmount !== '' && depositAmountBn.gt(balanceBn);
	const hasError = hasMinError || insufficientBalance;

	const allowanceConfig = (() => {
		if (!contractAddress || !depositAmount || depositAmountBn.lte(0))
			return null;
		if (!tokenAddress) return null;
		try {
			const amountRaw = parseUnits(depositAmount, decimals);
			return {
				tokenAddress,
				amountRaw,
				spender: contractAddress,
				tokenSymbol: depositToken,
			};
		} catch {
			return null;
		}
	})();

	const formatMinAmount = (amount: number) => formatCommonNumber(amount);

	const now = new Date();
	const settlementTime = new Date(now.getTime() + 12 * 60 * 60 * 1000);
	const settlementFormatted = settlementTime.toLocaleDateString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});

	return (
		<div className='relative bg-card rounded-xl shadow-xl w-full p-6'>
			<DialogHeader className='space-y-0'>
				<div className='flex items-center justify-between mb-6'>
					<DialogTitle className='text-2xl font-semibold text-foreground'>
						Fill Order #{shortenHash(displayOrder.id)}
					</DialogTitle>
				</div>
			</DialogHeader>
			{!isVerifying && !matches && diagnosis && (
				<div className='mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg'>
					<div className='flex items-start gap-2'>
						<AlertCircle className='w-5 h-5 text-destructive shrink-0 mt-0.5' />
						<p className='text-sm text-destructive'>
							{diagnosis}
						</p>
					</div>
				</div>
			)}
			{isMakerCapacityLoading && (
				<div className='mb-4 p-4 bg-muted/50 border border-border rounded-lg'>
					<div className='flex items-center gap-2'>
						<Loader2 className='w-5 h-5 animate-spin text-muted-foreground shrink-0' />
						<p className='text-sm text-muted-foreground'>
							Checking maker capacity…
						</p>
					</div>
				</div>
			)}
			{!isMakerCapacityLoading && !makerBalanceSufficient && (
				<div className='mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg'>
					<div className='flex items-start gap-2'>
						<AlertCircle className='w-5 h-5 text-destructive shrink-0 mt-0.5' />
						<p className='text-sm text-destructive'>
							Maker has insufficient balance to fulfill this order.
						</p>
					</div>
				</div>
			)}
			{!isMakerCapacityLoading &&
				makerBalanceSufficient &&
				!makerAllowanceSufficient && (
					<div className='mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg'>
						<div className='flex items-start gap-2'>
							<AlertTriangle className='w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5' />
							<p className='text-sm text-amber-900 dark:text-amber-200'>
								Maker has not approved sufficient allowance; fill may fail at
								settlement.
							</p>
						</div>
					</div>
				)}
			<div className='mb-6 p-4 bg-muted/50 rounded-lg'>
				<div className='flex items-center justify-between mb-2'>
					<span className='text-sm text-muted-foreground'>
						You are filling
					</span>
					<span
						className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
							isSellWeth
								? 'bg-destructive/10 text-destructive'
								: 'bg-green-500/10 text-green-600 dark:text-green-400'
						}`}
					>
						{isSellWeth ? 'Sell WETH' : 'Sell USDC'}
					</span>
				</div>
				<p className='text-lg font-semibold text-foreground'>
					{displayOrder.amount} {displayOrder.token}
				</p>
			</div>
			<div className='mb-2'>
				<label
					htmlFor='fill-order-deposit-amount'
					className='block text-sm font-medium text-foreground mb-2'
				>
					Deposit Amount ({depositToken})
				</label>
				<div className='relative'>
					<input
						id='fill-order-deposit-amount'
						type='number'
						value={depositAmount}
						onChange={(e) => setDepositAmount(e.target.value)}
						placeholder={`Min: ${formatMinAmount(displayOrder.minAmountOut)}`}
						className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-colors duration-200 bg-background text-foreground placeholder:text-muted-foreground ${
							hasError
								? 'border-destructive bg-destructive/10'
								: 'border-input'
						}`}
					/>
					<span className='absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium'>
						{depositToken}
					</span>
				</div>
				<div className='mt-2 flex flex-wrap gap-2'>
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={handleMinimumDeposit}
						className='transition-colors duration-200 cursor-pointer'
					>
						Minimum Deposit
					</Button>
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={handleFillToMatchCurrentPrice}
						disabled={price === undefined || priceLoading}
						className='transition-colors duration-200 cursor-pointer'
					>
						{priceLoading ? 'Loading price…' : 'Fill to Match Current Price'}
					</Button>
				</div>
			</div>
			{hasMinError && (
				<div className='mb-4 flex items-start space-x-2 text-destructive text-sm'>
					<AlertCircle className='w-4 h-4 shrink-0 mt-0.5' />
					<span>
						Amount must be at least {formatMinAmount(displayOrder.minAmountOut)}{' '}
						{depositToken}
					</span>
				</div>
			)}
			{insufficientBalance && (
				<div className='mb-4 flex items-start space-x-2 text-destructive text-sm'>
					<AlertCircle className='w-4 h-4 shrink-0 mt-0.5' />
					<span>Insufficient balance</span>
				</div>
			)}
			<p className='mb-4 text-sm text-muted-foreground'>
				Balance:{' '}
				{balanceData?.isLoading
					? 'Loading…'
					: balanceStr != null
						? formatCommonNumber(balanceStr)
						: '—'}{' '}
				{depositToken}
			</p>
			{!hasError && depositAmount === '' && (
				<p className='mb-4 text-sm text-muted-foreground'>
					Minimum deposit: {formatMinAmount(displayOrder.minAmountOut)} {depositToken}
				</p>
			)}
			<div className='mb-6 border border-border rounded-lg p-4 space-y-3'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center space-x-2 text-sm text-muted-foreground'>
						<Clock className='w-4 h-4 text-primary' />
						<span>Lock Duration</span>
					</div>
					<span className='font-medium text-foreground'>
						12 Hours
					</span>
				</div>
				<div className='flex items-center justify-between'>
					<div className='flex items-center space-x-2 text-sm text-muted-foreground'>
						<Calendar className='w-4 h-4 text-primary' />
						<span>Est. Settlement</span>
					</div>
					<span className='font-medium text-foreground'>
						{settlementFormatted}
					</span>
				</div>
			</div>
			<div className='mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg'>
				<div className='flex items-start space-x-2'>
					<Info className='w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5' />
					<div className='text-sm text-amber-900 dark:text-amber-200'>
						<p className='font-medium mb-1'>How it works:</p>
						<p>
							Funds will be locked for 12 hours while the VWAP is calculated.
							Excess funds will be automatically refunded based on the final
							VWAP settlement price.
						</p>
					</div>
				</div>
			</div>
			<Web3SubmitButton
				onSubmit={() => onConfirmProp(depositAmount)}
				allowanceConfig={allowanceConfig}
				submitLabel='Confirm Fill'
				submitPendingLabel='Confirming…'
				isSubmitPending={isSubmitPending}
				formDisabled={
					hasError ||
					!depositAmount ||
					depositAmountBn.lt(minAmountBn) ||
					(!isMakerCapacityLoading && !makerBalanceSufficient)
				}
				requiredChainId={chainId}
				className='w-full py-6'
			/>
		</div>
	);
}

export function FillOrderModal({
	order,
	onConfirm,
	onCloseCallback,
	isSubmitPending = false,
}: FillOrderModalProps) {
	const { isOpen, setOpen } = useModalRegister(MODAL_KEY);
	const [depositAmount, setDepositAmount] = useState('');

	const handleOpenChange = (open: boolean) => {
		setOpen(open);
		if (!open) {
			setDepositAmount('');
			onCloseCallback?.();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent
				className='max-w-lg p-0 gap-0 border-0 overflow-hidden'
				onPointerDownOutside={(e) => e.preventDefault()}
			>
				{order ? (
					<FillOrderFormContent
						apiOrder={order}
						depositAmount={depositAmount}
						setDepositAmount={setDepositAmount}
						onConfirm={onConfirm}
						isSubmitPending={isSubmitPending}
					/>
				) : null}
			</DialogContent>
		</Dialog>
	);
}

export { MODAL_KEY as FILL_ORDER_MODAL_KEY };
