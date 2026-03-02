import { createFileRoute } from '@tanstack/react-router';
import { PresetPage } from '@/modules/eth-deposit/pages/preset-page';

export const Route = createFileRoute('/preset')({
	component: PresetPage,
});
