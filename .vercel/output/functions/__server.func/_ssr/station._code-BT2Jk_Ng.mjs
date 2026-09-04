import { y as stationFor } from "./ssr.mjs";
import { a as stations } from "./rail-DWAKK18y.mjs";
import { f as lazyRouteComponent, j as notFound, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/station._code-BT2Jk_Ng.js
var $$splitComponentImporter = () => import("./station._code-CMlyA8f7.mjs");
var $$splitNotFoundComponentImporter = () => import("./station._code-DokS4LDS.mjs");
var Route = createFileRoute("/station/$code")({
	loader: ({ params }) => {
		const code = params.code.toUpperCase();
		const stationInfo = stationFor(code);
		const hardcodedStation = stations.find(([, c]) => c === code);
		const name = stationInfo?.name || hardcodedStation?.[0];
		if (!name && !stationInfo) throw notFound();
		return {
			code,
			name: name ?? code
		};
	},
	head: ({ loaderData }) => {
		const code = loaderData?.code;
		const name = loaderData?.name;
		return { meta: [
			{ title: `${name ? `${name} (${code})` : "Station"} — Station Board | ITS Indian Train System` },
			{
				name: "description",
				content: `Live arrivals and departures with predicted times and platforms at ${name ?? ""} (${code ?? ""}), from the ITS Indian Train System ETA forecasting model.`
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
