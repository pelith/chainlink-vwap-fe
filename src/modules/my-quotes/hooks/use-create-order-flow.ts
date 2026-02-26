/**
 * Create order flow: sign EIP-712 + POST /v1/orders.
 * Exposes phase for loading UI (signing | submitting).
 */

import { useAppKitAccount } from '@reown/appkit/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useWalletClient } from 'wagmi';
import { useCreateOrder } from '@/api/use-orders-api';
import { env } from '@/env';
import { TARGET_CHAIN_ID } from '@/lib/constants';
import { signOrder } from '@/modules/contracts/utils/order-signing';
import {
	buildCreateOrderBody,
	type CreateQuoteFormData,
	formDataToOrderParams,
} from '@/modules/my-quotes/utils/order-formatters';

export type CreateOrderPhase = 'idle' | 'signing' | 'submitting';

export function useCreateOrderFlow() {
	const { address } = useAppKitAccount();
	const { data: walletClient } = useWalletClient();
	const { mutateAsync: createOrderMutate } = useCreateOrder();
	const [phase, setPhase] = useState<CreateOrderPhase>('idle');

	const createOrderWithSignature = useCallback(
		async (formData: CreateQuoteFormData): Promise<void> => {
			if (!address) {
				toast.error('Please connect your wallet first');
				return;
			}
			if (!walletClient) {
				toast.error('Unable to get wallet client');
				return;
			}
			const contractAddress = env.VITE_VWAP_CONTRACT_ADDRESS;
			if (!contractAddress) {
				toast.error('Contract address is not configured');
				return;
			}

			try {
				const params = formDataToOrderParams(formData);

				const orderMessage = {
					maker: address as `0x${string}`,
					makerIsSellETH: params.makerIsSellETH,
					amountIn: params.amountInRaw,
					minAmountOut: params.minAmountOutRaw,
					deltaBps: params.deltaBps,
					salt: params.salt,
					deadline: params.deadline,
				};

				setPhase('signing');
				const signature = await signOrder(
					walletClient,
					address as `0x${string}`,
					orderMessage,
					contractAddress as `0x${string}`,
					TARGET_CHAIN_ID,
				);

				setPhase('submitting');
				const body = buildCreateOrderBody(params, address, signature);
				await createOrderMutate(body);

				toast.success('Order created successfully!');
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				toast.error(message);
			} finally {
				setPhase('idle');
			}
		},
		[address, walletClient, createOrderMutate],
	);

	const isPending = phase !== 'idle';

	return {
		createOrderWithSignature,
		phase,
		isPending,
	};
}
