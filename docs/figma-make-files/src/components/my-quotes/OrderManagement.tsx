import { useState } from 'react';
import { FileText } from 'lucide-react';
import { MakerOrder } from '../../pages/MyQuotesPage';
import { OrdersTable } from './OrdersTable';

interface OrderManagementProps {
  orders: MakerOrder[];
  onCancelOrder: (orderId: string) => void;
}

type TabType = 'active' | 'filled' | 'cancelled';

export function OrderManagement({ orders, onCancelOrder }: OrderManagementProps) {
  const [activeTab, setActiveTab] = useState<TabType>('active');

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'active') return order.status === 'active';
    if (activeTab === 'filled') return order.status === 'filled';
    return order.status === 'cancelled' || order.status === 'expired';
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'active'
                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Active
            {orders.filter(o => o.status === 'active').length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs">
                {orders.filter(o => o.status === 'active').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('filled')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'filled'
                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Filled
            {orders.filter(o => o.status === 'filled').length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                {orders.filter(o => o.status === 'filled').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'cancelled'
                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Cancelled / Expired
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              {activeTab === 'active' && 'No active quotes.'}
              {activeTab === 'filled' && 'No filled orders yet.'}
              {activeTab === 'cancelled' && 'No cancelled or expired orders.'}
            </p>
            {activeTab === 'active' && (
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Create one to start market making.
              </p>
            )}
          </div>
        ) : (
          <OrdersTable orders={filteredOrders} onCancelOrder={onCancelOrder} activeTab={activeTab} />
        )}
      </div>
    </div>
  );
}