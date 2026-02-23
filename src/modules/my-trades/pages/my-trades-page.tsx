import { useState } from "react";
import { toast } from "sonner";
import { HistoryTab } from "#/modules/my-trades/components/history-tab";
import { LockingTab } from "#/modules/my-trades/components/locking-tab";
import { ReadyToSettleTab } from "#/modules/my-trades/components/ready-to-settle-tab";
import type { Trade } from "#/modules/my-trades/types/my-trades.types";

export function MyTradesPage() {
	const [activeTab, setActiveTab] = useState<"locking" | "settle" | "history">(
		"locking",
	);
	const [trades, setTrades] = useState<Trade[]>([
		{
			id: "8821",
			role: "Taker",
			status: "locking",
			depositedAmount: 30000,
			depositedToken: "USDC",
			targetAmount: 10,
			targetToken: "WETH",
			fillTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
			endTime: new Date(Date.now() + 9 * 60 * 60 * 1000),
		},
		{
			id: "8820",
			role: "Maker",
			status: "locking",
			depositedAmount: 5,
			depositedToken: "WETH",
			targetAmount: 15000,
			targetToken: "USDC",
			fillTime: new Date(Date.now() - 7 * 60 * 60 * 1000),
			endTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
		},
		{
			id: "8819",
			role: "Taker",
			status: "ready_to_settle",
			depositedAmount: 50000,
			depositedToken: "USDC",
			targetAmount: 16,
			targetToken: "WETH",
			fillTime: new Date(Date.now() - 13 * 60 * 60 * 1000),
			endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
			finalVWAP: 3045,
		},
		{
			id: "8818",
			role: "Maker",
			status: "ready_to_settle",
			depositedAmount: 8,
			depositedToken: "WETH",
			targetAmount: 24000,
			targetToken: "USDC",
			fillTime: new Date(Date.now() - 14 * 60 * 60 * 1000),
			endTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
			finalVWAP: 3042,
		},
		{
			id: "8817",
			role: "Taker",
			status: "expired_refundable",
			depositedAmount: 25000,
			depositedToken: "USDC",
			targetAmount: 8,
			targetToken: "WETH",
			fillTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
			endTime: new Date(
				Date.now() - 7 * 24 * 60 * 60 * 1000 - 12 * 60 * 60 * 1000,
			),
		},
		{
			id: "8816",
			role: "Maker",
			status: "settled",
			depositedAmount: 12,
			depositedToken: "WETH",
			targetAmount: 36000,
			targetToken: "USDC",
			fillTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
			endTime: new Date(
				Date.now() - 2 * 24 * 60 * 60 * 1000 - 12 * 60 * 60 * 1000,
			),
			settledTime: new Date(
				Date.now() - 2 * 24 * 60 * 60 * 1000 - 10 * 60 * 60 * 1000,
			),
			finalVWAP: 3038,
			receivedAmount: 36456,
			refundedAmount: 0,
		},
		{
			id: "8815",
			role: "Taker",
			status: "settled",
			depositedAmount: 40000,
			depositedToken: "USDC",
			targetAmount: 13,
			targetToken: "WETH",
			fillTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
			endTime: new Date(
				Date.now() - 4 * 24 * 60 * 60 * 1000 - 12 * 60 * 60 * 1000,
			),
			settledTime: new Date(
				Date.now() - 4 * 24 * 60 * 60 * 1000 - 11 * 60 * 60 * 1000,
			),
			finalVWAP: 3048,
			receivedAmount: 13,
			refundedAmount: 350.76,
		},
		{
			id: "8814",
			role: "Maker",
			status: "settled",
			depositedAmount: 20,
			depositedToken: "WETH",
			targetAmount: 60000,
			targetToken: "USDC",
			fillTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
			endTime: new Date(
				Date.now() - 6 * 24 * 60 * 60 * 1000 - 12 * 60 * 60 * 1000,
			),
			settledTime: new Date(
				Date.now() - 6 * 24 * 60 * 60 * 1000 - 10 * 60 * 60 * 1000,
			),
			finalVWAP: 3035,
			receivedAmount: 60700,
			refundedAmount: 0,
		},
	]);

	const lockingTrades = trades.filter((t) => t.status === "locking");
	const readyToSettleTrades = trades.filter(
		(t) => t.status === "ready_to_settle" || t.status === "expired_refundable",
	);
	const historyTrades = trades.filter(
		(t) => t.status === "settled" || t.status === "refunded",
	);

	const handleSettle = (tradeId: string) => {
		setTrades(
			trades.map((trade) => {
				if (trade.id !== tradeId) return trade;
				const vwap = trade.finalVWAP ?? 3045;
				const received =
					trade.role === "Taker"
						? trade.targetAmount
						: trade.targetAmount * 1.02;
				const refunded =
					trade.role === "Taker"
						? Math.max(0, trade.depositedAmount - vwap * trade.targetAmount)
						: 0;
				return {
					...trade,
					status: "settled" as const,
					settledTime: new Date(),
					receivedAmount: received,
					refundedAmount: refunded,
				};
			}),
		);
		toast.success("Trade settled successfully!");
	};

	const handleRefund = (tradeId: string) => {
		setTrades(
			trades.map((trade) =>
				trade.id === tradeId
					? {
							...trade,
							status: "refunded" as const,
							settledTime: new Date(),
							receivedAmount: trade.depositedAmount,
							refundedAmount: 0,
						}
					: trade,
			),
		);
		toast.success("Refund claimed successfully!");
	};

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8">
					My Trades
				</h1>
				<div className="bg-white dark:bg-gray-800 rounded-t-xl border border-b-0 border-gray-200 dark:border-gray-700 shadow-sm">
					<div className="flex space-x-8 px-6">
						<button
							type="button"
							onClick={() => setActiveTab("locking")}
							className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
								activeTab === "locking"
									? "border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400"
									: "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
							}`}
						>
							Locking (In Progress)
							{lockingTrades.length > 0 && (
								<span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs">
									{lockingTrades.length}
								</span>
							)}
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("settle")}
							className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
								activeTab === "settle"
									? "border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400"
									: "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
							}`}
						>
							Ready to Settle
							{readyToSettleTrades.length > 0 && (
								<span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs">
									{readyToSettleTrades.length}
								</span>
							)}
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("history")}
							className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
								activeTab === "history"
									? "border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400"
									: "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
							}`}
						>
							History
						</button>
					</div>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-b-xl border border-gray-200 dark:border-gray-700 shadow-sm">
					{activeTab === "locking" && <LockingTab trades={lockingTrades} />}
					{activeTab === "settle" && (
						<ReadyToSettleTab
							trades={readyToSettleTrades}
							onSettle={handleSettle}
							onRefund={handleRefund}
						/>
					)}
					{activeTab === "history" && <HistoryTab trades={historyTrades} />}
				</div>
			</main>
		</div>
	);
}
