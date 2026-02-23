import { Info, Sparkles } from "lucide-react";
import { useState } from "react";

interface CreateQuoteFormProps {
	onSubmit: (data: {
		direction: "SELL_WETH" | "SELL_USDC";
		amount: string;
		delta: string;
		minAmountOut: string;
		deadline: string;
	}) => void;
}

export function CreateQuoteForm({ onSubmit }: CreateQuoteFormProps) {
	const [direction, setDirection] = useState<"SELL_WETH" | "SELL_USDC">(
		"SELL_WETH",
	);
	const [amount, setAmount] = useState("");
	const [delta, setDelta] = useState("");
	const [minAmountOut, setMinAmountOut] = useState("");
	const [deadline, setDeadline] = useState("12");

	const sellToken = direction === "SELL_WETH" ? "WETH" : "USDC";
	const receiveToken = direction === "SELL_WETH" ? "USDC" : "WETH";
	const walletBalance = direction === "SELL_WETH" ? "45.5" : "125,000";

	const handleAutoCalculate = () => {
		if (!amount) return;
		const amountNum = parseFloat(amount);
		const marketPrice = 3050;
		if (direction === "SELL_WETH") {
			setMinAmountOut((amountNum * marketPrice * 0.8).toFixed(0));
		} else {
			setMinAmountOut(((amountNum / marketPrice) * 0.8).toFixed(2));
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({ direction, amount, delta, minAmountOut, deadline });
		setAmount("");
		setDelta("");
		setMinAmountOut("");
	};

	const deltaPercent = delta ? (parseFloat(delta) / 100).toFixed(2) : "0.00";
	const isPositiveDelta = parseFloat(delta || "0") >= 0;

	return (
		<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 sticky top-8">
			<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
				Create New RFQ Order
			</h2>
			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Direction
					</label>
					<div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
						<button
							type="button"
							onClick={() => setDirection("SELL_WETH")}
							className={`py-2 px-4 rounded-md font-medium transition-all ${
								direction === "SELL_WETH"
									? "bg-white dark:bg-gray-600 text-red-700 dark:text-red-400 shadow-sm"
									: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
							}`}
						>
							Sell WETH
						</button>
						<button
							type="button"
							onClick={() => setDirection("SELL_USDC")}
							className={`py-2 px-4 rounded-md font-medium transition-all ${
								direction === "SELL_USDC"
									? "bg-white dark:bg-gray-600 text-green-700 dark:text-green-400 shadow-sm"
									: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
							}`}
						>
							Sell USDC
						</button>
					</div>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Sell Amount
					</label>
					<div className="relative">
						<input
							type="number"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder="0.00"
							step="any"
							required
							className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
						/>
						<span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
							{sellToken}
						</span>
					</div>
					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
						Balance: {walletBalance} {sellToken}
					</p>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Price Delta (bps)
					</label>
					<div className="relative">
						<input
							type="number"
							value={delta}
							onChange={(e) => setDelta(e.target.value)}
							placeholder="0"
							step="1"
							required
							className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
						/>
						<span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
							bps
						</span>
					</div>
					<div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
						<p className="text-sm text-blue-900 dark:text-blue-200">
							Final Price = 12H VWAP × (1 {isPositiveDelta ? "+" : ""}{" "}
							{deltaPercent}%)
						</p>
						<p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
							{isPositiveDelta
								? "Positive delta means you sell higher than VWAP."
								: "Negative delta means you sell lower than VWAP."}
						</p>
					</div>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Minimum Taker Deposit
					</label>
					<div className="relative">
						<input
							type="number"
							value={minAmountOut}
							onChange={(e) => setMinAmountOut(e.target.value)}
							placeholder="0.00"
							step="any"
							required
							className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
						/>
						<span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
							{receiveToken}
						</span>
					</div>
					<button
						type="button"
						onClick={handleAutoCalculate}
						className="mt-2 flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
					>
						<Sparkles className="w-4 h-4" />
						<span>Auto-calculate based on market price</span>
					</button>
					<div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
						<div className="flex items-start space-x-2">
							<Info className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
							<p className="text-xs text-gray-600 dark:text-gray-400">
								Takers must deposit at least this amount to trigger the trade.
							</p>
						</div>
					</div>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Deadline
					</label>
					<select
						value={deadline}
						onChange={(e) => setDeadline(e.target.value)}
						className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 dark:text-white"
					>
						<option value="1">1 hour</option>
						<option value="6">6 hours</option>
						<option value="12">12 hours</option>
						<option value="24">24 hours</option>
					</select>
				</div>
				<button
					type="submit"
					className="w-full py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
				>
					Sign & Create Order
				</button>
			</form>
		</div>
	);
}
