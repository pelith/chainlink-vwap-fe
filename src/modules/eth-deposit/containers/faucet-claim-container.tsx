/**
 * Integration layer: wires faucet claim hook, USDC balance, and Web3 submit flow.
 */

import { useAppKitAccount } from '@reown/appkit/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useWaitForTransactionReceipt } from 'wagmi';
import { ApiClientError } from '@/api/api-client';
import { formatCommonNumber } from '@/lib/bignumber';
import { TARGET_CHAIN_ID } from '@/lib/constants';
import { useWeb3SubmitButton } from '@/modules/commons/hooks/use-web3-submit-button';
import { useTokenInfoAndBalance } from '@/modules/contracts/hooks/use-token-info-and-balance';
import { useVwapRfqTokenAddresses } from '@/modules/contracts/hooks/use-vwap-rfq-token-addresses';
import { FaucetClaimCard } from '@/modules/eth-deposit/components/faucet-claim-card';
import { useClaimFaucet } from '@/modules/eth-deposit/hooks/use-claim-faucet';
import { useTokenClaimed } from '@/modules/eth-deposit/hooks/use-token-claimed';

export function FaucetClaimContainer() {
	const chainId = TARGET_CHAIN_ID;
	const { address } = useAppKitAccount();
	const [apiError, setApiError] = useState<string | null>(null);

	const { tokenClaimed, refetch: refetchTokenClaimed } = useTokenClaimed({
		chainId,
		address: address ?? undefined,
	});

	const { usdc } = useVwapRfqTokenAddresses(chainId);
	const usdcBalanceData = useTokenInfoAndBalance(
		address ?? '',
		usdc ?? '',
		chainId,
	);

	const usdcBalanceFormatted =
		typeof usdcBalanceData?.balance === 'string'
			? formatCommonNumber(usdcBalanceData.balance)
			: '—';

	const {
		claimAsync,
		isPending: isClaimPending,
		hash,
		isSupported,
	} = useClaimFaucet({ chainId, address: address ?? undefined });

	const { data: receipt } = useWaitForTransactionReceipt({ hash });

	useEffect(() => {
		if (receipt && hash) {
			refetchTokenClaimed();
			usdcBalanceData?.refetch?.();
			setApiError(null);
			toast.success('USDC claimed successfully');
		}
	}, [receipt, hash, refetchTokenClaimed, usdcBalanceData?.refetch]);

	const handleSubmit = useCallback(async () => {
		setApiError(null);
		try {
			await claimAsync();
		} catch (err) {
			if (err instanceof ApiClientError) {
				const msg =
					err.status === 404
						? 'Faucet claim is not available. Configure the backend faucet endpoint.'
						: err.message;
				setApiError(msg);
				toast.error(msg);
			} else {
				const message = err instanceof Error ? err.message : String(err);
				setApiError(message);
				toast.error(message);
			}
		}
	}, [claimAsync]);

	const { label, onClick, isPending, disabled } = useWeb3SubmitButton({
		requiredChainId: chainId,
		onSubmit: handleSubmit,
		allowanceConfig: null,
		submitLabel: 'Claim USDC',
		submitPendingLabel: 'Claiming…',
		formDisabled: tokenClaimed,
		isSubmitPending: isClaimPending,
	});

	const unsupportedMessage = !isSupported
		? 'Faucet is not available on this network.'
		: null;

	return (
		<FaucetClaimCard
			usdcBalanceDisplay={usdcBalanceFormatted}
			submitLabel={label}
			onSubmitClick={onClick}
			submitDisabled={disabled}
			submitIsPending={isPending}
			errorMessage={apiError}
			unsupportedMessage={unsupportedMessage}
			alreadyClaimed={tokenClaimed}
		/>
	);
}
