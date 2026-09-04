import { f as getTrain } from "./ssr.mjs";
import { f as lazyRouteComponent, j as notFound, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/train._number-CHdRUOdK.js
/**
* Full timetable for one train. Featured trains resolve from the client
* bundle; everything else is loaded from a zone shard on the server or
* via `/api/v1/train/:number/route` in the browser.
*/
var loadTrainRoute = async (number) => {
	const local = getTrain(number);
	if (local) return local;
	const { getTrainByNumber } = await import("./ssr.mjs").then((n) => n.v).then((n) => n.m);
	return getTrainByNumber(number);
};
var $$splitComponentImporter = () => import("./train._number-jP1JqMm9.mjs");
var $$splitNotFoundComponentImporter = () => import("./train._number-D3on-Ut_.mjs");
var Route = createFileRoute("/train/$number")({
	loader: async ({ params }) => {
		const train = await loadTrainRoute(params.number);
		if (!train) throw notFound();
		return { train };
	},
	head: ({ loaderData }) => {
		if (!loaderData) return { meta: [{ title: "Train not found — ITS Indian Train System" }, {
			name: "robots",
			content: "noindex"
		}] };
		const { train } = loaderData;
		const title = `${train.number} ${train.name} — Live Running Status & Route Track | ITS Indian Train System`;
		const description = `Track timeline, predicted delay, next halt, and full timetable for ${train.number} ${train.name} between ${train.halts[0].name} and ${train.halts[train.halts.length - 1].name}.`;
		return { meta: [
			{ title },
			{
				name: "description",
				content: description
			},
			{
				property: "og:title",
				content: title
			},
			{
				property: "og:description",
				content: description
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		] };
	},
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent"),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
