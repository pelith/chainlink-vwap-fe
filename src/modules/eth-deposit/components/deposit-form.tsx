/**
 * Presentational layer: pure UI for ETH to WETH deposit form.
 * Receives display values and callbacks from container.
 */

import { Card, CardContent } from '@/components/ui/card';

export interface DepositFormProps {
	amount: string;
	onAmountChange: (value: string) => void;
	ethBalanceDisplay: string;
	wethBalanceDisplay: string;
	maxAmount: string;
	submitLabel: string;
	onSubmitClick: () => void;
	submitDisabled: boolean;
	submitIsPending: boolean;
	errorMessage: string | null;
}

export function DepositForm({
	amount,
	onAmountChange,
	ethBalanceDisplay,
	wethBalanceDisplay,
	maxAmount,
	submitLabel,
	onSubmitClick,
	submitDisabled,
	submitIsPending,
	errorMessage,
}: DepositFormProps) {
	return (
		<Card className='sticky top-8 max-w-md'>
			<CardContent className='pt-6'>
			<h2 className='text-xl font-semibold text-foreground mb-6'>
				Wrap ETH to WETH
			</h2>
			{errorMessage ? (
				<div
					role='alert'
					className='mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm'
				>
					{errorMessage}
				</div>
			) : null}
			<div className='space-y-6'>
				<div>
					<label
						htmlFor='deposit-eth-amount'
						className='block text-sm font-medium text-foreground mb-2'
					>
						Amount
					</label>
					<div className='relative'>
						<input
							id='deposit-eth-amount'
							type='number'
							value={amount}
							onChange={(e) => onAmountChange(e.target.value)}
							placeholder='0.00'
							step='any'
							min='0'
							className='w-full px-4 py-3 pr-24 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none bg-background text-foreground placeholder:text-muted-foreground transition-colors duration-200'
						/>
						<div className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2'>
							<button
								type='button'
								onClick={() => onAmountChange(maxAmount)}
								className='text-xs font-medium text-primary hover:text-primary/80 px-2 py-1 transition-colors duration-200 cursor-pointer'
							>
								Max
							</button>
							<span className='text-muted-foreground font-medium'>
								ETH
							</span>
						</div>
					</div>
					<p className='mt-2 text-sm text-muted-foreground'>
						Balance: {ethBalanceDisplay} ETH
					</p>
				</div>
				<div className='p-3 bg-muted/50 rounded-lg'>
					<p className='text-sm text-muted-foreground'>
						WETH balance: {wethBalanceDisplay} WETH
					</p>
				</div>
				<button
					type='button'
					onClick={onSubmitClick}
					disabled={submitDisabled}
					className='w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer'
				>
					{submitIsPending ? (
						<span className='flex items-center justify-center gap-2'>
							<span className='inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
							{submitLabel}
						</span>
					) : (
						submitLabel
					)}
				</button>
			</div>
			</CardContent>
		</Card>
	);
}
