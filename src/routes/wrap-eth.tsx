import { createFileRoute } from '@tanstack/react-router';
import { WrapEthPage } from '@/modules/eth-deposit/pages/wrap-eth-page';

export const Route = createFileRoute('/wrap-eth')({
	component: WrapEthPage,
});
