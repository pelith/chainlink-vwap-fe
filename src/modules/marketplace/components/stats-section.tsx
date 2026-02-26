import { Info } from 'lucide-react';
import { TARGET_CHAIN_ID } from '@/lib/constants';
import { useChainlinkEthPrice } from '@/modules/contracts/hooks/use-chainlink-eth-price';
import { useVwapOraclePrice } from '@/modules/contracts/hooks/use-vwap-oracle-price';

export function StatsSection() {
	const chainId = TARGET_CHAIN_ID;
	const { priceFormatted, isLoading: chainlinkLoading } =
		useChainlinkEthPrice(chainId);
	const { vwapPriceFormatted, isLoading: vwapLoading } =
		useVwapOraclePrice(chainId);

	const marketPriceDisplay =
		chainlinkLoading || priceFormatted === undefined ? '—' : priceFormatted;
	const vwapDisplay =
		vwapLoading || vwapPriceFormatted === undefined ? '—' : vwapPriceFormatted;

	return (
		<div className='mb-8'>
			<div className='bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm'>
				<div className='grid grid-cols-2 gap-0 mb-6'>
					<div className='pr-6'>
						<h3 className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
							Current Market Price
						</h3>
						<div className='flex items-baseline space-x-2'>
							<span className='text-3xl font-semibold text-gray-900 dark:text-white'>
								1 WETH
							</span>
							<span className='text-2xl text-gray-600 dark:text-gray-400'>
								=
							</span>
							<span className='text-3xl font-semibold text-gray-900 dark:text-white'>
								{marketPriceDisplay}
							</span>
							<span className='text-xl text-gray-600 dark:text-gray-400'>
								USDC
							</span>
						</div>
					</div>
					<div className='border-l border-gray-200 dark:border-gray-700 pl-6'>
						<div className='flex items-center space-x-2 mb-2'>
							<h3 className='text-sm text-gray-600 dark:text-gray-400'>
								12H Historical VWAP
							</h3>
							<Info className='w-5 h-5 text-blue-500' />
						</div>
						<div className='flex items-baseline space-x-2'>
							<span className='text-3xl font-semibold text-gray-900 dark:text-white'>
								{vwapDisplay}
							</span>
							<span className='text-xl text-gray-600 dark:text-gray-400'>
								USDC
							</span>
						</div>
						<p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
							Last 12 hours average
						</p>
					</div>
				</div>
				<div className='bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
					<div className='flex items-start space-x-3'>
						<Info className='w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5' />
						<div>
							<p className='text-sm text-blue-900 dark:text-blue-200'>
								<span className='font-medium'>Note:</span> Final settlement
								price is determined by the VWAP of the next 12 hours after
								filling. Your funds will be locked during this period to ensure
								fair price discovery.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
