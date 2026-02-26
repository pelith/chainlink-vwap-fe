
import { useAccount } from 'wagmi';

export function useWalletChainId(): number | undefined {
	const { chainId } = useAccount();
	return chainId;
}
