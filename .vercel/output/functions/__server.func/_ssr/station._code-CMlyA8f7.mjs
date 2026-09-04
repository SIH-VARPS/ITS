import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { s as useTranslation } from "./rail-DWAKK18y.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { B as Clock, nt as ArrowDownUp, tt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { d as SiteFooter, f as SiteHeader } from "./Sections-Cal2e0XI.mjs";
import { t as Toaster$1 } from "./sonner-DoFKumIW.mjs";
import { t as EtaConfidenceBadge } from "./EtaConfidenceBadge-YGVFEixA.mjs";
import { t as DelayReasonTag } from "./DelayReasonTag-BJm5Y8qn.mjs";
import { t as Route } from "./station._code-BT2Jk_Ng.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/station._code-CMlyA8f7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StationBoard() {
	const { code, name } = Route.useLoaderData();
	const { t } = useTranslation();
	const [services, setServices] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		fetch(`/api/v1/station/${encodeURIComponent(code)}/board`).then((res) => res.json()).then((body) => {
			if (!cancelled) setServices(body.data?.services ?? []);
		}).catch(() => {
			if (!cancelled) setServices([]);
		});
		return () => {
			cancelled = true;
		};
	}, [code]);
	const arrivals = services.filter((r) => r.serviceType === "Arrival" || r.serviceType === "Terminal");
	const departures = services.filter((r) => r.serviceType === "Departure" || r.serviceType === "Arrival");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-5xl px-4 py-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }),
							" ",
							t("station.liveBoard")
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-baseline gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-3xl font-bold",
								children: name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-md border border-border bg-secondary/60 px-2.5 py-0.5 text-sm font-semibold text-muted-foreground",
								children: code
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: t("station.subtitle")
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid gap-6 lg:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardTable, {
							title: t("station.arrivals"),
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownUp, { className: "size-4" }),
							rows: arrivals
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardTable, {
							title: t("station.departures"),
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownUp, { className: "size-4" }),
							rows: departures
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {})
		]
	});
}
function BoardTable({ title, icon, rows }) {
	const { t } = useTranslation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "overflow-hidden rounded-2xl border border-border bg-card shadow-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 border-b border-border bg-subtle-gradient px-5 py-3",
			children: [
				icon,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "ml-auto size-4 text-muted-foreground" })
			]
		}), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-5 py-8 text-center text-sm text-muted-foreground",
			children: t("station.noServices")
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-border",
			children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "px-5 py-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/train/$number",
					params: { number: row.trainNumber },
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "block text-sm font-semibold",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: row.trainNumber
							}),
							" ",
							row.trainName
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full border border-border bg-secondary/50 px-1.5 py-0.5 text-[10px] font-semibold",
								children: row.serviceType
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("station.platform", { p: row.platform }) }),
							row.delayReason && row.delayMinutes > 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DelayReasonTag, { reason: row.delayReason })
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block text-sm font-semibold",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground line-through",
									children: row.scheduledTime
								}),
								" ",
								"→ ",
								row.predictedTime
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EtaConfidenceBadge, {
							confidence: row.confidencePercent / 100,
							className: "mt-1"
						})]
					})]
				})
			}, `${row.trainNumber}-${row.serviceType}`))
		})]
	});
}
//#endregion
export { StationBoard as component };
