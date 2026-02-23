import { createFileRoute } from '@tanstack/react-router';
import { MyTradesPage } from '@/modules/my-trades';

export const Route = createFileRoute('/my-trades')({
	component: MyTradesPage,
});
