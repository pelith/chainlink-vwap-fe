import { Clock, HelpCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Order } from '../App';

interface QuoteCardProps {
  order: Order;
  onFillClick: (order: Order) => void;
}

export function QuoteCard({ order, onFillClick }: QuoteCardProps) {
  const isSellWeth = order.direction === 'SELL_WETH';
  const deltaPercent = (order.delta / 100).toFixed(2);
  const deltaSign = order.delta >= 0 ? '+' : '';

  const formatAmount = (amount: number, token: string) => {
    if (token === 'USDC') {
      return amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return amount.toFixed(2);
  };

  return (
    <div 
      onClick={() => onFillClick(order)}
      className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 rounded-xl border border-gray-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:border-gray-400 dark:hover:border-blue-500/50 dark:hover:shadow-blue-500/10 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer p-6"
    >
      {/* Header with Direction Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-xs text-gray-500 dark:text-slate-500">#{order.id}</div>
          <div className="w-px h-4 bg-gray-300 dark:bg-slate-700"></div>
          {isSellWeth ? (
            <>
              <ArrowDownCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/30">
                Sell WETH
              </span>
            </>
          ) : (
            <>
              <ArrowUpCircle className="w-5 h-5 text-green-500 dark:text-emerald-400" />
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 dark:bg-emerald-500/10 text-green-600 dark:text-emerald-300 border border-green-200 dark:border-emerald-500/30">
                Sell USDC
              </span>
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Amount</p>
        <p className="text-3xl font-semibold text-gray-900 dark:text-slate-100">
          {formatAmount(order.amount, order.token)} <span className="text-xl text-gray-500 dark:text-slate-400">{order.token}</span>
        </p>
      </div>

      {/* Pricing Rule (Delta) */}
      <div className="mb-4 bg-blue-50 dark:bg-blue-500/5 dark:backdrop-blur-sm rounded-lg p-4 border border-blue-100 dark:border-blue-400/20">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Pricing Rule</span>
          <div className="group relative">
            <HelpCircle className="w-4 h-4 text-gray-400 dark:text-slate-500 cursor-help" />
            <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 dark:bg-slate-800 text-white dark:text-slate-100 text-xs rounded-lg shadow-lg z-10 border border-slate-700">
              This delta is added to the 12-hour VWAP settlement price. Positive values increase the price, negative values decrease it.
            </div>
          </div>
        </div>
        <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
          VWAP {deltaSign}{deltaPercent}%
        </p>
      </div>

      {/* Entry Threshold */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Minimum Required to Fill</p>
        <p className="text-lg font-medium text-gray-900 dark:text-slate-100">
          {isSellWeth 
            ? `${formatAmount(order.minAmountOut, 'USDC')} USDC`
            : `${formatAmount(order.minAmountOut, 'WETH')} WETH`
          }
        </p>
      </div>

      {/* Expiry */}
      <div className="pt-4 border-t border-gray-200 dark:border-slate-700/50">
        <div className="flex items-center space-x-2 text-gray-500 dark:text-slate-400">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            Exp: {order.expiryHours.toString().padStart(2, '0')}h {order.expiryMinutes.toString().padStart(2, '0')}m
          </span>
        </div>
      </div>
    </div>
  );
}