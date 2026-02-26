/**
 * Route entry for Wrap ETH page.
 * Connects wallet to wrap native ETH to WETH.
 */

import { DepositFormContainer } from '@/modules/eth-deposit/containers/deposit-form-container';

export function WrapEthPage() {
	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<h1 className='text-3xl font-semibold text-gray-900 dark:text-white mb-8'>
					Wrap ETH
				</h1>
				<p className='mb-6 text-gray-600 dark:text-gray-400'>
					Deposit native ETH to receive WETH (Wrapped Ether).
				</p>
				<DepositFormContainer />
			</main>
		</div>
	);
}
