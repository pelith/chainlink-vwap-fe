import { createFileRoute } from "@tanstack/react-router";
import { MyQuotesPage } from "@/modules/my-quotes";

export const Route = createFileRoute("/my-quotes")({
	component: MyQuotesPage,
});
