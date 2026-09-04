import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/display._code-CYO0ubHT.js
var $$splitComponentImporter = () => import("./display._code-DE4b_swb.mjs");
var Route = createFileRoute("/display/$code")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	head: ({ params }) => ({ meta: [
		{ title: `${params.code.toUpperCase()} station display — ITS Indian Train System` },
		{
			name: "description",
			content: `High-contrast station display for ${params.code.toUpperCase()} with EtaEngine arrival bands.`
		},
		{
			name: "robots",
			content: "noindex"
		}
	] })
});
//#endregion
export { Route as t };
