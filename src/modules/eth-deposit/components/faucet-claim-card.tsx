/**
 * Presentational layer: pure UI for claiming USDC from faucet.
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface FaucetClaimCardProps {
	usdcBalanceDisplay: string;
	submitLabel: string;
	onSubmitClick: () => void;
	submitDisabled: boolean;
	submitIsPending: boolean;
	errorMessage: string | null;
	unsupportedMessage: string | null;
	alreadyClaimed: boolean;
}

export function FaucetClaimCard({
	usdcBalanceDisplay,
	submitLabel,
	onSubmitClick,
	submitDisabled,
	submitIsPending,
	errorMessage,
	unsupportedMessage,
	alreadyClaimed,
}: FaucetClaimCardProps) {
	if (unsupportedMessage) {
		return (
			<Card className='max-w-md'>
				<CardContent className='pt-6'>
					<p className='text-muted-foreground text-sm'>{unsupportedMessage}</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className='sticky top-8 max-w-md'>
			<CardContent className='pt-6'>
				<h2 className='text-xl font-semibold text-foreground mb-6'>
					Claim USDC
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
					<div className='p-3 bg-muted/50 rounded-lg'>
						<p className='text-sm text-muted-foreground'>
							USDC balance: {usdcBalanceDisplay} USDC
						</p>
					</div>
					{alreadyClaimed ? (
						<p className='text-sm text-muted-foreground'>
							Already claimed.
						</p>
					) :					<Button
						type='button'
						onClick={onSubmitClick}
						disabled={submitDisabled || alreadyClaimed}
						className='w-full'
					>
						{submitIsPending ? (
							<span className='flex items-center justify-center gap-2'>
								<span className='inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
								{submitLabel}
							</span>
						) : (
							submitLabel
						)}
					</Button>
					}
				</div>
			</CardContent>
		</Card>
	);
}
