/**
 * Web3 number utilities aligned with web3-format-number skill.
 * Variable naming: *Raw (bigint), *Formatted (string), *Bn (BigNumber).
 */

import BigNumber from 'bignumber.js';

export { BigNumber };

export function configureBigNumber() {
	BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN });
}

const BIGNUMBER_ZERO = new BigNumber(0);

/**
 * Safely parse a value to a BigNumber instance.
 */
export function parseToBigNumber(
	value: BigNumber.Value,
	fallback: BigNumber = BIGNUMBER_ZERO,
): BigNumber {
	try {
		const ret = new BigNumber(`${value}`);
		if (!ret.isNaN()) return ret;
	} catch {
		/* fallthrough */
	}
	return fallback;
}

function getCommonDecimal(amount: BigNumber): number {
	if (amount.lt(0.01)) return 8;
	if (amount.lt(1)) return 6;
	if (amount.lt(10)) return 5;
	if (amount.lt(100)) return 4;
	if (amount.lt(1000)) return 3;
	return 2;
}

function formatNumberWithCommas(n: string): string {
	const parts = n.split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return parts.join('.').replace(/\.?0+$/, '');
}

/**
 * Format amount for display. Use for token balances, amounts.
 */
export function formatCommonNumber(
	amount: BigNumber.Value | string | number | undefined,
): string {
	const processAmount = BigNumber.isBigNumber(amount)
		? amount
		: parseToBigNumber(amount ?? '');
	if (processAmount.isNaN()) return '-';
	if (processAmount.isZero()) return '0';
	if (processAmount.lt(0.000001)) return '< 0.000001';
	return formatNumberWithCommas(
		processAmount.toFixed(getCommonDecimal(processAmount)),
	);
}
