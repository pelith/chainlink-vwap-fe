import { AlertCircle, Calendar, Clock, Info, X } from "lucide-react";
import { useState } from "react";
import type { Order } from "#/modules/marketplace/types/marketplace.types";

interface FillOrderModalProps {
	order: Order;
	onClose: () => void;
	onConfirm: (amount: string) => void;
}

export function FillOrderModal({
	order,
	onClose,
	onConfirm,
}: FillOrderModalProps) {
	const [depositAmount, setDepositAmount] = useState("");
	const [isApproved, setIsApproved] = useState(false);

	const isSellWeth = order.direction === "SELL_WETH";
	const depositToken = isSellWeth ? "USDC" : "WETH";

	const depositAmountNum = parseFloat(depositAmount) || 0;
	const hasError =
		depositAmount !== "" && depositAmountNum < order.minAmountOut;

	const formatMinAmount = (amount: number, token: string) => {
		if (token === "USDC") {
			return amount.toLocaleString("en-US", {
				minimumFractionDigits: 0,
				maximumFractionDigits: 0,
			});
		}
		return amount.toFixed(2);
	};

	const now = new Date();
	const settlementTime = new Date(now.getTime() + 12 * 60 * 60 * 1000);
	const settlementFormatted = settlementTime.toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

	const handleApprove = () => setIsApproved(true);

	const handleConfirm = () => {
		if (!hasError && depositAmountNum >= order.minAmountOut && isApproved) {
			onConfirm(depositAmount);
		}
	};

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			<div
				className="fixed inset-0 bg-gray-900 bg-opacity-60 dark:bg-opacity-80 transition-opacity"
				onClick={onClose}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => e.key === "Escape" && onClose()}
				aria-label="Close"
			/>
			<div className="flex min-h-full items-center justify-center p-4">
				<div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
							Fill Order #{order.id}
						</h2>
						<button
							type="button"
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
						>
							<X className="w-6 h-6" />
						</button>
					</div>
					<div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm text-gray-600 dark:text-gray-400">
								You are filling
							</span>
							<span
								className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
									isSellWeth
										? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
										: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
								}`}
							>
								{isSellWeth ? "Sell WETH" : "Sell USDC"}
							</span>
						</div>
						<p className="text-lg font-semibold text-gray-900 dark:text-white">
							{order.amount} {order.token}
						</p>
					</div>
					<div className="mb-2">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Deposit Amount ({depositToken})
						</label>
						<div className="relative">
							<input
								type="number"
								value={depositAmount}
								onChange={(e) => setDepositAmount(e.target.value)}
								placeholder={`Min: ${formatMinAmount(order.minAmountOut, depositToken)}`}
								className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-gray-900/50 dark:text-white dark:placeholder-gray-400 ${
									hasError
										? "border-red-500 bg-red-50 dark:bg-red-900/20"
										: "border-gray-300 dark:border-gray-600"
								}`}
							/>
							<span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
								{depositToken}
							</span>
						</div>
					</div>
					{hasError && (
						<div className="mb-4 flex items-start space-x-2 text-red-600 dark:text-red-400 text-sm">
							<AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
							<span>
								Amount must be at least{" "}
								{formatMinAmount(order.minAmountOut, depositToken)}{" "}
								{depositToken}
							</span>
						</div>
					)}
					{!hasError && depositAmount === "" && (
						<p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
							Minimum deposit:{" "}
							{formatMinAmount(order.minAmountOut, depositToken)} {depositToken}
						</p>
					)}
					<div className="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
								<Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
								<span>Lock Duration</span>
							</div>
							<span className="font-medium text-gray-900 dark:text-white">
								12 Hours
							</span>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
								<Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
								<span>Est. Settlement</span>
							</div>
							<span className="font-medium text-gray-900 dark:text-white">
								{settlementFormatted}
							</span>
						</div>
					</div>
					<div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
						<div className="flex items-start space-x-2">
							<Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
							<div className="text-sm text-amber-900 dark:text-amber-200">
								<p className="font-medium mb-1">How it works:</p>
								<p>
									Funds will be locked for 12 hours while the VWAP is
									calculated. Excess funds will be automatically refunded based
									on the final VWAP settlement price.
								</p>
							</div>
						</div>
					</div>
					<div className="flex space-x-3">
						{!isApproved ? (
							<button
								type="button"
								onClick={handleApprove}
								disabled={hasError || !depositAmount}
								className="flex-1 px-6 py-3 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Approve {depositToken}
							</button>
						) : (
							<button
								type="button"
								disabled
								className="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg font-medium cursor-not-allowed"
							>
								✓ Approved
							</button>
						)}
						<button
							type="button"
							onClick={handleConfirm}
							disabled={!isApproved || hasError || !depositAmount}
							className="flex-1 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Confirm Fill
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
