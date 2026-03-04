import { useAppKitAccount } from '@reown/appkit/react';
import { Clock, HelpCircle } from 'lucide-react';
import usdcIcon from '@/assets/2654d0ea7067f6da4d09a20d5d807a46ea193b8e.png';
import wethIcon from '@/assets/c68666dc78ff5ce7cd2de448ff99cf9fff49e11b.png';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCommonNumber } from '@/lib/bignumber';
import { shortenHash } from '@/lib/shorten-hash';
import type { Order } from '@/modules/marketplace/types/marketplace.types';
import { OrderExpiryCountdown } from './order-expiry-countdown';

interface QuoteListItemProps {
	order: Order;
	onFillClick: (order: Order) => void;
}

export function QuoteListItem({ order, onFillClick }: QuoteListItemProps) {
	const { address } = useAppKitAccount();
	const isOwnOrder =
		!!address &&
		order.maker.toLowerCase() === address.toLowerCase();

	const deltaPercent = (order.delta / 100).toFixed(2);
	const deltaSign = order.delta >= 0 ? '+' : '';
	const pricingColor =
		order.delta >= 0
			? 'text-green-600 dark:text-green-400'
			: 'text-destructive';

	const receiveToken = order.direction === 'SELL_WETH' ? 'USDC' : 'WETH';
	const tokenIcon = order.token === 'USDC' ? usdcIcon : wethIcon;

	return (
		<Card
			role='button'
			tabIndex={0}
			onClick={() => onFillClick(order)}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onFillClick(order);
				}
			}}
		className='transition-colors duration-200 hover:bg-muted/30 hover:backdrop-blur-sm cursor-pointer'
		>
			<CardContent className='p-5'>
				<div className='flex items-center gap-6'>
					<div className='flex-shrink-0 w-24'>
						<div className='flex items-center gap-2 mb-1'>
							<p className='text-xs text-muted-foreground'>Sell</p>
							{isOwnOrder && (
								<Badge variant='secondary'>Your order</Badge>
							)}
						</div>
						<div className='flex items-center gap-2'>
							<img src={tokenIcon} alt={order.token} className='w-6 h-6' />
							<span className='text-lg font-bold text-foreground'>
								{order.token}
							</span>
						</div>
					</div>
					<div className='flex-1 min-w-[180px] pl-2'>
						<p className='text-xs text-muted-foreground mb-1'>
							Sell Amount
						</p>
						<div className='flex items-baseline space-x-2'>
							<span className='text-xl font-semibold text-foreground'>
								{formatCommonNumber(order.amount)}
							</span>
							<span className='text-sm text-muted-foreground font-medium'>
								{order.token}
							</span>
						</div>
					</div>
					<div className='flex-1 min-w-[200px]'>
						<p className='text-xs text-muted-foreground mb-1'>
							Pricing Rule
						</p>
						<div className='flex items-baseline space-x-2'>
							<span className={`text-xl font-semibold ${pricingColor}`}>
								VWAP {deltaSign}
								{deltaPercent}%
							</span>
							<div className='group relative'>
								<HelpCircle className='w-3.5 h-3.5 text-muted-foreground cursor-help' />
								<div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg z-10 border'>
									This delta is added to the 12-hour VWAP settlement price.
								</div>
							</div>
						</div>
					</div>
					<div className='flex-1 min-w-[180px]'>
						<p className='text-xs text-muted-foreground mb-1'>
							Min Required
						</p>
						<div className='flex items-baseline space-x-2'>
							<span className='text-xl font-semibold text-foreground'>
								{formatCommonNumber(order.minAmountOut)}
							</span>
							<span className='text-sm text-muted-foreground font-medium'>
								{receiveToken}
							</span>
						</div>
					</div>
					<div className='flex flex-col space-y-1 flex-shrink-0 items-end min-w-[120px]'>
						<span className='text-xs text-muted-foreground'>
							#{shortenHash(order.id)}
						</span>
						<div className='flex items-center space-x-2 text-muted-foreground'>
							<Clock className='w-4 h-4' />
							<OrderExpiryCountdown deadline={order.deadline} />
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
