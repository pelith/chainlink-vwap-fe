/**
 * Route entry for Preset page.
 * Wraps ETH to WETH and claims testnet USDC from faucet.
 */

import { DepositFormContainer } from '@/modules/eth-deposit/containers/deposit-form-container';
import { FaucetClaimContainer } from '@/modules/eth-deposit/containers/faucet-claim-container';

export function PresetPage() {
	return (
		<div className='min-h-screen bg-background'>
			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<h1 className='text-3xl font-semibold text-foreground mb-8'>
					Preset
				</h1>
				<p className='mb-6 text-muted-foreground'>
					Wrap native ETH to WETH and claim testnet USDC for testing.
				</p>
				<div className='flex flex-col sm:flex-row gap-6 flex-wrap'>
					<DepositFormContainer />
					<FaucetClaimContainer />
				</div>
			</main>
		</div>
	);
}
