/**
 * Presentational layer: pure UI for Create Quote form.
 * Receives form control and display values from container.
 */

import { Info, Sparkles } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Web3SubmitButton } from '@/modules/commons/components/web3-submit-button';
import type { AllowanceConfig } from '@/modules/commons/hooks/use-web3-submit-button';
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
	onSubmit: () => void;
	isSubmitPending: boolean;
	allowanceConfig: AllowanceConfig | null;
	requiredChainId: number;
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
	onSubmit,
	isSubmitPending,
	allowanceConfig,
	requiredChainId,
}: CreateQuoteFormProps) {
	const hasErrors = Object.keys(form.formState.errors).length > 0;
	const formErrorMessage = hasErrors
		? 'Please fix the errors below before submitting.'
		: null;

	return (
		<Card className='sticky top-8'>
			<CardContent className='pt-6'>
			<h2 className='text-xl font-semibold text-foreground mb-6'>
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
								<FormLabel className='text-foreground'>
									Direction
								</FormLabel>
								<FormControl>
									<fieldset
										ref={field.ref}
										onBlur={field.onBlur}
										className='grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg border-0'
									>
										<button
											type='button'
											onClick={() => field.onChange('SELL_WETH')}
											className={`py-2 px-4 rounded-md font-medium transition-colors duration-200 cursor-pointer ${
												field.value === 'SELL_WETH'
													? 'bg-card text-red-400 dark:text-red-400 shadow-sm'
													: 'text-muted-foreground hover:text-foreground'
											}`}
										>
											Sell WETH
										</button>
										<button
											type='button'
											onClick={() => field.onChange('SELL_USDC')}
											className={`py-2 px-4 rounded-md font-medium transition-colors duration-200 cursor-pointer ${
												field.value === 'SELL_USDC'
													? 'bg-card text-green-600 dark:text-green-400 shadow-sm'
													: 'text-muted-foreground hover:text-foreground'
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
								<FormLabel className='text-foreground'>
									Sell Amount
								</FormLabel>
								<FormControl>
									<div className='relative'>
										<input
											{...field}
											type='text'
											inputMode='decimal'
											placeholder='0.00'
											className='w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none bg-background text-foreground placeholder:text-muted-foreground'
										/>
										<span className='absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium'>
											{sellToken}
										</span>
									</div>
								</FormControl>
								<p className='text-sm text-muted-foreground'>
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
								<FormLabel className='text-foreground'>
									Price Delta (bps)
								</FormLabel>
								<FormControl>
									<div className='relative'>
										<input
											{...field}
											type='number'
											placeholder='0'
											step='1'
											className='w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none bg-background text-foreground placeholder:text-muted-foreground'
										/>
										<span className='absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium'>
											bps
										</span>
									</div>
								</FormControl>
								<div className='mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg'>
									<p className='text-sm text-foreground'>
										Final Price = 12H VWAP × (1 {isPositiveDelta ? '+' : ''}{' '}
										{deltaPercent}%)
									</p>
									<p className='text-xs text-muted-foreground mt-1'>
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
								<FormLabel className='text-foreground'>
									Minimum Taker Deposit
								</FormLabel>
								<FormControl>
									<div className='relative'>
										<input
											{...field}
											type='text'
											inputMode='decimal'
											placeholder='0.00'
											className='w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none bg-background text-foreground placeholder:text-muted-foreground'
										/>
										<span className='absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium'>
											{receiveToken}
										</span>
									</div>
								</FormControl>
								<button
									type='button'
									onClick={onAutoCalculate}
									disabled={autoCalculateDisabled}
									className='mt-2 flex items-center space-x-1 text-sm text-primary hover:text-primary/80 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer'
								>
									<Sparkles className='w-4 h-4' />
									<span>{autoCalculateButtonLabel}</span>
								</button>
								<div className='mt-2 p-3 bg-muted/50 rounded-lg'>
									<div className='flex items-start space-x-2'>
										<Info className='w-4 h-4 text-muted-foreground shrink-0 mt-0.5' />
										<p className='text-xs text-muted-foreground'>
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
								<FormLabel className='text-foreground'>
									Deadline
								</FormLabel>
								<FormControl>
									<select
										{...field}
										className='w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none bg-background text-foreground'
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
					<Web3SubmitButton
						onSubmit={onSubmit}
						submitLabel='Sign & Create Order'
						allowanceConfig={allowanceConfig}
						requiredChainId={requiredChainId}
						isSubmitPending={isSubmitPending}
						formDisabled={!form.formState.isValid}
						className='w-full py-6'
					/>
				</form>
			</Form>
			</CardContent>
		</Card>
	);
}
