/**
 * Returns the actual chain ID from the connected wallet (via injected provider).
 * Unlike wagmi's useChainId, this returns the real chain even when the wallet
 * is on an unconfigured network (e.g. mainnet when only Sepolia is in config).
 */

import { useAppKitNetwork } from '@reown/appkit/react';

export function useWalletChainId(): number | undefined {
	const { chainId: wagmiChainId,  } = useAppKitNetwork();
	if (!wagmiChainId) return undefined;
	return Number(wagmiChainId);
}
