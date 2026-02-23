import { createFileRoute } from "@tanstack/react-router";
import { MarketplacePage } from "@/modules/marketplace";

export const Route = createFileRoute("/")({
	component: MarketplacePage,
});
