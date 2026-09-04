import { i as __toESM } from "../_runtime.mjs";
import { f as getTrain } from "./ssr.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as EtaConfidenceBadge } from "./EtaConfidenceBadge-YGVFEixA.mjs";
import { i as useEngineEta, r as formatIstClock, t as SourceTierBadge } from "./useEngineEta-DKZUWjOX.mjs";
import { t as Route } from "./display._code-CYO0ubHT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/display._code-DE4b_swb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StationDisplayBoard({ stationCode, entries, updatedAt, spotlight }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-black px-6 py-8 text-white",
		"data-testid": "station-display",
		"aria-label": `${stationCode} station display`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mb-8 flex flex-wrap items-end justify-between gap-4 border-b-4 border-white pb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-lg font-semibold tracking-[0.3em] uppercase text-white",
				children: "Station"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-mono text-6xl font-black tracking-tight text-white sm:text-7xl",
				children: stationCode
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xl font-semibold text-white",
				children: updatedAt > 0 ? new Date(updatedAt).toLocaleTimeString("en-IN", {
					timeZone: "Asia/Kolkata",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
					hour12: false
				}) : "LIVE"
			})]
		}), entries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-3xl font-semibold text-white",
			children: "No predicted arrivals."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full border-collapse text-left",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("caption", {
					className: "sr-only",
					children: ["Predicted arrivals at ", stationCode]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "text-lg font-bold tracking-widest uppercase text-white",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							scope: "col",
							className: "pb-4 pr-4",
							children: "Train"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							scope: "col",
							className: "pb-4 pr-4",
							children: "ETA"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							scope: "col",
							className: "pb-4 pr-4",
							children: "Band"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							scope: "col",
							className: "pb-4 pr-4",
							children: "Plat"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							scope: "col",
							className: "pb-4",
							children: "Source"
						})
					]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: entries.map((row) => {
					const isSpotlight = Boolean(spotlight && row.trainNo === spotlight.trainNo);
					const etaIso = isSpotlight && spotlight ? spotlight.eta : row.eta;
					const p50 = isSpotlight && spotlight ? spotlight.p50 : row.p50;
					const p90 = isSpotlight && spotlight ? spotlight.p90 : row.p90;
					const delayMin = isSpotlight && spotlight ? spotlight.delayMin : row.delayMin;
					const source = isSpotlight && spotlight ? spotlight.source : row.source;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-white/40",
						"data-train-no": row.trainNo,
						...isSpotlight && spotlight ? { "data-engine-eta": spotlight.eta } : {},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
								scope: "row",
								className: "py-5 pr-4 text-3xl font-black text-white sm:text-4xl",
								children: [row.trainNo, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 block text-xl font-semibold text-white",
									children: row.trainName
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-5 pr-4 font-mono text-4xl font-black text-white sm:text-5xl",
								children: formatIstClock(etaIso)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "py-5 pr-4 text-2xl font-semibold text-white",
								children: [
									formatIstClock(p50),
									"–",
									formatIstClock(p90),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 block text-base font-medium",
										children: delayMin >= 1 ? `+${delayMin} min` : "On time"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-5 pr-4 text-3xl font-black text-white",
								children: row.platform
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceTierBadge, {
										source,
										className: "border-white bg-white text-xs text-black"
									}), isSpotlight && spotlight ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EtaConfidenceBadge, {
										confidence: spotlight.confidence,
										className: "border-white bg-white text-black"
									}) : null]
								})
							})
						]
					}, row.trainNo);
				}) })
			]
		})]
	});
}
function StationDisplayPage() {
	const { code } = Route.useParams();
	const stationCode = code.toUpperCase();
	const { payload: spotlight } = useEngineEta("12951", stationCode);
	const [board, setBoard] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		let etag = null;
		async function tick() {
			const headers = {};
			if (etag) headers["If-None-Match"] = etag;
			const response = await fetch(`/api/v2/station/${encodeURIComponent(stationCode)}/board`, { headers });
			if (cancelled) return;
			const next = response.headers.get("etag");
			if (next) etag = next;
			if (response.status === 304) return;
			if (!response.ok) return;
			setBoard(await response.json());
		}
		tick();
		const id = window.setInterval(() => void tick(), 8e3);
		return () => {
			cancelled = true;
			window.clearInterval(id);
		};
	}, [stationCode]);
	const entries = (0, import_react.useMemo)(() => {
		const current = board?.entries ?? [];
		if (!spotlight) return current;
		if (current.some((row) => row.trainNo === spotlight.trainNo)) return current;
		const train = getTrain(spotlight.trainNo);
		return [{
			trainNo: spotlight.trainNo,
			trainName: train?.name || spotlight.trainNo,
			eta: spotlight.eta,
			p50: spotlight.p50,
			p80: spotlight.p80,
			p90: spotlight.p90,
			delayMin: spotlight.delayMin,
			platform: "—",
			source: spotlight.source
		}, ...current];
	}, [board, spotlight]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationDisplayBoard, {
		stationCode,
		entries,
		updatedAt: board?.updatedAt ?? 0,
		spotlight
	});
}
//#endregion
export { StationDisplayPage as component };
