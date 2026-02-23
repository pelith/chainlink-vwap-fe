import { Calendar, TrendingUp } from 'lucide-react';
import { Trade } from '../../pages/MyTradesPage';

interface HistoryTabProps {
  trades: Trade[];
}

export function HistoryTab({ trades }: HistoryTabProps) {
  if (trades.length === 0) {
    return (
      <div className="p-12 text-center">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No trade history yet</p>
        <p className="text-gray-400 text-sm mt-2">
          Settled and refunded trades will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 mb-1">Total Trades</p>
              <p className="text-2xl font-semibold text-blue-900">{trades.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 mb-1">Successfully Settled</p>
              <p className="text-2xl font-semibold text-green-900">
                {trades.filter(t => t.status === 'settled').length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 mb-1">Refunded</p>
              <p className="text-2xl font-semibold text-gray-900">
                {trades.filter(t => t.status === 'refunded').length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trade ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Final VWAP Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sent Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Received Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Refunded Change
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trades.map((trade) => (
              <HistoryRow key={trade.id} trade={trade} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HistoryRow({ trade }: { trade: Trade }) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number, token: string) => {
    if (token === 'USDC') {
      return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return amount.toFixed(4);
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {trade.settledTime && formatDate(trade.settledTime)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-medium text-blue-600">#{trade.id}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          trade.role === 'Maker' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {trade.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {trade.finalVWAP 
          ? `${trade.finalVWAP.toLocaleString()} USDC`
          : <span className="text-gray-400">N/A</span>
        }
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="flex items-center space-x-1">
          <span className="text-red-600">-</span>
          <span>{formatAmount(trade.depositedAmount, trade.depositedToken)} {trade.depositedToken}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
        {trade.receivedAmount ? (
          <div className="flex items-center space-x-1">
            <span>+</span>
            <span>{formatAmount(trade.receivedAmount, trade.targetToken)} {trade.targetToken}</span>
          </div>
        ) : (
          <span className="text-gray-400">N/A</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {trade.refundedAmount && trade.refundedAmount > 0 ? (
          <div className="flex items-center space-x-1 text-blue-600">
            <span>+</span>
            <span>{formatAmount(trade.refundedAmount, trade.depositedToken)} {trade.depositedToken}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {trade.status === 'settled' ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Settled
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Refunded
          </span>
        )}
      </td>
    </tr>
  );
}
