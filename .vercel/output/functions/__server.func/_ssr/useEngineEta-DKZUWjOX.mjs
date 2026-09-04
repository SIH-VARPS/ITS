import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useEngineEta-DKZUWjOX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function formatIstClock(iso) {
	return new Date(iso).toLocaleTimeString("en-IN", {
		timeZone: "Asia/Kolkata",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false
	});
}
/** Symmetric lower band around p50 using the p80 width; always lower ≤ eta ≤ upper. */
function etaBandBounds(payload) {
	const etaMs = Date.parse(payload.eta);
	const p50 = Date.parse(payload.p50);
	const p80 = Date.parse(payload.p80);
	const p90 = Date.parse(payload.p90);
	let lowerMs = p50 - Math.max(0, p80 - p50);
	const upperMs = p90;
	if (lowerMs > etaMs) lowerMs = Math.min(etaMs, p50);
	if (lowerMs > etaMs) lowerMs = etaMs;
	return {
		lowerEta: new Date(lowerMs).toISOString(),
		eta: payload.eta,
		upperEta: new Date(upperMs).toISOString()
	};
}
var LABELS = {
	railradar: "Vendor",
	crowd: "Crowd",
	replay: "Replay"
};
function SourceTierBadge({ source, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide", source === "railradar" && "border-sky-500/40 bg-sky-500/15 text-sky-800 dark:text-sky-200", source === "crowd" && "border-amber-500/40 bg-amber-500/15 text-amber-900 dark:text-amber-200", source === "replay" && "border-border bg-secondary/60 text-muted-foreground", className),
		"data-source-tier": source,
		children: LABELS[source]
	});
}
function useEngineEta(trainNo, station, intervalMs = 3e3) {
	const [payload, setPayload] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const etagRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const url = `/api/v2/events?train=${encodeURIComponent(trainNo)}&station=${encodeURIComponent(station)}`;
		async function tick() {
			try {
				const headers = {};
				if (etagRef.current) headers["If-None-Match"] = etagRef.current;
				const response = await fetch(url, { headers });
				if (cancelled) return;
				const nextTag = response.headers.get("etag");
				if (nextTag) etagRef.current = nextTag;
				if (response.status === 304) return;
				if (!response.ok) {
					setError(`ETA ${response.status}`);
					return;
				}
				const body = await response.json();
				setPayload(body);
				setError(null);
			} catch (err) {
				if (!cancelled) setError(err instanceof Error ? err.message : "ETA fetch failed");
			}
		}
		tick();
		const id = window.setInterval(() => void tick(), intervalMs);
		return () => {
			cancelled = true;
			window.clearInterval(id);
		};
	}, [
		trainNo,
		station,
		intervalMs
	]);
	return {
		payload,
		error
	};
}
//#endregion
export { useEngineEta as i, etaBandBounds as n, formatIstClock as r, SourceTierBadge as t };
