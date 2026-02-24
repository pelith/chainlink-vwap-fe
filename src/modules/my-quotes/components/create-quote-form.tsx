import type { CreateOrderPhase } from '@/modules/my-quotes/hooks/use-create-order-flow';
import { createQuoteFormSchema } from '@/modules/my-quotes/schemas/create-quote-form-schema';
import type { CreateQuoteFormValues } from '@/modules/my-quotes/schemas/create-quote-form-schema';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface CreateQuoteFormProps {
	onSubmit: (data: CreateQuoteFormValues) => void | Promise<void>;
	phase?: CreateOrderPhase;
	isDisabled?: boolean;
}

const DEFAULT_VALUES: CreateQuoteFormValues = {
	direction: 'SELL_WETH',
	amount: '',
	delta: '',
	minAmountOut: '',
	deadline: '12',
};

export function CreateQuoteForm({
	onSubmit,
	phase = 'idle',
	isDisabled = false,
}: CreateQuoteFormProps) {
	const form = useForm<CreateQuoteFormValues>({
		resolver: zodResolver(createQuoteFormSchema),
		defaultValues: DEFAULT_VALUES,
	});

	const direction = form.watch('direction');
	const delta = form.watch('delta');
	const sellToken = direction === 'SELL_WETH' ? 'WETH' : 'USDC';
	const receiveToken = direction === 'SELL_WETH' ? 'USDC' : 'WETH';
	const walletBalance = direction === 'SELL_WETH' ? '45.5' : '125,000';

	const deltaPercent = delta ? (Number.parseFloat(delta) / 100).toFixed(2) : '0.00';
	const isPositiveDelta = Number.parseFloat(delta || '0') >= 0;

	const handleAutoCalculate = () => {
		const amount = form.getValues('amount');
		if (!amount) return;
		const amountNum = Number.parseFloat(amount);
		const marketPrice = 3050;
		if (direction === 'SELL_WETH') {
			form.setValue('minAmountOut', (amountNum * marketPrice * 0.8).toFixed(0));
		} else {
			form.setValue(
				'minAmountOut',
				((amountNum / marketPrice) * 0.8).toFixed(2),
			);
		}
	};

	const handleSubmit = form.handleSubmit(async (data) => {
		await onSubmit(data);
		form.reset(DEFAULT_VALUES);
	});

	return (
		<div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 sticky top-8'>
			<h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-6'>
				Create New RFQ Order
			</h2>
			<Form {...form}>
				<form onSubmit={handleSubmit} className='space-y-6'>
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
											type='number'
											placeholder='0.00'
											step='any'
											className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400'
										/>
										<span className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium'>
											{sellToken}
										</span>
									</div>
								</FormControl>
								<p className='text-sm text-gray-500 dark:text-gray-400'>
									Balance: {walletBalance} {sellToken}
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
											type='number'
											placeholder='0.00'
											step='any'
											className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400'
										/>
										<span className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium'>
											{receiveToken}
										</span>
									</div>
								</FormControl>
								<button
									type='button'
									onClick={handleAutoCalculate}
									className='mt-2 flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium'
								>
									<Sparkles className='w-4 h-4' />
									<span>Auto-calculate based on market price</span>
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
						type='submit'
						disabled={isDisabled || phase !== 'idle'}
						className='w-full py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed'
					>
						{phase === 'signing' && 'Waiting for signature…'}
						{phase === 'submitting' && 'Creating order…'}
						{phase === 'idle' && 'Sign & Create Order'}
					</button>
				</form>
			</Form>
		</div>
	);
}
