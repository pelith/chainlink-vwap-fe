import { useState } from 'react';
import { Header } from '../components/Header';
import { StatsSection } from '../components/StatsSection';
import { MarketList } from '../components/MarketList';
import { FillOrderModal } from '../components/FillOrderModal';
import { toast } from 'sonner@2.0.3';

export interface Order {
  id: string;
  direction: 'SELL_WETH' | 'SELL_USDC';
  amount: number;
  token: string;
  delta: number;
  minAmountOut: number;
  expiryHours: number;
  expiryMinutes: number;
}

const mockOrders: Order[] = [
  {
    id: '1234',
    direction: 'SELL_WETH',
    amount: 10.0,
    token: 'WETH',
    delta: 50,
    minAmountOut: 25000,
    expiryHours: 5,
    expiryMinutes: 20,
  },
  {
    id: '1235',
    direction: 'SELL_USDC',
    amount: 50000,
    token: 'USDC',
    delta: -30,
    minAmountOut: 15.5,
    expiryHours: 3,
    expiryMinutes: 45,
  },
  {
    id: '1236',
    direction: 'SELL_WETH',
    amount: 25.0,
    token: 'WETH',
    delta: 75,
    minAmountOut: 60000,
    expiryHours: 8,
    expiryMinutes: 10,
  },
  {
    id: '1237',
    direction: 'SELL_USDC',
    amount: 100000,
    token: 'USDC',
    delta: -50,
    minAmountOut: 32.0,
    expiryHours: 2,
    expiryMinutes: 30,
  },
  {
    id: '1238',
    direction: 'SELL_WETH',
    amount: 5.5,
    token: 'WETH',
    delta: 25,
    minAmountOut: 15000,
    expiryHours: 6,
    expiryMinutes: 0,
  },
  {
    id: '1239',
    direction: 'SELL_USDC',
    amount: 75000,
    token: 'USDC',
    delta: -20,
    minAmountOut: 24.5,
    expiryHours: 4,
    expiryMinutes: 15,
  },
];

export function MarketplacePage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleFillClick = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleConfirmFill = (amount: string) => {
    setShowModal(false);
    setSelectedOrder(null);
    toast.success('Trade initiated! Funds locked for 12h settlement.', {
      duration: 5000,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <StatsSection />
        <MarketList orders={mockOrders} onFillClick={handleFillClick} />
      </main>

      {showModal && selectedOrder && (
        <FillOrderModal
          order={selectedOrder}
          onClose={handleCloseModal}
          onConfirm={handleConfirmFill}
        />
      )}
    </div>
  );
}