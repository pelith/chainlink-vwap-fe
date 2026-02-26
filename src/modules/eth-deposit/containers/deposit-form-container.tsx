/**
 * Integration layer: wires balance hooks, form state, and WETH deposit flow
 * to the presentational DepositForm.
 */

import { useAppKitAccount } from '@reown/appkit/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { formatUnits, isAddress, parseUnits } from 'viem';
import { useBalance, useWaitForTransactionReceipt } from 'wagmi';
import { formatCommonNumber, parseToBigNumber } from '@/lib/bignumber';
import { TARGET_CHAIN_ID } from '@/lib/constants';
import { useWeb3SubmitButton } from '@/modules/commons/hooks/use-web3-submit-button';
import { useTokenInfoAndBalance } from '@/modules/contracts/hooks/use-token-info-and-balance';
import { useVwapRfqTokenAddresses } from '@/modules/contracts/hooks/use-vwap-rfq-token-addresses';
import { DepositForm } from '@/modules/eth-deposit/components/deposit-form';
import { useDepositEth } from '@/modules/eth-deposit/hooks/use-deposit-eth';

function toAmountRaw(amountStr: string): bigint {
	try {
		if (!amountStr || Number.parseFloat(amountStr) <= 0) return 0n;
		return parseUnits(amountStr, 18);
	} catch {
		return 0n;
	}
}

export function DepositFormContainer() {
	const chainId = TARGET_CHAIN_ID;
	const { address } = useAppKitAccount();
	const [amount, setAmount] = useState('');

	const { weth, isLoading: isWethLoading } = useVwapRfqTokenAddresses(chainId);
	const { data: ethBalanceData, refetch: refetchEthBalance } = useBalance({
		address: address as `0x${string}`,
		chainId,
		query: {
			enabled: isAddress(address ?? ''),
		}
	});
	const wethBalanceData = useTokenInfoAndBalance(
		address ?? '',
		weth ?? '',
		chainId,
	);

	const ethBalanceFormatted =
		ethBalanceData?.value != null
			? formatCommonNumber(formatUnits(ethBalanceData.value, 18))
			: '—';
	const wethBalanceFormatted =
		typeof wethBalanceData?.balance === 'string'
			? formatCommonNumber(wethBalanceData.balance)
			: '—';

	const maxAmount =
		ethBalanceData?.value != null ? formatUnits(ethBalanceData.value, 18) : '0';
	const amountRaw = toAmountRaw(amount);
	const amountBn = parseToBigNumber(amount);
	const ethBalanceBn = parseToBigNumber(formatUnits(ethBalanceData?.value ?? 0n, 18) ?? '0');

	const hasInsufficientBalance =
		amount !== '' && amountBn.gt(0) && amountBn.gt(ethBalanceBn);
	const hasInvalidAmount =
		amount !== '' && (amountBn.lte(0) || amountBn.isNaN());
	const formDisabled =
		hasInsufficientBalance ||
		hasInvalidAmount ||
		!amount ||
		amountBn.lte(0) ||
		!weth ||
		isWethLoading;

	const { depositAsync, isPending: isDepositPending, hash } = useDepositEth({
		wethAddress: weth,
		amountRaw,
		chainId,
	});

	const { data: receipt } = useWaitForTransactionReceipt({ hash });

	useEffect(() => {
		if (receipt && hash) {
			refetchEthBalance();
			wethBalanceData?.refetch?.();
			setAmount('');
			toast.success('ETH deposited successfully');
		}
	}, [receipt, hash, refetchEthBalance, wethBalanceData?.refetch]);

	const handleSubmit = useCallback(async () => {
		try {
			await depositAsync();
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			toast.error(message);
		}
	}, [depositAsync]);

	const { label, onClick, isPending, disabled } = useWeb3SubmitButton({
		requiredChainId: chainId,
		onSubmit: handleSubmit,
		allowanceConfig: null,
		submitLabel: 'Deposit ETH',
		formDisabled,
		isSubmitPending: isDepositPending,
	});

	const errorMessage =
		hasInsufficientBalance
			? 'Insufficient ETH balance'
			: hasInvalidAmount
				? 'Please enter a valid amount'
				: null;

	return (
		<DepositForm
			amount={amount}
			onAmountChange={setAmount}
			ethBalanceDisplay={ethBalanceFormatted}
			wethBalanceDisplay={wethBalanceFormatted}
			maxAmount={maxAmount}
			submitLabel={label}
			onSubmitClick={onClick}
			submitDisabled={disabled}
			submitIsPending={isPending}
			errorMessage={errorMessage}
		/>
	);
}
