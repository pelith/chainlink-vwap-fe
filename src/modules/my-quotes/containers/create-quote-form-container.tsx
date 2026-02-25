/**
 * Integration layer: wires data hooks, form state, and Web3 submit flow
 * to the presentational CreateQuoteForm.
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { useAppKitAccount } from '@reown/appkit/react';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { parseUnits } from 'viem';
import { sepolia } from 'wagmi/chains';
import { env } from '@/env';
import { formatCommonNumber, parseToBigNumber } from '@/lib/bignumber';
import { useWeb3SubmitButton } from '@/modules/commons/hooks/use-web3-submit-button';
import { useChainlinkEthPrice } from '@/modules/contracts/hooks/use-chainlink-eth-price';
import { useTokenInfoAndBalance } from '@/modules/contracts/hooks/use-token-info-and-balance';
import { useVwapRfqTokenAddresses } from '@/modules/contracts/hooks/use-vwap-rfq-token-addresses';
import { CreateQuoteForm } from '@/modules/my-quotes/components/create-quote-form';
import type { CreateOrderPhase } from '@/modules/my-quotes/hooks/use-create-order-flow';
import type { CreateQuoteFormValues } from '@/modules/my-quotes/schemas/create-quote-form-schema';
import { createQuoteFormSchema } from '@/modules/my-quotes/schemas/create-quote-form-schema';

const WETH_DECIMALS = 18;
const USDC_DECIMALS = 6;

const DEFAULT_VALUES: CreateQuoteFormValues = {
	direction: 'SELL_WETH',
	amount: '',
	delta: '',
	minAmountOut: '',
	deadline: '12',
};

export interface CreateQuoteFormContainerProps {
	onSubmit: (data: CreateQuoteFormValues) => void | Promise<void>;
	phase: CreateOrderPhase;
	isDisabled: boolean;
}

export function CreateQuoteFormContainer({
	onSubmit,
	phase,
	isDisabled,
}: CreateQuoteFormContainerProps) {
	const chainId = sepolia.id;
	const { address } = useAppKitAccount();
	const form = useForm<CreateQuoteFormValues>({
		resolver: zodResolver(createQuoteFormSchema),
		defaultValues: DEFAULT_VALUES,
	});

	const direction = form.watch('direction');
	const delta = form.watch('delta');
	const amountStr = form.watch('amount');
	const sellToken = direction === 'SELL_WETH' ? 'WETH' : 'USDC';
	const receiveToken = direction === 'SELL_WETH' ? 'USDC' : 'WETH';

	const { usdc, weth } = useVwapRfqTokenAddresses(chainId);
	const { price, isLoading: priceLoading } = useChainlinkEthPrice(chainId);
	const tokenAddressForBalance = direction === 'SELL_WETH' ? weth : usdc;
	const balanceData = useTokenInfoAndBalance(
		address ?? '',
		tokenAddressForBalance ?? '',
		chainId,
	);
	const walletBalance =
		typeof balanceData?.balance === 'string' ? balanceData.balance : null;

	const contractAddress = env.VITE_VWAP_CONTRACT_ADDRESS;
	const allowanceConfig = (() => {
		if (!contractAddress || !amountStr || Number.parseFloat(amountStr) <= 0)
			return null;
		const tokenAddr = direction === 'SELL_WETH' ? weth : usdc;
		if (!tokenAddr) return null;
		try {
			const decimals =
				direction === 'SELL_WETH' ? WETH_DECIMALS : USDC_DECIMALS;
			const amountRaw = parseUnits(amountStr, decimals);
			return {
				tokenAddress: tokenAddr,
				amountRaw,
				spender: contractAddress,
				tokenSymbol: sellToken,
			};
		} catch {
			return null;
		}
	})();

	const handleSubmitAction = useCallback(async () => {
		const valid = await form.trigger();
		if (!valid) return;
		const data = form.getValues();
		await onSubmit(data);
		form.reset(DEFAULT_VALUES);
	}, [form, onSubmit]);

	const { step, label, onClick, isPending, disabled } = useWeb3SubmitButton({
		requiredChainId: sepolia.id,
		onSubmit: handleSubmitAction,
		allowanceConfig,
		submitLabel: 'Sign & Create Order',
		submitPendingLabel:
			phase === 'signing'
				? 'Waiting for signature…'
				: phase === 'submitting'
					? 'Creating order…'
					: undefined,
		formDisabled: !form.formState.isValid,
		isSubmitPending: phase !== 'idle',
	});

	const deltaPercent = delta
		? (Number.parseFloat(delta) / 100).toFixed(2)
		: '0.00';
	const isPositiveDelta = Number.parseFloat(delta || '0') >= 0;

	const handleAutoCalculate = useCallback(() => {
		if (price === undefined) {
			toast.error('Price unavailable');
			return;
		}
		const amount = form.getValues('amount');
		if (!amount) return;
		const amountBn = parseToBigNumber(amount);
		const marketPriceBn = parseToBigNumber(price);
		if (direction === 'SELL_WETH') {
			form.setValue(
				'minAmountOut',
				amountBn.times(marketPriceBn).times(0.8).integerValue().toString(),
			);
		} else {
			form.setValue(
				'minAmountOut',
				amountBn.div(marketPriceBn).times(0.8).toFixed(2),
			);
		}
	}, [form, price, direction]);

	const balanceDisplayText = balanceData?.isLoading
		? 'Loading…'
		: walletBalance != null
			? formatCommonNumber(walletBalance)
			: '—';

	const autoCalculateButtonLabel = priceLoading
		? 'Loading price…'
		: price === undefined
			? 'Price unavailable'
			: 'Auto-calculate based on market price';

	const submitDisabled = disabled || (isDisabled && step === 'submit');

	return (
		<CreateQuoteForm
			form={form}
			sellToken={sellToken}
			receiveToken={receiveToken}
			balanceDisplayText={balanceDisplayText}
			deltaPercent={deltaPercent}
			isPositiveDelta={isPositiveDelta}
			autoCalculateButtonLabel={autoCalculateButtonLabel}
			autoCalculateDisabled={price === undefined}
			onAutoCalculate={handleAutoCalculate}
			submitButtonLabel={label}
			onSubmitClick={onClick}
			submitDisabled={submitDisabled}
			submitIsPending={isPending}
		/>
	);
}
