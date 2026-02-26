import { useAppKitAccount } from '@reown/appkit/react';
import { AlertCircle, Calendar, Clock, Info } from 'lucide-react';
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

	const contractAddress = env.VITE_VWAP_CONTRACT_ADDRESS;
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
		<div className='relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full p-6'>
			<DialogHeader className='space-y-0'>
				<div className='flex items-center justify-between mb-6'>
					<DialogTitle className='text-2xl font-semibold text-gray-900 dark:text-white'>
						Fill Order #{shortenHash(displayOrder.id)}
					</DialogTitle>
				</div>
			</DialogHeader>
			{!isVerifying && !matches && diagnosis && (
				<div className='mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
					<div className='flex items-start gap-2'>
						<AlertCircle className='w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5' />
						<p className='text-sm text-red-800 dark:text-red-200'>
							{diagnosis}
						</p>
					</div>
				</div>
			)}
			<div className='mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg'>
				<div className='flex items-center justify-between mb-2'>
					<span className='text-sm text-gray-600 dark:text-gray-400'>
						You are filling
					</span>
					<span
						className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
							isSellWeth
								? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
								: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
						}`}
					>
						{isSellWeth ? 'Sell WETH' : 'Sell USDC'}
					</span>
				</div>
				<p className='text-lg font-semibold text-gray-900 dark:text-white'>
					{displayOrder.amount} {displayOrder.token}
				</p>
			</div>
			<div className='mb-2'>
				<label
					htmlFor='fill-order-deposit-amount'
					className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
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
						className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-gray-900/50 dark:text-white dark:placeholder-gray-400 ${
							hasError
								? 'border-red-500 bg-red-50 dark:bg-red-900/20'
								: 'border-gray-300 dark:border-gray-600'
						}`}
					/>
					<span className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium'>
						{depositToken}
					</span>
				</div>
				<div className='mt-2 flex flex-wrap gap-2'>
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={handleMinimumDeposit}
					>
						Minimum Deposit
					</Button>
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={handleFillToMatchCurrentPrice}
						disabled={price === undefined || priceLoading}
					>
						{priceLoading ? 'Loading price…' : 'Fill to Match Current Price'}
					</Button>
				</div>
			</div>
			{hasMinError && (
				<div className='mb-4 flex items-start space-x-2 text-red-600 dark:text-red-400 text-sm'>
					<AlertCircle className='w-4 h-4 shrink-0 mt-0.5' />
					<span>
						Amount must be at least {formatMinAmount(displayOrder.minAmountOut)}{' '}
						{depositToken}
					</span>
				</div>
			)}
			{insufficientBalance && (
				<div className='mb-4 flex items-start space-x-2 text-red-600 dark:text-red-400 text-sm'>
					<AlertCircle className='w-4 h-4 shrink-0 mt-0.5' />
					<span>Insufficient balance</span>
				</div>
			)}
			<p className='mb-4 text-sm text-gray-500 dark:text-gray-400'>
				Balance:{' '}
				{balanceData?.isLoading
					? 'Loading…'
					: balanceStr != null
						? formatCommonNumber(balanceStr)
						: '—'}{' '}
				{depositToken}
			</p>
			{!hasError && depositAmount === '' && (
				<p className='mb-4 text-sm text-gray-500 dark:text-gray-400'>
					Minimum deposit: {formatMinAmount(displayOrder.minAmountOut)} {depositToken}
				</p>
			)}
			<div className='mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300'>
						<Clock className='w-4 h-4 text-blue-600 dark:text-blue-400' />
						<span>Lock Duration</span>
					</div>
					<span className='font-medium text-gray-900 dark:text-white'>
						12 Hours
					</span>
				</div>
				<div className='flex items-center justify-between'>
					<div className='flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300'>
						<Calendar className='w-4 h-4 text-purple-600 dark:text-purple-400' />
						<span>Est. Settlement</span>
					</div>
					<span className='font-medium text-gray-900 dark:text-white'>
						{settlementFormatted}
					</span>
				</div>
			</div>
			<div className='mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg'>
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
				formDisabled={hasError || !depositAmount || depositAmountBn.lt(minAmountBn)}
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
