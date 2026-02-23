import { useState } from 'react';
import { Header } from '../components/Header';
import { CreateQuoteForm } from '../components/my-quotes/CreateQuoteForm';
import { OrderManagement } from '../components/my-quotes/OrderManagement';
import { RiskMonitor } from '../components/my-quotes/RiskMonitor';
import { toast } from 'sonner@2.0.3';

export interface MakerOrder {
  id: string;
  pair: string;
  direction: 'SELL_WETH' | 'SELL_USDC';
  amount: number;
  token: string;
  delta: number;
  minAmountOut: number;
  expiryHours: number;
  status: 'active' | 'filled' | 'cancelled' | 'expired';
  createdAt: Date;
}

export function MyQuotesPage() {
  const [orders, setOrders] = useState<MakerOrder[]>([
    {
      id: '1001',
      pair: 'WETH/USDC',
      direction: 'SELL_WETH',
      amount: 10.0,
      token: 'WETH',
      delta: 50,
      minAmountOut: 25000,
      expiryHours: 12,
      status: 'active',
      createdAt: new Date(),
    },
    {
      id: '1002',
      pair: 'WETH/USDC',
      direction: 'SELL_USDC',
      amount: 50000,
      token: 'USDC',
      delta: -30,
      minAmountOut: 15.5,
      expiryHours: 6,
      status: 'active',
      createdAt: new Date(),
    },
    {
      id: '1003',
      pair: 'WETH/USDC',
      direction: 'SELL_WETH',
      amount: 5.0,
      token: 'WETH',
      delta: 75,
      minAmountOut: 14000,
      expiryHours: 24,
      status: 'filled',
      createdAt: new Date(Date.now() - 86400000),
    },
  ]);

  const handleCreateOrder = (orderData: {
    direction: 'SELL_WETH' | 'SELL_USDC';
    amount: string;
    delta: string;
    minAmountOut: string;
    deadline: string;
  }) => {
    const newOrder: MakerOrder = {
      id: Math.random().toString(36).substr(2, 9),
      pair: 'WETH/USDC',
      direction: orderData.direction,
      amount: parseFloat(orderData.amount),
      token: orderData.direction === 'SELL_WETH' ? 'WETH' : 'USDC',
      delta: parseFloat(orderData.delta),
      minAmountOut: parseFloat(orderData.minAmountOut),
      expiryHours: parseInt(orderData.deadline),
      status: 'active',
      createdAt: new Date(),
    };

    setOrders([newOrder, ...orders]);
    toast.success('Order created successfully!');
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: 'cancelled' as const }
        : order
    ));
    toast.success('Order cancelled successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8">My Quotes</h1>

        {/* Risk Monitor - Top */}
        <RiskMonitor orders={orders} />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Panel - Create Quote Form */}
          <div className="lg:col-span-1">
            <CreateQuoteForm onSubmit={handleCreateOrder} />
          </div>

          {/* Right Panel - Order Management */}
          <div className="lg:col-span-2">
            <OrderManagement orders={orders} onCancelOrder={handleCancelOrder} />
          </div>
        </div>
      </main>
    </div>
  );
}