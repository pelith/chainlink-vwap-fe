/**
 * Progressive Web3 submit button: Connect → Switch Network → Approve → Submit.
 * Approve step is only enabled when allowanceConfig.spender is provided.
 */

import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useCallback, useEffect, useMemo } from 'react';
import { useSwitchChain, useWaitForTransactionReceipt } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { TARGET_CHAIN_ID } from '@/lib/constants';
import { useWalletChainId } from '@/modules/commons/hooks/use-wallet-chain-id';
import { useApproveToken } from '@/modules/contracts/hooks/use-approve-token';
import { useTokenAllowance } from '@/modules/contracts/hooks/use-token-allowance';

export type Web3SubmitStep =
	| 'connect'
	| 'switch_network'
	| 'approve'
	| 'submit';

export interface AllowanceConfig {
	tokenAddress: string;
	/** Minimum required allowance for this action. Used only to decide if Approve step is shown (allowance < amountRaw). Actual approve is always maxUint256. */
	amountRaw: bigint;
	spender: string;
	tokenSymbol: string;
}

export interface UseWeb3SubmitButtonParams {
	requiredChainId?: number;
	onSubmit: () => void | Promise<void>;
	allowanceConfig?: AllowanceConfig | null;
	submitLabel: string;
	submitPendingLabel?: string;
	formDisabled?: boolean;
	isSubmitPending?: boolean;
	switchChainLabel?: string;
}

const CHAIN_NAMES: Record<number, string> = {
	[sepolia.id]: 'Sepolia',
	[mainnet.id]: 'Mainnet',
};

export function useWeb3SubmitButton({
	requiredChainId = TARGET_CHAIN_ID,
	onSubmit,
	allowanceConfig,
	submitLabel,
	submitPendingLabel,
	formDisabled = false,
	isSubmitPending = false,
	switchChainLabel,
}: UseWeb3SubmitButtonParams) {
	const { open } = useAppKit();
	const { address, isConnected } = useAppKitAccount();
	const walletChainId = useWalletChainId();
	const chainId = requiredChainId; // Target chain for contract calls
	const { mutateAsync: switchChainAsync } = useSwitchChain();

	// Force switch to required chain when wallet is on wrong network
	useEffect(() => {
		if (
			isConnected &&
			walletChainId != null &&
			walletChainId !== requiredChainId
		) {
			switchChainAsync({ chainId: requiredChainId }).catch(() => {
				// User may reject - stay on switch_network step
			});
		}
	}, [isConnected, walletChainId, requiredChainId, switchChainAsync]);

	const hasSpender = !!allowanceConfig?.spender;

	const { allowance, refetch: refetchAllowance } = useTokenAllowance(
		address,
		allowanceConfig?.tokenAddress,
		hasSpender ? allowanceConfig?.spender : undefined,
		chainId,
	);

	const needsApproval =
		hasSpender &&
		allowanceConfig &&
		(allowance === undefined || allowance < allowanceConfig.amountRaw);

	const {
		approveAsync,
		isPending: isApprovePending,
		hash: approveHash,
	} = useApproveToken({
		tokenAddress: allowanceConfig?.tokenAddress,
		spender: allowanceConfig?.spender,
		amount: undefined,
		chainId,
	});

	const { data: approveReceipt, isLoading: isApproveConfirming } =
		useWaitForTransactionReceipt({
			hash: approveHash,
		});

	const handleConnect = useCallback(() => {
		open({ view: 'Connect' });
	}, [open]);

	const handleSwitchChain = useCallback(async () => {
		try {
			await switchChainAsync({ chainId: requiredChainId });
		} catch (err) {
			// User may reject - let caller handle via toast if desired
			throw err;
		}
	}, [switchChainAsync, requiredChainId]);

	const handleApprove = useCallback(async () => {
		await approveAsync();
		// Refetch happens in useEffect below after tx is confirmed
	}, [approveAsync]);

	// Refetch allowance after approve tx is confirmed (allowance updates on-chain only after confirmation)
	useEffect(() => {
		if (approveReceipt && approveHash) {
			refetchAllowance();
		}
	}, [approveReceipt, approveHash, refetchAllowance]);

	const handleSubmit = useCallback(async () => {
		await onSubmit();
	}, [onSubmit]);

	const step: Web3SubmitStep = useMemo(() => {
		if (!isConnected) return 'connect';
		// When connected: undefined = still fetching; different chain = need switch
		if (walletChainId === undefined || walletChainId !== requiredChainId)
			return 'switch_network';
		if (needsApproval) return 'approve';
		return 'submit';
	}, [isConnected, walletChainId, requiredChainId, needsApproval]);

	const label = useMemo(() => {
		switch (step) {
			case 'connect':
				return 'Connect Wallet';
			case 'switch_network':
				return (
					switchChainLabel ??
					`Switch to ${CHAIN_NAMES[requiredChainId] ?? 'Correct Network'}`
				);
			case 'approve':
				return `Approve ${allowanceConfig?.tokenSymbol ?? ''}`.trim();
			default:
				return isSubmitPending && submitPendingLabel
					? submitPendingLabel
					: submitLabel;
		}
	}, [
		step,
		switchChainLabel,
		requiredChainId,
		allowanceConfig?.tokenSymbol,
		submitLabel,
		submitPendingLabel,
		isSubmitPending,
	]);

	const onClick = useCallback(async () => {
		if (formDisabled && step === 'submit') return;

		switch (step) {
			case 'connect':
				handleConnect();
				break;
			case 'switch_network':
				await handleSwitchChain();
				break;
			case 'approve':
				await handleApprove();
				break;
			case 'submit':
				await handleSubmit();
				break;
		}
	}, [
		step,
		formDisabled,
		handleConnect,
		handleSwitchChain,
		handleApprove,
		handleSubmit,
	]);

	const isPending = isApprovePending || isApproveConfirming || isSubmitPending;

	const disabled =
		(step === 'submit' && (formDisabled || isSubmitPending)) ||
		(step === 'approve' && (isApprovePending || isApproveConfirming));

	return {
		step,
		label,
		onClick,
		isPending,
		disabled,
	};
}
