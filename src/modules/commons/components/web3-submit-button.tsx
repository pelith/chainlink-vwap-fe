/**
 * Web3 progressive submit button: Connect → Switch → Approve → Submit.
 */

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AllowanceConfig } from '@/modules/commons/hooks/use-web3-submit-button';
import { useWeb3SubmitButton } from '@/modules/commons/hooks/use-web3-submit-button';

export interface Web3SubmitButtonProps {
	requiredChainId?: number;
	onSubmit: () => void | Promise<void>;
	allowanceConfig?: AllowanceConfig | null;
	submitLabel: string;
	submitPendingLabel?: string;
	formDisabled?: boolean;
	isSubmitPending?: boolean;
	switchChainLabel?: string;
	className?: string;
	disabled?: boolean;
}

export function Web3SubmitButton({
	className,
	disabled: disabledProp,
	...params
}: Web3SubmitButtonProps) {
	const { label, onClick, isPending, disabled } = useWeb3SubmitButton(params);

	return (
		<Button
			type='button'
			onClick={onClick}
			disabled={disabled || disabledProp}
			className={cn('w-full', className)}
		>
			{isPending ? (
				<span className='flex items-center gap-2'>
					<span className='inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
					<span>{label}</span>
				</span>
			) : (
				<span>{label}</span>
			)}
		</Button>
	);
}
