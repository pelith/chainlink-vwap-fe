import { env } from '@/env';
import { sepolia } from 'wagmi/chains';

export const TARGET_CHAIN_ID = env.VITE_TARGET_CHAIN_ID || sepolia.id;
