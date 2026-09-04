import { i as __toESM } from "../_runtime.mjs";
import { p as initClientErrorTracking } from "./ssr.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { s as useTranslation, t as LanguageProvider } from "./rail-DWAKK18y.mjs";
import { _ as useRouter, c as HeadContent, d as Outlet, f as lazyRouteComponent, h as Link, m as createRootRouteWithContext, p as createFileRoute, s as Scripts, u as createRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route$8 } from "./display._code-CYO0ubHT.mjs";
import { t as Route$9 } from "./station._code-BT2Jk_Ng.mjs";
import { t as Route$10 } from "./train._number-CHdRUOdK.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-D9-5wf-j.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-B_JSZfA8.css";
function NotFoundComponent() {
	const { t } = useTranslation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: t("common.pageNotFound")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: t("common.pageNotFoundMsg")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: t("common.goHome")
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	const { t } = useTranslation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: t("common.errorTitle")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: t("common.errorMsg")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: t("common.tryAgain")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: t("common.goHome")
					})]
				})
			]
		})
	});
}
var Route$7 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "ITS Indian Train System" },
			{
				name: "author",
				content: "ITS Indian Train System"
			},
			{
				property: "og:title",
				content: "ITS Indian Train System"
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.svg",
				type: "image/svg+xml"
			},
			{
				rel: "alternate icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			},
			{
				rel: "apple-touch-icon",
				href: "/favicon.svg"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanguageProvider, { children }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$7.useRouteContext();
	(0, import_react.useEffect)(() => {
		initClientErrorTracking();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
	});
}
var $$splitComponentImporter$6 = () => import("./routes-CMchHDu3.mjs");
var Route$6 = createFileRoute("/")({
	component: lazyRouteComponent($$splitComponentImporter$6, "component"),
	head: () => ({ meta: [
		{ title: "ITS Indian Train System — Live ETA Forecast & Train Running Status" },
		{
			name: "description",
			content: "Look up Indian Railways trains from the published timetable, read predicted arrival times with confidence, delay causes and a control-room dashboard."
		},
		{
			property: "og:title",
			content: "ITS Indian Train System — Live ETA Forecast & Train Running Status"
		},
		{
			property: "og:description",
			content: "Timetable-backed train tracking with predicted ETA, delay cause tags and a control-room view for Indian Railways."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] })
});
var $$splitComponentImporter$5 = () => import("./connecting-impact-BOXojwoo.mjs");
var Route$5 = createFileRoute("/connecting-impact")({
	component: lazyRouteComponent($$splitComponentImporter$5, "component"),
	head: () => ({ meta: [{ title: "Connecting Trains Impact & Transfer Risk Calculator | ITS Indian Train System" }, {
		name: "description",
		content: "Calculate connection feasibility and platform transfer margins when switching trains at Indian Railways junction stations based on live ETA delay forecasts."
	}] })
});
var $$splitComponentImporter$4 = () => import("./control-room-KnHtTN7O.mjs");
var Route$4 = createFileRoute("/control-room")({
	component: lazyRouteComponent($$splitComponentImporter$4, "component"),
	head: () => ({ meta: [
		{ title: "Control room — ITS Indian Train System" },
		{
			name: "description",
			content: "Control-room dashboard: predicted ETA, delay causes and network-wide alerts from the ITS Indian Train System forecasting model."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] })
});
var $$splitComponentImporter$3 = () => import("./developer-wu_-8DMr.mjs");
var Route$3 = createFileRoute("/developer")({
	component: lazyRouteComponent($$splitComponentImporter$3, "component"),
	head: () => ({ meta: [{ title: "Developer REST API & Interactive Sandbox | ITS Indian Train System" }, {
		name: "description",
		content: "Integrate train tracking, ETA forecasts, delay classification, station boards, and PNR status into your applications with the REST API."
	}] })
});
var $$splitComponentImporter$2 = () => import("./network-C9KFBFvA.mjs");
var Route$2 = createFileRoute("/network")({
	component: lazyRouteComponent($$splitComponentImporter$2, "component"),
	head: () => ({ meta: [
		{ title: "Live network map — ITS Indian Train System" },
		{
			name: "description",
			content: "See tracked trains across the Indian Railways network on one map."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] })
});
var $$splitComponentImporter$1 = () => import("./ops-CP8fnpuK.mjs");
var Route$1 = createFileRoute("/ops")({
	component: lazyRouteComponent($$splitComponentImporter$1, "component"),
	head: () => ({ meta: [{ title: "Ops — ITS Indian Train System" }, {
		name: "description",
		content: "Live-feed quota, cache, tier mix, and harvest health for operators."
	}] })
});
var $$splitComponentImporter = () => import("./pnr-B3Yh1Voy.mjs");
var Route = createFileRoute("/pnr")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	head: () => ({ meta: [{ title: "Live PNR Status & Coach Position | ITS Indian Train System" }, {
		name: "description",
		content: "Check real-time Indian Railways PNR status, coach and berth allocations, chart preparation state, and live train location."
	}] })
});
var rootRouteChildren = {
	IndexRoute: Route$6.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$7
	}),
	ConnectingImpactRoute: Route$5.update({
		id: "/connecting-impact",
		path: "/connecting-impact",
		getParentRoute: () => Route$7
	}),
	ControlRoomRoute: Route$4.update({
		id: "/control-room",
		path: "/control-room",
		getParentRoute: () => Route$7
	}),
	DeveloperRoute: Route$3.update({
		id: "/developer",
		path: "/developer",
		getParentRoute: () => Route$7
	}),
	NetworkRoute: Route$2.update({
		id: "/network",
		path: "/network",
		getParentRoute: () => Route$7
	}),
	OpsRoute: Route$1.update({
		id: "/ops",
		path: "/ops",
		getParentRoute: () => Route$7
	}),
	PnrRoute: Route.update({
		id: "/pnr",
		path: "/pnr",
		getParentRoute: () => Route$7
	}),
	DisplayCodeRoute: Route$8.update({
		id: "/display/$code",
		path: "/display/$code",
		getParentRoute: () => Route$7
	}),
	StationCodeRoute: Route$9.update({
		id: "/station/$code",
		path: "/station/$code",
		getParentRoute: () => Route$7
	}),
	TrainNumberRoute: Route$10.update({
		id: "/train/$number",
		path: "/train/$number",
		getParentRoute: () => Route$7
	})
};
var routeTree = Route$7._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
