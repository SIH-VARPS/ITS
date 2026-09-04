import { s as confidenceTier } from "./ssr.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/EtaConfidenceBadge-YGVFEixA.js
var import_jsx_runtime = require_jsx_runtime();
function EtaConfidenceBadge({ confidence, className }) {
	const tier = confidenceTier(confidence);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1 rounded-full border border-border bg-secondary/50 px-1.5 py-0.5 text-xs font-semibold", tier.tone, className),
		title: `Prediction confidence: ${Math.round(confidence * 100)}%`,
		children: [
			tier.label,
			" · ",
			Math.round(confidence * 100),
			"%"
		]
	});
}
//#endregion
export { EtaConfidenceBadge as t };
