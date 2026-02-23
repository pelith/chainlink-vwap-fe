import { Clock, HelpCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Order } from '../App';
import usdcIcon from 'figma:asset/2654d0ea7067f6da4d09a20d5d807a46ea193b8e.png';
import wethIcon from 'figma:asset/c68666dc78ff5ce7cd2de448ff99cf9fff49e11b.png';

interface QuoteListItemProps {
  order: Order;
  onFillClick: (order: Order) => void;
}

export function QuoteListItem({ order, onFillClick }: QuoteListItemProps) {
  const isSellWeth = order.direction === 'SELL_WETH';
  const deltaPercent = (order.delta / 100).toFixed(2);
  const deltaSign = order.delta >= 0 ? '+' : '';

  // Pricing rule color based on delta
  const pricingColor = order.delta >= 0 
    ? 'text-green-600 dark:text-emerald-400' 
    : 'text-red-600 dark:text-red-400';

  const formatAmount = (amount: number, token: string) => {
    if (token === 'USDC') {
      return amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return amount.toFixed(2);
  };

  const receiveToken = isSellWeth ? 'USDC' : 'WETH';
  const tokenIcon = order.token === 'USDC' ? usdcIcon : wethIcon;

  return (
    <div 
      onClick={() => onFillClick(order)}
      className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 rounded-lg border border-gray-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:border-gray-400 dark:hover:border-blue-500/50 dark:hover:shadow-blue-500/10 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer p-5 w-full"
    >
      <div className="flex items-center gap-6">
        {/* Left Section - Token Symbol */}
        <div className="flex-shrink-0 w-24">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Sell</p>
          <div className="flex items-center gap-2">
            <img src={tokenIcon} alt={order.token} className="w-6 h-6" />
            <span className="text-lg font-bold text-gray-900 dark:text-slate-100">{order.token}</span>
          </div>
        </div>

        {/* Sell Amount */}
        <div className="flex-1 min-w-[180px] pl-2">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Sell Amount</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              {formatAmount(order.amount, order.token)}
            </span>
            <span className="text-sm text-gray-600 dark:text-slate-400 font-medium">{order.token}</span>
          </div>
        </div>

        {/* Pricing Rule */}
        <div className="flex-1 min-w-[200px]">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Pricing Rule</p>
          <div className="flex items-baseline space-x-2">
            <span className={`text-xl font-semibold ${pricingColor}`}>
              VWAP {deltaSign}{deltaPercent}%
            </span>
            <div className="group relative">
              <HelpCircle className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 dark:bg-slate-800 text-white dark:text-slate-100 text-xs rounded-lg shadow-lg z-10 border border-slate-700">
                This delta is added to the 12-hour VWAP settlement price.
              </div>
            </div>
          </div>
        </div>

        {/* Min Required */}
        <div className="flex-1 min-w-[180px]">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Min Required</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              {formatAmount(order.minAmountOut, receiveToken)}
            </span>
            <span className="text-sm text-gray-600 dark:text-slate-400 font-medium">{receiveToken}</span>
          </div>
        </div>

        {/* Right Section - Order ID & Expiry */}
        <div className="flex flex-col space-y-1 flex-shrink-0 items-end min-w-[120px]">
          <span className="text-xs text-gray-500 dark:text-slate-500">#{order.id}</span>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              {order.expiryHours.toString().padStart(2, '0')}h {order.expiryMinutes.toString().padStart(2, '0')}m
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}