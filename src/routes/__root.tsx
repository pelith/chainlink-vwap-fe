import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { WagmiProvider } from 'wagmi';
import Header from '@/components/Header';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/contexts/theme-context';
import TanStackQueryDevtools from '@/integrations/tanstack-query/devtools';
import TanStackQueryProvider from '@/integrations/tanstack-query/root-provider';
import { config } from '@/wagmi';

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: RootLayout,
});

function RootLayout() {
	return (
		<ThemeProvider>
			<TanStackQueryProvider>
				<WagmiProvider config={config.wagmiConfig}>
					<Header />
					<Outlet />
				</WagmiProvider>
				<Toaster position="top-right" />
				<TanStackDevtools
					config={{
						position: 'bottom-right',
					}}
					plugins={[
						{
							name: 'Tanstack Router',
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
			</TanStackQueryProvider>
		</ThemeProvider>
	);
}
