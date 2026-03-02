import { Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
		<Card className='mb-8'>
			<CardContent className='pt-6'>
				<div className='grid grid-cols-2 gap-0 mb-6'>
					<div className='pr-6'>
						<h3 className='text-sm text-muted-foreground mb-2'>
							Current Market Price
						</h3>
						<div className='flex items-baseline space-x-2'>
							<span className='text-3xl font-semibold text-foreground'>
								1 WETH
							</span>
							<span className='text-2xl text-muted-foreground'>
								=
							</span>
							<span className='text-3xl font-semibold text-foreground'>
								{marketPriceDisplay}
							</span>
							<span className='text-xl text-muted-foreground'>
								USDC
							</span>
						</div>
					</div>
					<div className='border-l border-border pl-6'>
						<div className='flex items-center space-x-2 mb-2'>
							<h3 className='text-sm text-muted-foreground'>
								12H Historical VWAP
							</h3>
							<Info className='w-5 h-5 text-primary' />
						</div>
						<div className='flex items-baseline space-x-2'>
							<span className='text-3xl font-semibold text-foreground'>
								{vwapDisplay}
							</span>
							<span className='text-xl text-muted-foreground'>
								USDC
							</span>
						</div>
						<p className='text-sm text-muted-foreground mt-2'>
							Last 12 hours average
						</p>
					</div>
				</div>
				<div className='bg-primary/5 border border-primary/20 rounded-lg p-4'>
					<div className='flex items-start space-x-3'>
						<Info className='w-5 h-5 text-primary shrink-0 mt-0.5' />
						<div>
							<p className='text-sm text-foreground'>
								<span className='font-medium'>Note:</span> Final settlement
								price is determined by the VWAP of the next 12 hours after
								filling. Your funds will be locked during this period to ensure
								fair price discovery.
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
