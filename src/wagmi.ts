import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { env } from './env';

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

if (!projectId) {
	throw new Error('VITE_REOWN_PROJECT_ID is not defined');
}

export const config = new WagmiAdapter({
	networks: [sepolia],
	projectId,
	ssr: false,
	connectors: [injected()],
	transports: {
		[sepolia.id]: http(
			env.VITE_SEPOLIA_RPC_URL || sepolia.rpcUrls.default.http[0],
		),
	},
});

createAppKit({
	adapters: [config],
	networks: [sepolia],
	projectId,
	metadata: {
		name: 'Chainlink VWAP',
		description: 'Chainlink VWAP',
		url: 'https://chainlink-vwap.vercel.app',
		icons: ['https://chainlink-vwap.vercel.app/favicon.ico'],
	},
	features: {
		email: false,
		socials: false,
	},
	enableNetworkSwitch: false,
});
declare module 'wagmi' {
	interface Register {
		config: typeof config;
	}
}
