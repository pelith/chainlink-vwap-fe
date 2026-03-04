import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Check, Moon, Palette, Sun, Wallet } from 'lucide-react';
import Logo from '@/assets/logo.png';
import LogoDark from '@/assets/logo-dark.png';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { THEMES } from '@/config/themes';
import { useTheme } from '@/contexts/theme-context';

function shortenAddress(address: string, chars = 4): string {
	return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export default function Header() {
	const { theme, setTheme, isDarkMode, toggleDarkMode } = useTheme();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { open } = useAppKit();
	const { address, isConnected } = useAppKitAccount();

	const isActive = (path: string) => pathname === path;

	return (
		<header className='bg-background border-b border-border transition-colors'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex items-center justify-between h-16'>
					<div className='flex items-center'>
						<Link to='/' className='flex items-center space-x-2'>
							<img src={isDarkMode ? LogoDark : Logo} alt='VWAP Spot' className='h-10' />
						</Link>
					</div>
					<nav className='hidden md:flex space-x-8'>
						<Link
							to='/'
							className={`px-1 py-2 font-medium transition-colors ${
								isActive('/')
									? 'text-primary border-b-2 border-primary'
									: 'text-muted-foreground hover:text-foreground'
							}`}
						>
							Market
						</Link>
						<Link
							to='/my-quotes'
							className={`px-1 py-2 font-medium transition-colors ${
								isActive('/my-quotes')
									? 'text-primary border-b-2 border-primary'
									: 'text-muted-foreground hover:text-foreground'
							}`}
						>
							My Quotes
						</Link>
						<Link
							to='/my-trades'
							className={`px-1 py-2 font-medium transition-colors ${
								isActive('/my-trades')
									? 'text-primary border-b-2 border-primary'
									: 'text-muted-foreground hover:text-foreground'
							}`}
						>
							My Trades
						</Link>
						<Link
							to='/preset'
							className={`px-1 py-2 font-medium transition-colors ${
								isActive('/preset')
									? 'text-primary border-b-2 border-primary'
									: 'text-muted-foreground hover:text-foreground'
							}`}
						>
							Preset
						</Link>
					</nav>
					<div className='flex items-center space-x-4'>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									type='button'
									className='p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted'
									aria-label='Change theme'
								>
									<Palette className='w-5 h-5' />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end' className='w-56'>
								{Object.values(THEMES).map((themeOption) => (
									<DropdownMenuItem
										key={themeOption.id}
										onClick={() => setTheme(themeOption.id)}
										className='flex items-center justify-between cursor-pointer'
									>
										<span className='flex items-center gap-2'>
											<span>{themeOption.icon}</span>
											<span>{themeOption.name}</span>
										</span>
										{theme === themeOption.id && (
											<Check className='w-4 h-4 text-primary' />
										)}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
						<button
							type='button'
							onClick={toggleDarkMode}
							className='p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted'
							aria-label='Toggle dark mode'
						>
							{isDarkMode ? (
								<Sun className='w-5 h-5' />
							) : (
								<Moon className='w-5 h-5' />
							)}
						</button>
						<div className='flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg'>
							<div className='w-2 h-2 bg-green-500 rounded-full' />
							<span className='text-sm text-muted-foreground'>
								Sepolia
							</span>
						</div>
						<button
							type='button'
							onClick={() =>
								open(isConnected ? { view: 'Account' } : { view: 'Connect' })
							}
							className='flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all shadow-sm'
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
