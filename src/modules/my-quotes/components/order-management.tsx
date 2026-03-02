import { FileText } from 'lucide-react';
import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MakerOrder } from '@/modules/my-quotes/types/my-quotes.types';
import { OrdersTable } from './orders-table';

interface OrderManagementProps {
	orders: MakerOrder[];
	onCancelOrder: (orderId: string) => void;
	isLoading?: boolean;
	isCancelling?: boolean;
}

type TabType = 'active' | 'filled' | 'cancelled';

export function OrderManagement({
	orders,
	onCancelOrder,
	isLoading = false,
	isCancelling = false,
}: OrderManagementProps) {
	const activeCount = useMemo(
		() => orders.filter((o) => o.status === 'active').length,
		[orders],
	);
	const filledCount = useMemo(
		() => orders.filter((o) => o.status === 'filled').length,
		[orders],
	);
	const activeOrders = useMemo(
		() => orders.filter((o) => o.status === 'active'),
		[orders],
	);
	const filledOrders = useMemo(
		() => orders.filter((o) => o.status === 'filled'),
		[orders],
	);
	const cancelledOrders = useMemo(
		() => orders.filter((o) => o.status === 'cancelled' || o.status === 'expired'),
		[orders],
	);

	return (
		<Card>
			<CardContent className='pt-6'>
				<Tabs defaultValue='active' className='w-full'>
					<TabsList className='w-full h-11 p-1 bg-muted/80 grid grid-cols-3 mb-4'>
						<TabsTrigger
							value='active'
							className='rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-colors duration-200 cursor-pointer'
						>
							Active
							{activeCount > 0 && (
								<span className='ml-2 px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-medium'>
									{activeCount}
								</span>
							)}
						</TabsTrigger>
						<TabsTrigger
							value='filled'
							className='rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-colors duration-200 cursor-pointer'
						>
							Filled
							{filledCount > 0 && (
								<span className='ml-2 px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs font-medium'>
									{filledCount}
								</span>
							)}
						</TabsTrigger>
						<TabsTrigger
							value='cancelled'
							className='rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-colors duration-200 cursor-pointer'
						>
							Cancelled / Expired
						</TabsTrigger>
					</TabsList>
					<TabsContent value='active' className='mt-0'>
						{isLoading ? (
							<div className='space-y-4 py-4'>
								<Skeleton className='h-12 w-full' />
								<Skeleton className='h-32 w-full' />
								<Skeleton className='h-32 w-full' />
							</div>
						) : activeOrders.length === 0 ? (
							<div className='text-center py-12'>
								<FileText className='w-12 h-12 text-muted-foreground/50 mx-auto mb-4' />
								<p className='text-muted-foreground text-lg mb-2'>
									No active quotes.
								</p>
								<p className='text-muted-foreground/80 text-sm'>
									Create one to start market making.
								</p>
							</div>
						) : (
							<OrdersTable
								orders={activeOrders}
								onCancelOrder={onCancelOrder}
								activeTab='active'
								isCancelling={isCancelling}
							/>
						)}
					</TabsContent>
					<TabsContent value='filled' className='mt-0'>
						{isLoading ? (
							<div className='space-y-4 py-4'>
								<Skeleton className='h-12 w-full' />
								<Skeleton className='h-32 w-full' />
							</div>
						) : filledOrders.length === 0 ? (
							<div className='text-center py-12'>
								<FileText className='w-12 h-12 text-muted-foreground/50 mx-auto mb-4' />
								<p className='text-muted-foreground text-lg mb-2'>
									No filled orders yet.
								</p>
							</div>
						) : (
							<OrdersTable
								orders={filledOrders}
								onCancelOrder={onCancelOrder}
								activeTab='filled'
								isCancelling={isCancelling}
							/>
						)}
					</TabsContent>
					<TabsContent value='cancelled' className='mt-0'>
						{isLoading ? (
							<div className='space-y-4 py-4'>
								<Skeleton className='h-12 w-full' />
								<Skeleton className='h-32 w-full' />
							</div>
						) : cancelledOrders.length === 0 ? (
							<div className='text-center py-12'>
								<FileText className='w-12 h-12 text-muted-foreground/50 mx-auto mb-4' />
								<p className='text-muted-foreground text-lg mb-2'>
									No cancelled or expired orders.
								</p>
							</div>
						) : (
							<OrdersTable
								orders={cancelledOrders}
								onCancelOrder={onCancelOrder}
								activeTab='cancelled'
								isCancelling={isCancelling}
							/>
						)}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
