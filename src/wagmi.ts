import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains'; // Import relevant chains
import { injected } from 'wagmi/connectors';
import { env } from './env';
import { TARGET_CHAIN_ID } from './lib/constants';

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

if (!projectId) {
	throw new Error('VITE_REOWN_PROJECT_ID is not defined');
}

// Dynamically select the target chain based on environment variable
const targetChain = TARGET_CHAIN_ID === mainnet.id ? mainnet : sepolia;

export const config = new WagmiAdapter({
	networks: [targetChain],
	projectId,
	ssr: false,
	connectors: [injected()],
	transports: {
		[targetChain.id]: http(
			env.VITE_SEPOLIA_RPC_URL || targetChain.rpcUrls.default.http[0],
		),
	},
});

createAppKit({
	adapters: [config],
	networks: [targetChain],
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
