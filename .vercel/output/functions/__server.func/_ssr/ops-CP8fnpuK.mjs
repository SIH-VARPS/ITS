import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { d as SiteFooter, f as SiteHeader } from "./Sections-Cal2e0XI.mjs";
import { t as Toaster$1 } from "./sonner-DoFKumIW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ops-CP8fnpuK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function fmtTime(epochMs) {
	if (epochMs === null) return "never";
	return new Date(epochMs).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}
function OpsPage() {
	const [health, setHealth] = (0, import_react.useState)(null);
	const [metrics, setMetrics] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		async function load() {
			try {
				const [healthRes, metricsRes] = await Promise.all([fetch("/api/v2/health"), fetch("/api/v2/metrics")]);
				if (!healthRes.ok || !metricsRes.ok) throw new Error("ops endpoints unavailable");
				const healthJson = await healthRes.json();
				const metricsJson = await metricsRes.json();
				if (cancelled) return;
				setHealth(healthJson);
				setMetrics(metricsJson);
				setError(null);
			} catch (err) {
				if (!cancelled) setError(err instanceof Error ? err.message : "load failed");
			}
		}
		load();
		const timer = window.setInterval(() => void load(), 1e4);
		return () => {
			cancelled = true;
			window.clearInterval(timer);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-6xl px-4 py-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-3xl font-bold",
						children: "Ops"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Quota burn, cache hit ratio, live-feed tier mix, and harvest freshness."
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-destructive",
						children: error
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpsCard, {
								label: "Health",
								value: health?.status ?? "…",
								hint: health ? `store ${health.storeReachable ? "up" : "down"}` : "loading"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpsCard, {
								label: "Model",
								value: health ? health.modelLoaded ? health.modelVersion ?? "loaded" : "missing" : "…",
								hint: "artifact"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpsCard, {
								label: "Quota remaining",
								value: String(metrics?.quotaRemaining ?? health?.quotaRemaining ?? "…"),
								hint: `${metrics?.quotaUsed ?? 0} used`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpsCard, {
								label: "Last harvest",
								value: fmtTime(health?.lastHarvestAt ?? null),
								hint: "IST"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpsCard, {
								label: "Cache hit ratio",
								value: metrics ? `${Math.round(metrics.cacheHitRatio * 100)}%` : "…",
								hint: `${metrics?.vendorCalls ?? 0} vendor calls`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpsCard, {
								label: "ETA latency",
								value: metrics ? `${Math.round(metrics.etaLatencyP50Ms)} / ${Math.round(metrics.etaLatencyP95Ms)} ms` : "…",
								hint: "p50 / p95"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpsCard, {
								label: "Tier mix",
								value: metrics ? `A ${metrics.tierMix.railradar} · B ${metrics.tierMix.crowd} · C ${metrics.tierMix.replay}` : "…",
								hint: "railradar / crowd / replay"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpsCard, {
								label: "Predictions",
								value: String(metrics?.predictionVolume ?? 0),
								hint: metrics?.modelVersion ?? "no model"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {})
		]
	});
}
function OpsCard({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-4 shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-mono text-lg font-bold text-foreground",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: hint
			})
		]
	});
}
//#endregion
export { OpsPage as component };
