/**
 * Parses contract revert errors from fill() to surface user-friendly messages.
 */

import { decodeErrorResult } from 'viem';
import { VWAPRFQSpotAbi } from '@/modules/contracts/constants/abis/VWAPRFQSpot';

const ERROR_MESSAGES: Record<string, string> = {
	BadSignature:
		'Signature verification failed. The order may have been signed with a different chain or contract address.',
	ECDSAInvalidSignature: 'Invalid ECDSA signature format.',
	ECDSAInvalidSignatureLength: 'Signature has invalid length (expected 65 bytes).',
	ECDSAInvalidSignatureS: 'Invalid signature: s value out of range.',
	ExpiredOrder: 'This order has expired (past deadline).',
	DeltaInvalid: 'Invalid delta: 10000 + deltaBps must be > 0.',
	OrderUsed: 'This order has already been filled or cancelled.',
	TakerTooSmall: 'Deposit amount is below the minimum required.',
	TradeNotOpen: 'Trade is not in Open status.',
	NotMatured: 'Settlement window has not ended yet.',
	TooLateToSettle: 'Settlement window has passed; refund is available instead.',
	RefundNotAvailable: 'Refund is not yet available.',
};

function extractRevertData(err: unknown): `0x${string}` | null {
	if (!err || typeof err !== 'object') return null;
	const e = err as { data?: `0x${string}`; cause?: { data?: `0x${string}` } };
	const data = e.data ?? e.cause?.data;
	if (typeof data === 'string' && data.startsWith('0x') && data.length > 10) {
		return data as `0x${string}`;
	}
	return null;
}

/**
 * Parses a fill() revert and returns a user-friendly message.
 * Returns the original error message if parsing fails.
 */
export function parseFillError(err: unknown): string {
	const msg = err instanceof Error ? err.message : String(err);
	if (msg.toLowerCase().includes('user rejected') || msg.includes('User denied')) {
		return 'Transaction rejected by user';
	}

	const data = extractRevertData(err);
	if (!data) {
		return msg.length > 120 ? 'Transaction failed' : msg;
	}

	try {
		const { errorName } = decodeErrorResult({
			abi: VWAPRFQSpotAbi,
			data,
		});
		const msg = ERROR_MESSAGES[errorName];
		return msg ?? `Contract error: ${errorName}`;
	} catch {
		return err instanceof Error ? err.message : String(err);
	}
}
