import { useAppKitAccount } from '@reown/appkit/react';
import { toast } from 'sonner';
import { useCancelOrder, useOrders } from '@/api/use-orders-api';
import { CreateQuoteForm } from '@/modules/my-quotes/components/create-quote-form';
import { OrderManagement } from '@/modules/my-quotes/components/order-management';
import { RiskMonitor } from '@/modules/my-quotes/components/risk-monitor';
import { useCreateOrderFlow } from '@/modules/my-quotes/hooks/use-create-order-flow';
import { mapOrderToMakerOrder } from '@/modules/my-quotes/utils/order-mapper';

export function MyQuotesPage() {
	const { address, isConnected } = useAppKitAccount();
	const {
		data: ordersData,
		error: ordersError,
		isError: isOrdersError,
		isLoading: isOrdersLoading,
	} = useOrders({ maker: address ?? undefined }, { enabled: !!address });
	const { mutateAsync: cancelOrderMutate } = useCancelOrder();
	const { createOrderWithSignature, phase } = useCreateOrderFlow();

	const makerOrders = (ordersData ?? []).map(mapOrderToMakerOrder);

	const handleCreateOrder = async (orderData: {
		direction: 'SELL_WETH' | 'SELL_USDC';
		amount: string;
		delta: string;
		minAmountOut: string;
		deadline: string;
	}) => {
		await createOrderWithSignature(orderData);
	};

	const handleCancelOrder = async (orderId: string) => {
		if (!address) return;
		try {
			await cancelOrderMutate({ hash: orderId, maker: address });
			toast.success('Order cancelled successfully!');
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			toast.error(message);
		}
	};

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<h1 className='text-3xl font-semibold text-gray-900 dark:text-white mb-8'>
					My Quotes
				</h1>
				{!address && (
					<p className='mb-6 text-gray-600 dark:text-gray-400'>
						Connect your wallet to create and manage quotes
					</p>
				)}
				{address && isOrdersError && (
					<div className='mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'>
						<p className='text-red-700 dark:text-red-300 font-medium'>
							Failed to load orders
						</p>
						<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
							{ordersError instanceof Error
								? ordersError.message
								: String(ordersError)}
						</p>
					</div>
				)}
				<RiskMonitor orders={makerOrders} />
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8'>
					<div className='lg:col-span-1'>
						<CreateQuoteForm
							onSubmit={handleCreateOrder}
							phase={phase}
							isDisabled={!isConnected}
						/>
					</div>
					<div className='lg:col-span-2'>
						<OrderManagement
							orders={makerOrders}
							onCancelOrder={handleCancelOrder}
							isLoading={isOrdersLoading}
						/>
					</div>
				</div>
			</main>
		</div>
	);
}
