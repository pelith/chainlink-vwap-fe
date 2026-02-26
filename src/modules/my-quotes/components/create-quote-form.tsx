/**
 * Presentational layer: pure UI for Create Quote form.
 * Receives form control and display values from container.
 */

import { Info, Sparkles } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import type { CreateQuoteFormValues } from '@/modules/my-quotes/schemas/create-quote-form-schema';

export interface CreateQuoteFormProps {
	form: UseFormReturn<CreateQuoteFormValues>;
	sellToken: string;
	receiveToken: string;
	balanceDisplayText: string;
	deltaPercent: string;
	isPositiveDelta: boolean;
	autoCalculateButtonLabel: string;
	autoCalculateDisabled: boolean;
	onAutoCalculate: () => void;
	submitButtonLabel: string;
	onSubmitClick: () => void;
	submitDisabled: boolean;
	submitIsPending: boolean;
}

export function CreateQuoteForm({
	form,
	sellToken,
	receiveToken,
	balanceDisplayText,
	deltaPercent,
	isPositiveDelta,
	autoCalculateButtonLabel,
	autoCalculateDisabled,
	onAutoCalculate,
	submitButtonLabel,
	onSubmitClick,
	submitDisabled,
	submitIsPending,
}: CreateQuoteFormProps) {
	const hasErrors = Object.keys(form.formState.errors).length > 0;
	const formErrorMessage = hasErrors
		? 'Please fix the errors below before submitting.'
		: null;

	return (
		<div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 sticky top-8'>
			<h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-6'>
				Create New RFQ Order
			</h2>
			{formErrorMessage && (
				<div
					role='alert'
					className='mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm'
				>
					{formErrorMessage}
				</div>
			)}
			<Form {...form}>
				<form onSubmit={(e) => e.preventDefault()} className='space-y-6'>
					<FormField
						control={form.control}
						name='direction'
						render={({ field }) => (
							<FormItem>
								<FormLabel className='text-gray-700 dark:text-gray-300'>
									Direction
								</FormLabel>
								<FormControl>
									<fieldset
										ref={field.ref}
										onBlur={field.onBlur}
										className='grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg border-0'
									>
										<button
											type='button'
											onClick={() => field.onChange('SELL_WETH')}
											className={`py-2 px-4 rounded-md font-medium transition-all ${
												field.value === 'SELL_WETH'
													? 'bg-white dark:bg-gray-600 text-red-700 dark:text-red-400 shadow-sm'
													: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
											}`}
										>
											Sell WETH
										</button>
										<button
											type='button'
											onClick={() => field.onChange('SELL_USDC')}
											className={`py-2 px-4 rounded-md font-medium transition-all ${
												field.value === 'SELL_USDC'
													? 'bg-white dark:bg-gray-600 text-green-700 dark:text-green-400 shadow-sm'
													: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
											}`}
										>
											Sell USDC
										</button>
									</fieldset>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='amount'
						render={({ field }) => (
							<FormItem>
								<FormLabel className='text-gray-700 dark:text-gray-300'>
									Sell Amount
								</FormLabel>
								<FormControl>
									<div className='relative'>
										<input
											{...field}
											type='text'
											inputMode='decimal'
											placeholder='0.00'
											className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400'
										/>
										<span className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium'>
											{sellToken}
										</span>
									</div>
								</FormControl>
								<p className='text-sm text-gray-500 dark:text-gray-400'>
									Balance: {balanceDisplayText} {sellToken}
								</p>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='delta'
						render={({ field }) => (
							<FormItem>
								<FormLabel className='text-gray-700 dark:text-gray-300'>
									Price Delta (bps)
								</FormLabel>
								<FormControl>
									<div className='relative'>
										<input
											{...field}
											type='number'
											placeholder='0'
											step='1'
											className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400'
										/>
										<span className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium'>
											bps
										</span>
									</div>
								</FormControl>
								<div className='mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg'>
									<p className='text-sm text-blue-900 dark:text-blue-200'>
										Final Price = 12H VWAP × (1 {isPositiveDelta ? '+' : ''}{' '}
										{deltaPercent}%)
									</p>
									<p className='text-xs text-blue-700 dark:text-blue-300 mt-1'>
										{isPositiveDelta
											? 'Positive delta means you sell higher than VWAP.'
											: 'Negative delta means you sell lower than VWAP.'}
									</p>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='minAmountOut'
						render={({ field }) => (
							<FormItem>
								<FormLabel className='text-gray-700 dark:text-gray-300'>
									Minimum Taker Deposit
								</FormLabel>
								<FormControl>
									<div className='relative'>
										<input
											{...field}
											type='text'
											inputMode='decimal'
											placeholder='0.00'
											className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400'
										/>
										<span className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium'>
											{receiveToken}
										</span>
									</div>
								</FormControl>
								<button
									type='button'
									onClick={onAutoCalculate}
									disabled={autoCalculateDisabled}
									className='mt-2 flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed'
								>
									<Sparkles className='w-4 h-4' />
									<span>{autoCalculateButtonLabel}</span>
								</button>
								<div className='mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg'>
									<div className='flex items-start space-x-2'>
										<Info className='w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0 mt-0.5' />
										<p className='text-xs text-gray-600 dark:text-gray-400'>
											Takers must deposit at least this amount to trigger the
											trade.
										</p>
									</div>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='deadline'
						render={({ field }) => (
							<FormItem>
								<FormLabel className='text-gray-700 dark:text-gray-300'>
									Deadline
								</FormLabel>
								<FormControl>
									<select
										{...field}
										className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 dark:text-white'
									>
										<option value='1'>1 hour</option>
										<option value='6'>6 hours</option>
										<option value='12'>12 hours</option>
										<option value='24'>24 hours</option>
									</select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<button
						type='button'
						onClick={onSubmitClick}
						disabled={submitDisabled}
						className='w-full py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed'
					>
						{submitIsPending ? (
							<span className='flex items-center justify-center gap-2'>
								<span className='inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
								{submitButtonLabel}
							</span>
						) : (
							submitButtonLabel
						)}
					</button>
				</form>
			</Form>
		</div>
	);
}
