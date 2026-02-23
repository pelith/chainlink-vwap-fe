import { AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import type { Trade } from "@/modules/my-trades/types/my-trades.types";

interface ReadyToSettleTabProps {
	trades: Trade[];
	onSettle: (tradeId: string) => void;
	onRefund: (tradeId: string) => void;
}

export function ReadyToSettleTab({
	trades,
	onSettle,
	onRefund,
}: ReadyToSettleTabProps) {
	if (trades.length === 0) {
		return (
			<div className="p-12 text-center">
				<CheckCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
				<p className="text-gray-500 dark:text-gray-400 text-lg">
					No trades ready to settle
				</p>
				<p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
					Completed trades will appear here when the locking period ends.
				</p>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			{trades.map((trade) => (
				<SettleTradeCard
					key={trade.id}
					trade={trade}
					onSettle={onSettle}
					onRefund={onRefund}
				/>
			))}
		</div>
	);
}

function SettleTradeCard({
	trade,
	onSettle,
	onRefund,
}: {
	trade: Trade;
	onSettle: (id: string) => void;
	onRefund: (id: string) => void;
}) {
	const isRefundable = trade.status === "expired_refundable";
	const formatDateTime = (date: Date) =>
		date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	const estimatedReceived =
		trade.role === "Taker"
			? trade.targetAmount
			: (trade.finalVWAP || 3045) * trade.depositedAmount;
	const estimatedRefund =
		trade.role === "Taker" && trade.finalVWAP
			? Math.max(
					0,
					trade.depositedAmount - trade.finalVWAP * trade.targetAmount,
				)
			: 0;

	return (
		<div
			className={`border-2 rounded-lg p-6 hover:shadow-lg transition-all ${
				isRefundable
					? "border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/30"
					: "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30"
			}`}
		>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center space-x-3">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
						Trade #{trade.id}
					</h3>
					<span className="text-sm text-gray-500">|</span>
					<span className="text-sm text-gray-600 dark:text-gray-400">
						Role: {trade.role}
					</span>
				</div>
				{isRefundable ? (
					<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-200 dark:bg-orange-800/50 text-orange-800 dark:text-orange-200">
						<AlertTriangle className="w-4 h-4 mr-1" />
						Expired / Refundable
					</span>
				) : (
					<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-200 dark:bg-green-800/50 text-green-800 dark:text-green-200">
						<CheckCircle className="w-4 h-4 mr-1" />
						Ready to Settle
					</span>
				)}
			</div>
			{isRefundable ? (
				<div className="mb-4 p-4 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-lg">
					<p className="text-sm font-medium text-orange-900 dark:text-orange-200 mb-1">
						Settlement Window Passed
					</p>
					<p className="text-sm text-orange-700 dark:text-orange-300">
						This trade is older than 7 days. You can now retrieve your original
						deposit.
					</p>
				</div>
			) : (
				<div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
					<p className="text-sm font-medium text-green-900 dark:text-green-200 mb-1">
						12H Window Closed
					</p>
					<p className="text-sm text-green-700 dark:text-green-300">
						VWAP data is ready. Click "Settle Trade" to complete the exchange.
					</p>
				</div>
			)}
			<div className="grid grid-cols-2 gap-4 mb-4">
				<div>
					<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
						Deposited
					</p>
					<p className="text-lg font-semibold text-gray-900 dark:text-white">
						{trade.depositedAmount.toLocaleString()} {trade.depositedToken}
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
						Target
					</p>
					<p className="text-lg font-semibold text-gray-900 dark:text-white">
						{trade.targetAmount} {trade.targetToken}
					</p>
				</div>
			</div>
			{!isRefundable && trade.finalVWAP && (
				<div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
								Final 12H VWAP
							</p>
							<p className="text-2xl font-semibold text-blue-700 dark:text-blue-300">
								{trade.finalVWAP.toLocaleString()} USDC
							</p>
						</div>
						<div className="text-right">
							<p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
								Est. Received
							</p>
							<p className="text-lg font-semibold text-green-600 dark:text-green-400">
								+{estimatedReceived.toLocaleString()} {trade.targetToken}
							</p>
							{estimatedRefund > 0 && (
								<p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
									Refund: {estimatedRefund.toFixed(2)} {trade.depositedToken}
								</p>
							)}
						</div>
					</div>
				</div>
			)}
			<div className="flex space-x-4">
				{isRefundable ? (
					<>
						<button
							type="button"
							onClick={() => onRefund(trade.id)}
							className="flex-1 flex items-center justify-center space-x-2 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
						>
							<RefreshCw className="w-5 h-5" />
							<span>Claim Refund</span>
						</button>
						<button
							type="button"
							disabled
							className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed font-medium"
						>
							Settlement Expired
						</button>
					</>
				) : (
					<>
						<button
							type="button"
							onClick={() => onSettle(trade.id)}
							className="flex-1 flex items-center justify-center space-x-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-lg"
						>
							<CheckCircle className="w-5 h-5" />
							<span>Settle Trade</span>
						</button>
						<button
							type="button"
							disabled
							className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed font-medium"
							title="Refund becomes active if settlement is delayed > 7 days"
						>
							Refund (Locked)
						</button>
					</>
				)}
			</div>
			{!isRefundable && (
				<p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
					Note: If Oracle fails or settlement is delayed &gt; 7 days, Refund
					will become active.
				</p>
			)}
		</div>
	);
}
