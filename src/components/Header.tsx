import { Link, useRouterState } from '@tanstack/react-router';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { Moon, Sun, Wallet } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

function shortenAddress(address: string, chars = 4): string {
	return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export default function Header() {
	const { isDarkMode, toggleDarkMode } = useTheme();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { open } = useAppKit();
	const { address, isConnected } = useAppKitAccount();

	const isActive = (path: string) => pathname === path;

	return (
		<header className='bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex items-center justify-between h-16'>
					<div className='flex items-center'>
						<Link to='/' className='flex items-center space-x-2'>
							<div className='w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center'>
								<span className='text-white font-bold text-lg'>V</span>
							</div>
							<span className='font-semibold text-xl text-gray-900 dark:text-white'>
								VWAP Spot
							</span>
						</Link>
					</div>
					<nav className='hidden md:flex space-x-8'>
						<Link
							to='/'
							className={`px-1 py-2 font-medium transition-colors ${
								isActive('/')
									? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
									: 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
							}`}
						>
							Market
						</Link>
						<Link
							to='/my-quotes'
							className={`px-1 py-2 font-medium transition-colors ${
								isActive('/my-quotes')
									? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
									: 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
							}`}
						>
							My Quotes
						</Link>
						<Link
							to='/my-trades'
							className={`px-1 py-2 font-medium transition-colors ${
								isActive('/my-trades')
									? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
									: 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
							}`}
						>
							My Trades
						</Link>
						<Link
							to='/wrap-eth'
							className={`px-1 py-2 font-medium transition-colors ${
								isActive('/wrap-eth')
									? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
									: 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
							}`}
						>
							Wrap ETH
						</Link>
					</nav>
					<div className='flex items-center space-x-4'>
						<button
							type='button'
							onClick={toggleDarkMode}
							className='p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800'
							aria-label='Toggle dark mode'
						>
							{isDarkMode ? (
								<Sun className='w-5 h-5' />
							) : (
								<Moon className='w-5 h-5' />
							)}
						</button>
						<div className='flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg'>
							<div className='w-2 h-2 bg-green-500 rounded-full' />
							<span className='text-sm text-gray-700 dark:text-gray-300'>
								Sepolia
							</span>
						</div>
						<button
							type='button'
							onClick={() =>
								open(isConnected ? { view: 'Account' } : { view: 'Connect' })
							}
							className='flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors'
						>
							<Wallet className='w-4 h-4' />
							<span>
								{isConnected && address
									? shortenAddress(address)
									: 'Connect Wallet'}
							</span>
						</button>
					</div>
				</div>
			</div>
		</header>
	);
}
