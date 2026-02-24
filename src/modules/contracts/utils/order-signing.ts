/**
 * EIP-712 order signing for VWAP-RFQ-Spot.
 * Aligned with doc/eip712.md and backend internal/orderbook/eip712.go.
 */

import type { Address, WalletClient } from 'viem';

/** Order message for EIP-712 signing (camelCase). */
export interface OrderSigningMessage {
	maker: Address;
	makerIsSellETH: boolean;
	amountIn: bigint;
	minAmountOut: bigint;
	deltaBps: number;
	salt: bigint;
	deadline: number;
}

const EIP712_DOMAIN_NAME = 'VWAP-RFQ-Spot';
const EIP712_DOMAIN_VERSION = '1';

const ORDER_TYPES = {
	Order: [
		{ name: 'maker', type: 'address' },
		{ name: 'makerIsSellETH', type: 'bool' },
		{ name: 'amountIn', type: 'uint256' },
		{ name: 'minAmountOut', type: 'uint256' },
		{ name: 'deltaBps', type: 'int32' },
		{ name: 'salt', type: 'uint256' },
		{ name: 'deadline', type: 'uint256' },
	],
} as const;

/**
 * Signs an order with EIP-712 typed data.
 * @param walletClient - wagmi useWalletClient().data
 * @param account - connected account address
 * @param orderMessage - order fields for signing
 * @param contractAddress - VWAPRFQSpot verifying contract
 * @param chainId - deployment chain ID
 * @returns hex signature (with 0x prefix)
 */
export async function signOrder(
	walletClient: WalletClient,
	account: Address,
	orderMessage: OrderSigningMessage,
	contractAddress: Address,
	chainId: number,
): Promise<`0x${string}`> {
	const domain = {
		name: EIP712_DOMAIN_NAME,
		version: EIP712_DOMAIN_VERSION,
		chainId,
		verifyingContract: contractAddress,
	};

	const signature = await walletClient.signTypedData({
		account,
		domain,
		types: ORDER_TYPES,
		primaryType: 'Order',
		message: {
			...orderMessage,
			deadline: BigInt(orderMessage.deadline),
		},
	});

	return signature;
}
