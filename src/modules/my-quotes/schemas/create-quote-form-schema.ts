/**
 * Zod schema for Create Quote form validation.
 * Aligned with doc/eip712.md: 10000 + deltaBps > 0.
 */

import { z } from 'zod';

const positiveNumberString = z
	.string()
	.min(1, 'Required')
	.refine((val) => !Number.isNaN(Number.parseFloat(val)), 'Must be a valid number')
	.refine((val) => Number.parseFloat(val) > 0, 'Must be greater than 0');

const deltaBpsString = z
	.string()
	.min(1, 'Required')
	.refine((val) => /^-?\d+$/.test(val), 'Must be an integer')
	.refine(
		(val) => {
			const bps = Number.parseInt(val, 10);
			return !Number.isNaN(bps) && 10000 + bps > 0;
		},
		{ message: '10000 + deltaBps must be greater than 0' },
	);

const deadlineOptions = ['1', '6', '12', '24'] as const;

export const createQuoteFormSchema = z.object({
	direction: z.enum(['SELL_WETH', 'SELL_USDC']),
	amount: positiveNumberString,
	delta: deltaBpsString,
	minAmountOut: positiveNumberString,
	deadline: z.enum(deadlineOptions),
});

export type CreateQuoteFormValues = z.infer<typeof createQuoteFormSchema>;
