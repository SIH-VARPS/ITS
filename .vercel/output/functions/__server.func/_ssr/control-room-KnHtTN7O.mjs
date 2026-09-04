import { i as __toESM } from "../_runtime.mjs";
import { S as updateFromResiduals, _ as resetResidualTable, a as applyCorrection, f as getTrain, n as FEATURE_ORDER, o as computeLiveStatus, r as REFINE_POLICY, t as DELAY_REASONS, x as trainRoutes } from "./ssr.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { s as useTranslation } from "./rail-DWAKK18y.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { $ as ArrowUpDown, G as ChevronUp, J as Check, U as CirclePause, W as CircleCheck, Y as ChartLine, Z as Building2, a as TrendingDown, c as SquareSplitVertical, f as ShieldCheck, i as TrendingUp, it as Activity, j as Gauge, l as Sparkles, m as Search, q as ChevronDown, r as TriangleAlert, t as X, v as RotateCcw, z as CloudRain } from "../_libs/lucide-react.mjs";
import { d as SiteFooter, f as SiteHeader } from "./Sections-Cal2e0XI.mjs";
import { t as Toaster$1 } from "./sonner-DoFKumIW.mjs";
import { t as useLiveClock } from "./useLiveClock-ZsXIJzCR.mjs";
import { t as EtaConfidenceBadge } from "./EtaConfidenceBadge-YGVFEixA.mjs";
import { t as DelayReasonTag } from "./DelayReasonTag-BJm5Y8qn.mjs";
import { i as useEngineEta, r as formatIstClock, t as SourceTierBadge } from "./useEngineEta-DKZUWjOX.mjs";
import { a as Line, c as Cell, d as Legend, i as XAxis, l as ResponsiveContainer, n as LineChart, o as CartesianGrid, r as YAxis, s as Bar, t as BarChart, u as Tooltip } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/control-room-KnHtTN7O.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var report_default = {
	generatedAt: "2026-03-15T00:00:00.000Z",
	seed: 20260315,
	foldCount: 3,
	modelVersion: "1.0.0",
	folds: [
		{
			"id": 0,
			"trainCutoff": "2026-01-17",
			"trainRunCount": 96,
			"testRunCount": 72,
			"trainKeys": [],
			"testKeys": []
		},
		{
			"id": 1,
			"trainCutoff": "2026-01-26",
			"trainRunCount": 168,
			"testRunCount": 48,
			"trainKeys": [],
			"testKeys": []
		},
		{
			"id": 2,
			"trainCutoff": "2026-02-01",
			"trainRunCount": 216,
			"testRunCount": 34,
			"trainKeys": [],
			"testKeys": []
		}
	],
	synthetic: /* @__PURE__ */ JSON.parse("{\"n\":3360,\"horizons\":{\"next\":{\"n\":1152,\"model\":{\"mae\":11.182978,\"medae\":6.177015,\"rmse\":18.199137},\"baselineA\":{\"mae\":22.218246,\"medae\":15.259664,\"rmse\":31.673414},\"baselineB\":{\"mae\":11.608748,\"medae\":5.726447,\"rmse\":19.642715},\"baselineC\":{\"mae\":10.96504,\"medae\":5.133762,\"rmse\":19.00216},\"improvementVsBPct\":3.667665,\"calibration\":{\"p80Coverage\":0.833333,\"p10Coverage\":0.793403,\"reliability\":[{\"bin\":\"0–5\",\"predictedMean\":3.521383,\"observedMean\":7.660228,\"n\":153},{\"bin\":\"5–15\",\"predictedMean\":9.492746,\"observedMean\":12.035659,\"n\":387},{\"bin\":\"15–30\",\"predictedMean\":21.3505,\"observedMean\":21.892348,\"n\":306},{\"bin\":\"30–60\",\"predictedMean\":41.826845,\"observedMean\":38.222668,\"n\":235},{\"bin\":\"60+\",\"predictedMean\":75.151137,\"observedMean\":57.524215,\"n\":71}]},\"breakdowns\":{\"zone\":[{\"key\":\"CR\",\"n\":240,\"mae\":11.999444,\"medae\":6.438808,\"rmse\":18.495308},{\"key\":\"KR\",\"n\":12,\"mae\":2.532668,\"medae\":2.481311,\"rmse\":3.188559},{\"key\":\"NFR\",\"n\":108,\"mae\":4.571616,\"medae\":4.604934,\"rmse\":5.344345},{\"key\":\"NR\",\"n\":108,\"mae\":11.450996,\"medae\":8.643213,\"rmse\":15.29746},{\"key\":\"SR\",\"n\":126,\"mae\":7.645066,\"medae\":4.622242,\"rmse\":11.856408},{\"key\":\"SWR\",\"n\":132,\"mae\":18.290256,\"medae\":13.814307,\"rmse\":24.807243},{\"key\":\"UNZ\",\"n\":390,\"mae\":11.762179,\"medae\":5.884186,\"rmse\":20.806469},{\"key\":\"WR\",\"n\":36,\"mae\":7.701342,\"medae\":6.633773,\"rmse\":9.419621}],\"trainClass\":[{\"key\":\"Express\",\"n\":1152,\"mae\":11.182978,\"medae\":6.177015,\"rmse\":18.199137}],\"hour\":[{\"key\":\"0\",\"n\":55,\"mae\":10.07274,\"medae\":6.596095,\"rmse\":14.206707},{\"key\":\"1\",\"n\":55,\"mae\":12.502162,\"medae\":5.461378,\"rmse\":20.927837},{\"key\":\"10\",\"n\":57,\"mae\":9.709623,\"medae\":5.059559,\"rmse\":15.435833},{\"key\":\"11\",\"n\":72,\"mae\":15.832948,\"medae\":5.356658,\"rmse\":30.029105},{\"key\":\"12\",\"n\":30,\"mae\":5.944566,\"medae\":4.55534,\"rmse\":7.502864},{\"key\":\"13\",\"n\":38,\"mae\":5.931777,\"medae\":4.816052,\"rmse\":7.731527},{\"key\":\"14\",\"n\":30,\"mae\":8.585938,\"medae\":7.045006,\"rmse\":10.886555},{\"key\":\"15\",\"n\":62,\"mae\":12.848143,\"medae\":6.735159,\"rmse\":18.679934},{\"key\":\"16\",\"n\":42,\"mae\":7.696016,\"medae\":4.649889,\"rmse\":11.58215},{\"key\":\"17\",\"n\":47,\"mae\":10.392409,\"medae\":7.271681,\"rmse\":13.027659},{\"key\":\"18\",\"n\":48,\"mae\":8.93424,\"medae\":5.651995,\"rmse\":12.18912},{\"key\":\"19\",\"n\":39,\"mae\":8.330236,\"medae\":7.29542,\"rmse\":11.00321},{\"key\":\"2\",\"n\":41,\"mae\":11.682108,\"medae\":6.892033,\"rmse\":15.73538},{\"key\":\"20\",\"n\":55,\"mae\":8.798734,\"medae\":5.800344,\"rmse\":12.019169},{\"key\":\"21\",\"n\":50,\"mae\":6.729182,\"medae\":5.756445,\"rmse\":8.898616},{\"key\":\"22\",\"n\":48,\"mae\":10.812812,\"medae\":5.983534,\"rmse\":16.193647},{\"key\":\"23\",\"n\":51,\"mae\":15.772634,\"medae\":5.452566,\"rmse\":24.515131},{\"key\":\"3\",\"n\":56,\"mae\":10.315837,\"medae\":7.896608,\"rmse\":13.54677},{\"key\":\"4\",\"n\":31,\"mae\":25.888675,\"medae\":6.939291,\"rmse\":42.11564},{\"key\":\"5\",\"n\":48,\"mae\":13.010762,\"medae\":6.2849,\"rmse\":22.686957},{\"key\":\"6\",\"n\":64,\"mae\":14.611238,\"medae\":9.656309,\"rmse\":20.866369},{\"key\":\"7\",\"n\":33,\"mae\":12.240214,\"medae\":7.846476,\"rmse\":17.204396},{\"key\":\"8\",\"n\":40,\"mae\":12.74485,\"medae\":8.103322,\"rmse\":17.320615},{\"key\":\"9\",\"n\":60,\"mae\":7.467939,\"medae\":4.48006,\"rmse\":11.794013}],\"dayOfJourney\":[{\"key\":\"1\",\"n\":954,\"mae\":10.837612,\"medae\":6.114897,\"rmse\":17.810102},{\"key\":\"2\",\"n\":192,\"mae\":13.001932,\"medae\":6.590849,\"rmse\":20.223295},{\"key\":\"3\",\"n\":6,\"mae\":7.889668,\"medae\":9.35477,\"rmse\":8.359238}],\"delayMagnitude\":[{\"key\":\"moderate\",\"n\":584,\"mae\":8.516474,\"medae\":4.825863,\"rmse\":13.605314},{\"key\":\"on-time\",\"n\":266,\"mae\":7.285454,\"medae\":5.179917,\"rmse\":10.48274},{\"key\":\"severe\",\"n\":302,\"mae\":19.772315,\"medae\":14.1777,\"rmse\":28.43728}]}},\"plus3h\":{\"n\":1056,\"model\":{\"mae\":22.386996,\"medae\":16.060671,\"rmse\":30.202682},\"baselineA\":{\"mae\":23.27221,\"medae\":17.044802,\"rmse\":32.492705},\"baselineB\":{\"mae\":18.366534,\"medae\":11.611989,\"rmse\":27.002789},\"baselineC\":{\"mae\":15.880645,\"medae\":8.850196,\"rmse\":24.824181},\"improvementVsBPct\":-21.890151,\"calibration\":{\"p80Coverage\":0.922348,\"p10Coverage\":0.887311,\"reliability\":[{\"bin\":\"0–5\",\"predictedMean\":2.86039,\"observedMean\":20.472068,\"n\":35},{\"bin\":\"5–15\",\"predictedMean\":10.882461,\"observedMean\":19.521516,\"n\":203},{\"bin\":\"15–30\",\"predictedMean\":21.553141,\"observedMean\":16.459004,\"n\":370},{\"bin\":\"30–60\",\"predictedMean\":40.978523,\"observedMean\":26.20322,\"n\":264},{\"bin\":\"60+\",\"predictedMean\":61.58456,\"observedMean\":37.437944,\"n\":184}]},\"breakdowns\":{\"zone\":[{\"key\":\"CR\",\"n\":222,\"mae\":23.287083,\"medae\":17.369701,\"rmse\":31.076307},{\"key\":\"KR\",\"n\":12,\"mae\":8.487511,\"medae\":8.853844,\"rmse\":9.106157},{\"key\":\"NFR\",\"n\":96,\"mae\":10.340855,\"medae\":9.814613,\"rmse\":11.628556},{\"key\":\"NR\",\"n\":96,\"mae\":27.287543,\"medae\":23.518235,\"rmse\":33.920423},{\"key\":\"SR\",\"n\":120,\"mae\":16.679599,\"medae\":13.676842,\"rmse\":21.992593},{\"key\":\"SWR\",\"n\":132,\"mae\":30.482424,\"medae\":28.92941,\"rmse\":37.449409},{\"key\":\"UNZ\",\"n\":354,\"mae\":24.117323,\"medae\":17.546514,\"rmse\":32.735527},{\"key\":\"WR\",\"n\":24,\"mae\":8.083142,\"medae\":8.300269,\"rmse\":8.993212}],\"trainClass\":[{\"key\":\"Express\",\"n\":1056,\"mae\":22.386996,\"medae\":16.060671,\"rmse\":30.202682}],\"hour\":[{\"key\":\"0\",\"n\":50,\"mae\":20.176388,\"medae\":17.362007,\"rmse\":24.329496},{\"key\":\"1\",\"n\":54,\"mae\":18.151637,\"medae\":8.513275,\"rmse\":25.847463},{\"key\":\"10\",\"n\":51,\"mae\":14.431494,\"medae\":11.133633,\"rmse\":19.576743},{\"key\":\"11\",\"n\":60,\"mae\":22.29294,\"medae\":14.366925,\"rmse\":34.573206},{\"key\":\"12\",\"n\":30,\"mae\":19.889088,\"medae\":17.257818,\"rmse\":23.457605},{\"key\":\"13\",\"n\":38,\"mae\":18.741619,\"medae\":14.208682,\"rmse\":25.087124},{\"key\":\"14\",\"n\":30,\"mae\":27.280905,\"medae\":24.385434,\"rmse\":34.296749},{\"key\":\"15\",\"n\":62,\"mae\":23.341352,\"medae\":19.319329,\"rmse\":30.079877},{\"key\":\"16\",\"n\":42,\"mae\":27.181042,\"medae\":15.230747,\"rmse\":35.004027},{\"key\":\"17\",\"n\":47,\"mae\":18.938545,\"medae\":17.008142,\"rmse\":23.663231},{\"key\":\"18\",\"n\":33,\"mae\":21.95445,\"medae\":14.120082,\"rmse\":28.515421},{\"key\":\"19\",\"n\":36,\"mae\":15.861134,\"medae\":13.056579,\"rmse\":19.289189},{\"key\":\"2\",\"n\":32,\"mae\":37.197248,\"medae\":32.02369,\"rmse\":45.940759},{\"key\":\"20\",\"n\":50,\"mae\":25.068341,\"medae\":16.977391,\"rmse\":30.328697},{\"key\":\"21\",\"n\":49,\"mae\":23.117152,\"medae\":16.471414,\"rmse\":29.46746},{\"key\":\"22\",\"n\":48,\"mae\":17.514775,\"medae\":17.923215,\"rmse\":20.717709},{\"key\":\"23\",\"n\":51,\"mae\":25.933429,\"medae\":18.346237,\"rmse\":34.083316},{\"key\":\"3\",\"n\":53,\"mae\":24.440969,\"medae\":18.675796,\"rmse\":31.830675},{\"key\":\"4\",\"n\":22,\"mae\":37.600363,\"medae\":20.094139,\"rmse\":51.215016},{\"key\":\"5\",\"n\":30,\"mae\":25.369657,\"medae\":16.497392,\"rmse\":33.748427},{\"key\":\"6\",\"n\":59,\"mae\":18.77387,\"medae\":11.266547,\"rmse\":28.867489},{\"key\":\"7\",\"n\":29,\"mae\":32.43102,\"medae\":30.708585,\"rmse\":38.165931},{\"key\":\"8\",\"n\":40,\"mae\":22.118882,\"medae\":18.777943,\"rmse\":29.36572},{\"key\":\"9\",\"n\":60,\"mae\":18.667561,\"medae\":12.517495,\"rmse\":28.615225}],\"dayOfJourney\":[{\"key\":\"1\",\"n\":918,\"mae\":21.936527,\"medae\":15.991887,\"rmse\":29.586773},{\"key\":\"2\",\"n\":138,\"mae\":25.383593,\"medae\":16.664609,\"rmse\":34.017161}],\"delayMagnitude\":[{\"key\":\"moderate\",\"n\":521,\"mae\":18.136525,\"medae\":13.241277,\"rmse\":25.077708},{\"key\":\"on-time\",\"n\":226,\"mae\":18.072664,\"medae\":15.303647,\"rmse\":22.823117},{\"key\":\"severe\",\"n\":309,\"mae\":32.709115,\"medae\":28.501047,\"rmse\":40.940033}]}},\"destination\":{\"n\":1152,\"model\":{\"mae\":52.761361,\"medae\":44.228544,\"rmse\":67.905019},\"baselineA\":{\"mae\":23.452465,\"medae\":15.208239,\"rmse\":33.729027},\"baselineB\":{\"mae\":21.612506,\"medae\":12.898119,\"rmse\":31.932311},\"baselineC\":{\"mae\":19.015361,\"medae\":11.564637,\"rmse\":28.485815},\"improvementVsBPct\":-144.124217,\"calibration\":{\"p80Coverage\":0.975694,\"p10Coverage\":0.930556,\"reliability\":[{\"bin\":\"0–5\",\"predictedMean\":2.977913,\"observedMean\":25.966509,\"n\":33},{\"bin\":\"5–15\",\"predictedMean\":9.908722,\"observedMean\":20.601145,\"n\":130},{\"bin\":\"15–30\",\"predictedMean\":22.811741,\"observedMean\":17.779843,\"n\":129},{\"bin\":\"30–60\",\"predictedMean\":44.817853,\"observedMean\":25.418841,\"n\":238},{\"bin\":\"60+\",\"predictedMean\":95.249643,\"observedMean\":24.339088,\"n\":622}]},\"breakdowns\":{\"zone\":[{\"key\":\"CR\",\"n\":240,\"mae\":50.353371,\"medae\":47.374758,\"rmse\":61.383624},{\"key\":\"KR\",\"n\":12,\"mae\":8.487511,\"medae\":8.853844,\"rmse\":9.106157},{\"key\":\"NFR\",\"n\":108,\"mae\":60.079141,\"medae\":59.095696,\"rmse\":70.264882},{\"key\":\"NR\",\"n\":108,\"mae\":71.712034,\"medae\":73.291927,\"rmse\":77.026396},{\"key\":\"SR\",\"n\":126,\"mae\":49.453794,\"medae\":38.599064,\"rmse\":64.189135},{\"key\":\"SWR\",\"n\":132,\"mae\":46.424072,\"medae\":34.295675,\"rmse\":61.949372},{\"key\":\"UNZ\",\"n\":390,\"mae\":55.187106,\"medae\":37.384422,\"rmse\":75.050389},{\"key\":\"WR\",\"n\":36,\"mae\":13.301512,\"medae\":10.486748,\"rmse\":16.883373}],\"trainClass\":[{\"key\":\"Express\",\"n\":1152,\"mae\":52.761361,\"medae\":44.228544,\"rmse\":67.905019}],\"hour\":[{\"key\":\"0\",\"n\":55,\"mae\":60.088184,\"medae\":41.153973,\"rmse\":76.349544},{\"key\":\"1\",\"n\":55,\"mae\":81.020057,\"medae\":79.344682,\"rmse\":96.324801},{\"key\":\"10\",\"n\":57,\"mae\":45.069299,\"medae\":25.93574,\"rmse\":61.578831},{\"key\":\"11\",\"n\":72,\"mae\":51.887503,\"medae\":45.186994,\"rmse\":70.113449},{\"key\":\"12\",\"n\":30,\"mae\":64.087089,\"medae\":56.172666,\"rmse\":70.350514},{\"key\":\"13\",\"n\":38,\"mae\":45.59549,\"medae\":29.466635,\"rmse\":59.399972},{\"key\":\"14\",\"n\":30,\"mae\":50.463375,\"medae\":31.944893,\"rmse\":65.846743},{\"key\":\"15\",\"n\":62,\"mae\":39.792517,\"medae\":39.87227,\"rmse\":48.727738},{\"key\":\"16\",\"n\":42,\"mae\":42.778061,\"medae\":30.088476,\"rmse\":55.048098},{\"key\":\"17\",\"n\":47,\"mae\":42.004766,\"medae\":38.905633,\"rmse\":53.541527},{\"key\":\"18\",\"n\":48,\"mae\":42.152779,\"medae\":34.813213,\"rmse\":53.922651},{\"key\":\"19\",\"n\":39,\"mae\":35.473498,\"medae\":33.634266,\"rmse\":41.258771},{\"key\":\"2\",\"n\":41,\"mae\":41.112858,\"medae\":31.174701,\"rmse\":53.30978},{\"key\":\"20\",\"n\":55,\"mae\":44.255805,\"medae\":34.151627,\"rmse\":58.651417},{\"key\":\"21\",\"n\":50,\"mae\":51.82108,\"medae\":30.488876,\"rmse\":67.004006},{\"key\":\"22\",\"n\":48,\"mae\":58.641055,\"medae\":63.176352,\"rmse\":66.841629},{\"key\":\"23\",\"n\":51,\"mae\":66.519871,\"medae\":52.409404,\"rmse\":83.728308},{\"key\":\"3\",\"n\":56,\"mae\":60.510116,\"medae\":55.811656,\"rmse\":73.065886},{\"key\":\"4\",\"n\":31,\"mae\":54.827496,\"medae\":39.657484,\"rmse\":74.52145},{\"key\":\"5\",\"n\":48,\"mae\":48.54041,\"medae\":54.819331,\"rmse\":59.587528},{\"key\":\"6\",\"n\":64,\"mae\":45.948246,\"medae\":30.636205,\"rmse\":61.065371},{\"key\":\"7\",\"n\":33,\"mae\":72.852207,\"medae\":68.455002,\"rmse\":89.258875},{\"key\":\"8\",\"n\":40,\"mae\":52.898935,\"medae\":28.009291,\"rmse\":73.87131},{\"key\":\"9\",\"n\":60,\"mae\":68.405698,\"medae\":61.829445,\"rmse\":83.624241}],\"dayOfJourney\":[{\"key\":\"1\",\"n\":954,\"mae\":57.848904,\"medae\":51.363716,\"rmse\":72.811811},{\"key\":\"2\",\"n\":192,\"mae\":27.599371,\"medae\":22.842291,\"rmse\":35.31068},{\"key\":\"3\",\"n\":6,\"mae\":49.025592,\"medae\":45.613544,\"rmse\":49.825359}],\"delayMagnitude\":[{\"key\":\"moderate\",\"n\":506,\"mae\":57.566621,\"medae\":48.413577,\"rmse\":74.225631},{\"key\":\"on-time\",\"n\":268,\"mae\":57.511927,\"medae\":49.054852,\"rmse\":73.531432},{\"key\":\"severe\",\"n\":378,\"mae\":42.960796,\"medae\":37.528164,\"rmse\":53.332272}]}}},\"worst100\":[{\"trainNo\":\"11027\",\"runDate\":\"2026-02-01\",\"horizon\":\"destination\",\"currentHaltIndex\":12,\"targetHaltIndex\":51,\"actualDelayMin\":6.903313,\"predictedP50Min\":243.436466,\"absErrorMin\":236.533153,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":78.351307,\"dayOfJourney\":1,\"dayOfWeek\":1,\"delayTrendMin\":44.867939,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":9,\"remainingHalts\":39,\"remainingKm\":887,\"season\":1,\"sectionMeanRunMin\":23,\"sectionP80RunMin\":49,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12245\",\"runDate\":\"2026-01-20\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":5,\"actualDelayMin\":209.97393,\"predictedP50Min\":-6.157064,\"absErrorMin\":216.130994,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":12.900153,\"dayOfJourney\":1,\"dayOfWeek\":2,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":11,\"remainingHalts\":5,\"remainingKm\":1957,\"season\":1,\"sectionMeanRunMin\":355,\"sectionP80RunMin\":355,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-20\",\"horizon\":\"destination\",\"currentHaltIndex\":12,\"targetHaltIndex\":51,\"actualDelayMin\":17.182969,\"predictedP50Min\":230.361994,\"absErrorMin\":213.179025,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":65.276834,\"dayOfJourney\":1,\"dayOfWeek\":3,\"delayTrendMin\":37.892689,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":9,\"remainingHalts\":39,\"remainingKm\":887,\"season\":1,\"sectionMeanRunMin\":23,\"sectionP80RunMin\":49,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-29\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":51,\"actualDelayMin\":0,\"predictedP50Min\":212.990354,\"absErrorMin\":212.990354,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":14.734432,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":14.734432,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":1,\"remainingHalts\":48,\"remainingKm\":1182,\"season\":1,\"sectionMeanRunMin\":44,\"sectionP80RunMin\":47,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-29\",\"horizon\":\"destination\",\"currentHaltIndex\":9,\"targetHaltIndex\":51,\"actualDelayMin\":0,\"predictedP50Min\":209.453897,\"absErrorMin\":209.453897,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":52.774951,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":28.623852,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":7,\"remainingHalts\":42,\"remainingKm\":938,\"season\":1,\"sectionMeanRunMin\":18,\"sectionP80RunMin\":23,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-23\",\"horizon\":\"destination\",\"currentHaltIndex\":12,\"targetHaltIndex\":51,\"actualDelayMin\":28.12751,\"predictedP50Min\":230.184037,\"absErrorMin\":202.056527,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":65.098877,\"dayOfJourney\":1,\"dayOfWeek\":6,\"delayTrendMin\":2.681264,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":9,\"remainingHalts\":39,\"remainingKm\":887,\"season\":1,\"sectionMeanRunMin\":23,\"sectionP80RunMin\":49,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12245\",\"runDate\":\"2026-01-20\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":5,\"actualDelayMin\":209.97393,\"predictedP50Min\":8.194409,\"absErrorMin\":201.779521,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":6.828499,\"dayOfJourney\":1,\"dayOfWeek\":3,\"delayTrendMin\":-6.071654,\"downstreamOccupancy\":1,\"dwellOverrunMin\":0,\"hourOfDay\":4,\"remainingHalts\":2,\"remainingKm\":736,\"season\":1,\"sectionMeanRunMin\":370,\"sectionP80RunMin\":395,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-23\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":51,\"actualDelayMin\":28.12751,\"predictedP50Min\":225.962975,\"absErrorMin\":197.835465,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":27.707054,\"dayOfJourney\":1,\"dayOfWeek\":6,\"delayTrendMin\":27.707054,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":1,\"remainingHalts\":48,\"remainingKm\":1182,\"season\":1,\"sectionMeanRunMin\":44,\"sectionP80RunMin\":47,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-02-01\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":51,\"actualDelayMin\":6.903313,\"predictedP50Min\":204.300765,\"absErrorMin\":197.397452,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":6.044843,\"dayOfJourney\":1,\"dayOfWeek\":1,\"delayTrendMin\":6.044843,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":1,\"remainingHalts\":48,\"remainingKm\":1182,\"season\":1,\"sectionMeanRunMin\":44,\"sectionP80RunMin\":47,\"speedDeviationKmph\":0,\"weatherCode\":61}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-20\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":51,\"actualDelayMin\":17.182969,\"predictedP50Min\":213.666345,\"absErrorMin\":196.483377,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":15.410424,\"dayOfJourney\":1,\"dayOfWeek\":3,\"delayTrendMin\":14.791548,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":1,\"remainingHalts\":48,\"remainingKm\":1182,\"season\":1,\"sectionMeanRunMin\":44,\"sectionP80RunMin\":47,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-23\",\"horizon\":\"destination\",\"currentHaltIndex\":9,\"targetHaltIndex\":51,\"actualDelayMin\":28.12751,\"predictedP50Min\":219.096559,\"absErrorMin\":190.969049,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":62.417613,\"dayOfJourney\":1,\"dayOfWeek\":6,\"delayTrendMin\":29.153486,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":7,\"remainingHalts\":42,\"remainingKm\":938,\"season\":1,\"sectionMeanRunMin\":18,\"sectionP80RunMin\":23,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-02-01\",\"horizon\":\"destination\",\"currentHaltIndex\":9,\"targetHaltIndex\":51,\"actualDelayMin\":6.903313,\"predictedP50Min\":190.162313,\"absErrorMin\":183.259,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":33.483367,\"dayOfJourney\":1,\"dayOfWeek\":1,\"delayTrendMin\":12.161379,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":7,\"remainingHalts\":42,\"remainingKm\":938,\"season\":1,\"sectionMeanRunMin\":18,\"sectionP80RunMin\":23,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-17\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":51,\"actualDelayMin\":25.639688,\"predictedP50Min\":206.597643,\"absErrorMin\":180.957954,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":8.341721,\"dayOfJourney\":1,\"dayOfWeek\":0,\"delayTrendMin\":4.836807,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":1,\"remainingHalts\":48,\"remainingKm\":1182,\"season\":1,\"sectionMeanRunMin\":44,\"sectionP80RunMin\":47,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-20\",\"horizon\":\"destination\",\"currentHaltIndex\":15,\"targetHaltIndex\":51,\"actualDelayMin\":17.182969,\"predictedP50Min\":191.182739,\"absErrorMin\":173.999771,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":91.262162,\"dayOfJourney\":1,\"dayOfWeek\":3,\"delayTrendMin\":25.985328,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":11,\"remainingHalts\":36,\"remainingKm\":809,\"season\":1,\"sectionMeanRunMin\":20,\"sectionP80RunMin\":20,\"speedDeviationKmph\":0,\"weatherCode\":61}},{\"trainNo\":\"11027\",\"runDate\":\"2026-02-01\",\"horizon\":\"destination\",\"currentHaltIndex\":15,\"targetHaltIndex\":51,\"actualDelayMin\":6.903313,\"predictedP50Min\":178.733325,\"absErrorMin\":171.830012,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":78.812748,\"dayOfJourney\":1,\"dayOfWeek\":1,\"delayTrendMin\":0.461442,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":11,\"remainingHalts\":36,\"remainingKm\":809,\"season\":1,\"sectionMeanRunMin\":20,\"sectionP80RunMin\":20,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-29\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":51,\"actualDelayMin\":0,\"predictedP50Min\":170.201368,\"absErrorMin\":170.201368,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":24.151099,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":9.416667,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":3,\"remainingHalts\":45,\"remainingKm\":1090,\"season\":1,\"sectionMeanRunMin\":75,\"sectionP80RunMin\":80,\"speedDeviationKmph\":0,\"weatherCode\":61}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-17\",\"horizon\":\"destination\",\"currentHaltIndex\":9,\"targetHaltIndex\":51,\"actualDelayMin\":25.639688,\"predictedP50Min\":195.637762,\"absErrorMin\":169.998073,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":38.958816,\"dayOfJourney\":1,\"dayOfWeek\":0,\"delayTrendMin\":26.179842,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":7,\"remainingHalts\":42,\"remainingKm\":938,\"season\":1,\"sectionMeanRunMin\":18,\"sectionP80RunMin\":23,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-29\",\"horizon\":\"destination\",\"currentHaltIndex\":12,\"targetHaltIndex\":51,\"actualDelayMin\":0,\"predictedP50Min\":168.228681,\"absErrorMin\":168.228681,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":3.708998,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-49.065954,\"downstreamOccupancy\":1,\"dwellOverrunMin\":0,\"hourOfDay\":8,\"remainingHalts\":39,\"remainingKm\":887,\"season\":1,\"sectionMeanRunMin\":23,\"sectionP80RunMin\":49,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-29\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":51,\"actualDelayMin\":0,\"predictedP50Min\":167.203885,\"absErrorMin\":167.203885,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":23,\"remainingHalts\":51,\"remainingKm\":1281,\"season\":1,\"sectionMeanRunMin\":12,\"sectionP80RunMin\":12,\"speedDeviationKmph\":0,\"weatherCode\":45}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-20\",\"horizon\":\"destination\",\"currentHaltIndex\":9,\"targetHaltIndex\":51,\"actualDelayMin\":17.182969,\"predictedP50Min\":183.647058,\"absErrorMin\":166.464089,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":27.384145,\"dayOfJourney\":1,\"dayOfWeek\":3,\"delayTrendMin\":7.135292,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":6,\"remainingHalts\":42,\"remainingKm\":938,\"season\":1,\"sectionMeanRunMin\":18,\"sectionP80RunMin\":23,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11013\",\"runDate\":\"2026-01-26\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":33,\"actualDelayMin\":0.509339,\"predictedP50Min\":166.069507,\"absErrorMin\":165.560168,\"provenance\":\"synthetic\",\"zone\":\"SWR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":79.069799,\"dayOfJourney\":1,\"dayOfWeek\":2,\"delayTrendMin\":79.069799,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":8,\"remainingHalts\":27,\"remainingKm\":1011,\"season\":1,\"sectionMeanRunMin\":23,\"sectionP80RunMin\":28,\"speedDeviationKmph\":0,\"weatherCode\":61}},{\"trainNo\":\"11013\",\"runDate\":\"2026-01-20\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":33,\"actualDelayMin\":12.311981,\"predictedP50Min\":176.949942,\"absErrorMin\":164.637961,\"provenance\":\"synthetic\",\"zone\":\"SWR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":89.667496,\"dayOfJourney\":1,\"dayOfWeek\":3,\"delayTrendMin\":86.738727,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":9,\"remainingHalts\":27,\"remainingKm\":1011,\"season\":1,\"sectionMeanRunMin\":23,\"sectionP80RunMin\":28,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-02-01\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":51,\"actualDelayMin\":6.903313,\"predictedP50Min\":167.372257,\"absErrorMin\":160.468944,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":21.321989,\"dayOfJourney\":1,\"dayOfWeek\":1,\"delayTrendMin\":15.277145,\"downstreamOccupancy\":1,\"dwellOverrunMin\":0,\"hourOfDay\":3,\"remainingHalts\":45,\"remainingKm\":1090,\"season\":1,\"sectionMeanRunMin\":75,\"sectionP80RunMin\":80,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-02-01\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":51,\"actualDelayMin\":6.903313,\"predictedP50Min\":167.203885,\"absErrorMin\":160.300572,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":0,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":23,\"remainingHalts\":51,\"remainingKm\":1281,\"season\":1,\"sectionMeanRunMin\":12,\"sectionP80RunMin\":12,\"speedDeviationKmph\":0,\"weatherCode\":61}},{\"trainNo\":\"12201\",\"runDate\":\"2026-01-29\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":24,\"actualDelayMin\":0,\"predictedP50Min\":158.834614,\"absErrorMin\":158.834614,\"provenance\":\"synthetic\",\"zone\":\"CR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":94.967131,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":90.212737,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":0,\"remainingHalts\":21,\"remainingKm\":1178,\"season\":1,\"sectionMeanRunMin\":116,\"sectionP80RunMin\":176,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-17\",\"horizon\":\"destination\",\"currentHaltIndex\":12,\"targetHaltIndex\":51,\"actualDelayMin\":25.639688,\"predictedP50Min\":181.157325,\"absErrorMin\":155.517637,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":16.637641,\"dayOfJourney\":1,\"dayOfWeek\":0,\"delayTrendMin\":-22.321175,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":8,\"remainingHalts\":39,\"remainingKm\":887,\"season\":1,\"sectionMeanRunMin\":23,\"sectionP80RunMin\":49,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-02-01\",\"horizon\":\"destination\",\"currentHaltIndex\":18,\"targetHaltIndex\":51,\"actualDelayMin\":6.903313,\"predictedP50Min\":162.326069,\"absErrorMin\":155.422756,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":70.604671,\"dayOfJourney\":1,\"dayOfWeek\":1,\"delayTrendMin\":-8.208077,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":12,\"remainingHalts\":33,\"remainingKm\":738,\"season\":1,\"sectionMeanRunMin\":35,\"sectionP80RunMin\":54,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12201\",\"runDate\":\"2026-01-29\",\"horizon\":\"destination\",\"currentHaltIndex\":9,\"targetHaltIndex\":24,\"actualDelayMin\":0,\"predictedP50Min\":154.241479,\"absErrorMin\":154.241479,\"provenance\":\"synthetic\",\"zone\":\"CR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":90.618477,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":45.454021,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":6,\"remainingHalts\":15,\"remainingKm\":749,\"season\":1,\"sectionMeanRunMin\":56,\"sectionP80RunMin\":56,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-23\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":51,\"actualDelayMin\":28.12751,\"predictedP50Min\":179.314396,\"absErrorMin\":151.186886,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":33.264128,\"dayOfJourney\":1,\"dayOfWeek\":6,\"delayTrendMin\":5.557074,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":4,\"remainingHalts\":45,\"remainingKm\":1090,\"season\":1,\"sectionMeanRunMin\":75,\"sectionP80RunMin\":80,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-20\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":51,\"actualDelayMin\":17.182969,\"predictedP50Min\":167.822761,\"absErrorMin\":150.639792,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0.618875,\"dayOfJourney\":1,\"dayOfWeek\":2,\"delayTrendMin\":0,\"downstreamOccupancy\":2,\"dwellOverrunMin\":0,\"hourOfDay\":23,\"remainingHalts\":51,\"remainingKm\":1281,\"season\":1,\"sectionMeanRunMin\":12,\"sectionP80RunMin\":12,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-20\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":51,\"actualDelayMin\":17.182969,\"predictedP50Min\":166.299122,\"absErrorMin\":149.116154,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":20.248854,\"dayOfJourney\":1,\"dayOfWeek\":3,\"delayTrendMin\":4.83843,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":3,\"remainingHalts\":45,\"remainingKm\":1090,\"season\":1,\"sectionMeanRunMin\":75,\"sectionP80RunMin\":80,\"speedDeviationKmph\":0,\"weatherCode\":61}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-26\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":51,\"actualDelayMin\":75.741291,\"predictedP50Min\":223.859675,\"absErrorMin\":148.118384,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":25.603754,\"dayOfJourney\":1,\"dayOfWeek\":2,\"delayTrendMin\":25.603754,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":1,\"remainingHalts\":48,\"remainingKm\":1182,\"season\":1,\"sectionMeanRunMin\":44,\"sectionP80RunMin\":47,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11006\",\"runDate\":\"2026-01-26\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":37,\"actualDelayMin\":2.063262,\"predictedP50Min\":150.042867,\"absErrorMin\":147.979605,\"provenance\":\"synthetic\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":4.817213,\"dayOfJourney\":1,\"dayOfWeek\":2,\"delayTrendMin\":0.863142,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":0,\"remainingHalts\":31,\"remainingKm\":1452,\"season\":1,\"sectionMeanRunMin\":40,\"sectionP80RunMin\":62,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11006\",\"runDate\":\"2026-02-01\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":37,\"actualDelayMin\":2.036167,\"predictedP50Min\":149.186761,\"absErrorMin\":147.150594,\"provenance\":\"synthetic\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":3.961107,\"dayOfJourney\":1,\"dayOfWeek\":1,\"delayTrendMin\":-0.464645,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":0,\"remainingHalts\":31,\"remainingKm\":1452,\"season\":1,\"sectionMeanRunMin\":40,\"sectionP80RunMin\":62,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11013\",\"runDate\":\"2026-01-23\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":33,\"actualDelayMin\":0,\"predictedP50Min\":146.527342,\"absErrorMin\":146.527342,\"provenance\":\"synthetic\",\"zone\":\"SWR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":59.527633,\"dayOfJourney\":1,\"dayOfWeek\":6,\"delayTrendMin\":59.527633,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":8,\"remainingHalts\":27,\"remainingKm\":1011,\"season\":1,\"sectionMeanRunMin\":23,\"sectionP80RunMin\":28,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-02-01\",\"horizon\":\"destination\",\"currentHaltIndex\":21,\"targetHaltIndex\":51,\"actualDelayMin\":6.903313,\"predictedP50Min\":152.982747,\"absErrorMin\":146.079434,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":69.268682,\"dayOfJourney\":1,\"dayOfWeek\":1,\"delayTrendMin\":-1.335989,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":14,\"remainingHalts\":30,\"remainingKm\":675,\"season\":1,\"sectionMeanRunMin\":14,\"sectionP80RunMin\":14,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11006\",\"runDate\":\"2026-01-23\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":37,\"actualDelayMin\":2.199999,\"predictedP50Min\":148.25803,\"absErrorMin\":146.058031,\"provenance\":\"synthetic\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":7.528289,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":20,\"remainingHalts\":37,\"remainingKm\":1639,\"season\":1,\"sectionMeanRunMin\":40,\"sectionP80RunMin\":45,\"speedDeviationKmph\":0,\"weatherCode\":61}},{\"trainNo\":\"11006\",\"runDate\":\"2026-01-23\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":37,\"actualDelayMin\":2.199999,\"predictedP50Min\":147.392796,\"absErrorMin\":145.192797,\"provenance\":\"synthetic\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":2.167142,\"dayOfJourney\":1,\"dayOfWeek\":6,\"delayTrendMin\":-1.955094,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":0,\"remainingHalts\":31,\"remainingKm\":1452,\"season\":1,\"sectionMeanRunMin\":40,\"sectionP80RunMin\":62,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-17\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":51,\"actualDelayMin\":25.639688,\"predictedP50Min\":170.708799,\"absErrorMin\":145.069111,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":3.504914,\"dayOfJourney\":1,\"dayOfWeek\":6,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":23,\"remainingHalts\":51,\"remainingKm\":1281,\"season\":1,\"sectionMeanRunMin\":12,\"sectionP80RunMin\":12,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-02-01\",\"horizon\":\"destination\",\"currentHaltIndex\":24,\"targetHaltIndex\":51,\"actualDelayMin\":6.903313,\"predictedP50Min\":151.363693,\"absErrorMin\":144.46038,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":75.848806,\"dayOfJourney\":1,\"dayOfWeek\":1,\"delayTrendMin\":6.580124,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":15,\"remainingHalts\":27,\"remainingKm\":613,\"season\":1,\"sectionMeanRunMin\":28,\"sectionP80RunMin\":29,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11013\",\"runDate\":\"2026-01-26\",\"horizon\":\"destination\",\"currentHaltIndex\":9,\"targetHaltIndex\":33,\"actualDelayMin\":0.509339,\"predictedP50Min\":142.15743,\"absErrorMin\":141.64809,\"provenance\":\"synthetic\",\"zone\":\"SWR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":72.554576,\"dayOfJourney\":1,\"dayOfWeek\":2,\"delayTrendMin\":-6.515224,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":10,\"remainingHalts\":24,\"remainingKm\":935,\"season\":1,\"sectionMeanRunMin\":25,\"sectionP80RunMin\":35,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-23\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":51,\"actualDelayMin\":28.12751,\"predictedP50Min\":167.203885,\"absErrorMin\":139.076375,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":23,\"remainingHalts\":51,\"remainingKm\":1281,\"season\":1,\"sectionMeanRunMin\":12,\"sectionP80RunMin\":12,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11006\",\"runDate\":\"2026-02-01\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":37,\"actualDelayMin\":2.036167,\"predictedP50Min\":140.729741,\"absErrorMin\":138.693574,\"provenance\":\"synthetic\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":0,\"delayTrendMin\":0,\"downstreamOccupancy\":3,\"dwellOverrunMin\":0,\"hourOfDay\":20,\"remainingHalts\":37,\"remainingKm\":1639,\"season\":1,\"sectionMeanRunMin\":40,\"sectionP80RunMin\":45,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11006\",\"runDate\":\"2026-01-26\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":37,\"actualDelayMin\":2.063262,\"predictedP50Min\":140.729741,\"absErrorMin\":138.666479,\"provenance\":\"synthetic\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":1,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":20,\"remainingHalts\":37,\"remainingKm\":1639,\"season\":1,\"sectionMeanRunMin\":40,\"sectionP80RunMin\":45,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-20\",\"horizon\":\"destination\",\"currentHaltIndex\":21,\"targetHaltIndex\":51,\"actualDelayMin\":17.182969,\"predictedP50Min\":155.696508,\"absErrorMin\":138.51354,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":71.982443,\"dayOfJourney\":1,\"dayOfWeek\":3,\"delayTrendMin\":12.791901,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":14,\"remainingHalts\":30,\"remainingKm\":675,\"season\":1,\"sectionMeanRunMin\":14,\"sectionP80RunMin\":14,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11028\",\"runDate\":\"2026-01-20\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":51,\"actualDelayMin\":0,\"predictedP50Min\":137.352246,\"absErrorMin\":137.352246,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0.320046,\"dayOfJourney\":1,\"dayOfWeek\":3,\"delayTrendMin\":-3.151391,\"downstreamOccupancy\":3,\"dwellOverrunMin\":0,\"hourOfDay\":1,\"remainingHalts\":48,\"remainingKm\":1203,\"season\":1,\"sectionMeanRunMin\":28,\"sectionP80RunMin\":28,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11028\",\"runDate\":\"2026-02-01\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":51,\"actualDelayMin\":0,\"predictedP50Min\":137.222867,\"absErrorMin\":137.222867,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0.190667,\"dayOfJourney\":1,\"dayOfWeek\":1,\"delayTrendMin\":0.190667,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":1,\"remainingHalts\":48,\"remainingKm\":1203,\"season\":1,\"sectionMeanRunMin\":28,\"sectionP80RunMin\":28,\"speedDeviationKmph\":0,\"weatherCode\":61}},{\"trainNo\":\"11005\",\"runDate\":\"2026-01-23\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":38,\"actualDelayMin\":5.17068,\"predictedP50Min\":141.697329,\"absErrorMin\":136.526649,\"provenance\":\"synthetic\",\"zone\":\"CR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0.157749,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":21,\"remainingHalts\":38,\"remainingKm\":1636,\"season\":1,\"sectionMeanRunMin\":40,\"sectionP80RunMin\":42,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11005\",\"runDate\":\"2026-01-20\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":38,\"actualDelayMin\":7.030272,\"predictedP50Min\":141.53958,\"absErrorMin\":134.509308,\"provenance\":\"synthetic\",\"zone\":\"CR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":2,\"delayTrendMin\":0,\"downstreamOccupancy\":2,\"dwellOverrunMin\":0,\"hourOfDay\":21,\"remainingHalts\":38,\"remainingKm\":1636,\"season\":1,\"sectionMeanRunMin\":40,\"sectionP80RunMin\":42,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11028\",\"runDate\":\"2026-01-23\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":51,\"actualDelayMin\":5.610839,\"predictedP50Min\":139.682918,\"absErrorMin\":134.072079,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":2.650718,\"dayOfJourney\":1,\"dayOfWeek\":6,\"delayTrendMin\":2.650718,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":1,\"remainingHalts\":48,\"remainingKm\":1203,\"season\":1,\"sectionMeanRunMin\":28,\"sectionP80RunMin\":28,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-20\",\"horizon\":\"destination\",\"currentHaltIndex\":18,\"targetHaltIndex\":51,\"actualDelayMin\":17.182969,\"predictedP50Min\":150.911941,\"absErrorMin\":133.728973,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":59.190543,\"dayOfJourney\":1,\"dayOfWeek\":3,\"delayTrendMin\":-32.07162,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":12,\"remainingHalts\":33,\"remainingKm\":738,\"season\":1,\"sectionMeanRunMin\":35,\"sectionP80RunMin\":54,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-17\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":51,\"actualDelayMin\":25.639688,\"predictedP50Min\":158.829243,\"absErrorMin\":133.189554,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":12.778974,\"dayOfJourney\":1,\"dayOfWeek\":0,\"delayTrendMin\":4.437253,\"downstreamOccupancy\":2,\"dwellOverrunMin\":0,\"hourOfDay\":3,\"remainingHalts\":45,\"remainingKm\":1090,\"season\":1,\"sectionMeanRunMin\":75,\"sectionP80RunMin\":80,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11005\",\"runDate\":\"2026-01-17\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":38,\"actualDelayMin\":9.51453,\"predictedP50Min\":142.588235,\"absErrorMin\":133.073705,\"provenance\":\"synthetic\",\"zone\":\"CR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":1.048655,\"dayOfJourney\":1,\"dayOfWeek\":6,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":21,\"remainingHalts\":38,\"remainingKm\":1636,\"season\":1,\"sectionMeanRunMin\":40,\"sectionP80RunMin\":42,\"speedDeviationKmph\":0,\"weatherCode\":45}},{\"trainNo\":\"11006\",\"runDate\":\"2026-01-17\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":37,\"actualDelayMin\":19.771712,\"predictedP50Min\":152.805833,\"absErrorMin\":133.034121,\"provenance\":\"synthetic\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":7.580179,\"dayOfJourney\":1,\"dayOfWeek\":0,\"delayTrendMin\":-3.629553,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":0,\"remainingHalts\":31,\"remainingKm\":1452,\"season\":1,\"sectionMeanRunMin\":40,\"sectionP80RunMin\":62,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11005\",\"runDate\":\"2026-01-26\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":38,\"actualDelayMin\":8.798576,\"predictedP50Min\":141.53958,\"absErrorMin\":132.741004,\"provenance\":\"synthetic\",\"zone\":\"CR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":1,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":21,\"remainingHalts\":38,\"remainingKm\":1636,\"season\":1,\"sectionMeanRunMin\":40,\"sectionP80RunMin\":42,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-26\",\"horizon\":\"destination\",\"currentHaltIndex\":12,\"targetHaltIndex\":51,\"actualDelayMin\":75.741291,\"predictedP50Min\":208.359455,\"absErrorMin\":132.618163,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":43.274295,\"dayOfJourney\":1,\"dayOfWeek\":2,\"delayTrendMin\":2.281965,\"downstreamOccupancy\":2,\"dwellOverrunMin\":0,\"hourOfDay\":9,\"remainingHalts\":39,\"remainingKm\":887,\"season\":1,\"sectionMeanRunMin\":23,\"sectionP80RunMin\":49,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11005\",\"runDate\":\"2026-01-20\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":38,\"actualDelayMin\":7.030272,\"predictedP50Min\":139.069543,\"absErrorMin\":132.039271,\"provenance\":\"synthetic\",\"zone\":\"CR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":9.558924,\"dayOfJourney\":1,\"dayOfWeek\":2,\"delayTrendMin\":9.558924,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":23,\"remainingHalts\":35,\"remainingKm\":1518,\"season\":1,\"sectionMeanRunMin\":70,\"sectionP80RunMin\":85,\"speedDeviationKmph\":0,\"weatherCode\":61}},{\"trainNo\":\"11028\",\"runDate\":\"2026-01-29\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":51,\"actualDelayMin\":7.582777,\"predictedP50Min\":139.482899,\"absErrorMin\":131.900122,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":2.450699,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":2.450699,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":1,\"remainingHalts\":48,\"remainingKm\":1203,\"season\":1,\"sectionMeanRunMin\":28,\"sectionP80RunMin\":28,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11006\",\"runDate\":\"2026-02-01\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":37,\"actualDelayMin\":2.036167,\"predictedP50Min\":133.126533,\"absErrorMin\":131.090365,\"provenance\":\"synthetic\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":4.425753,\"dayOfJourney\":1,\"dayOfWeek\":0,\"delayTrendMin\":4.425753,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":22,\"remainingHalts\":34,\"remainingKm\":1534,\"season\":1,\"sectionMeanRunMin\":29,\"sectionP80RunMin\":34,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12245\",\"runDate\":\"2026-01-17\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":5,\"actualDelayMin\":123.242244,\"predictedP50Min\":-7.727362,\"absErrorMin\":130.969606,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":11.329856,\"dayOfJourney\":1,\"dayOfWeek\":6,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":11,\"remainingHalts\":5,\"remainingKm\":1957,\"season\":1,\"sectionMeanRunMin\":355,\"sectionP80RunMin\":355,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12138\",\"runDate\":\"2026-01-26\",\"horizon\":\"destination\",\"currentHaltIndex\":24,\"targetHaltIndex\":53,\"actualDelayMin\":14.620322,\"predictedP50Min\":145.447678,\"absErrorMin\":130.827355,\"provenance\":\"synthetic\",\"zone\":\"NR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":47.957229,\"dayOfJourney\":1,\"dayOfWeek\":2,\"delayTrendMin\":4.347139,\"downstreamOccupancy\":1,\"dwellOverrunMin\":0,\"hourOfDay\":10,\"remainingHalts\":29,\"remainingKm\":1284,\"season\":1,\"sectionMeanRunMin\":23,\"sectionP80RunMin\":30,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11006\",\"runDate\":\"2026-01-23\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":37,\"actualDelayMin\":2.199999,\"predictedP50Min\":132.823016,\"absErrorMin\":130.623016,\"provenance\":\"synthetic\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":4.122236,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-3.406053,\"downstreamOccupancy\":3,\"dwellOverrunMin\":0,\"hourOfDay\":22,\"remainingHalts\":34,\"remainingKm\":1534,\"season\":1,\"sectionMeanRunMin\":29,\"sectionP80RunMin\":34,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11006\",\"runDate\":\"2026-01-26\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":37,\"actualDelayMin\":2.063262,\"predictedP50Min\":132.654851,\"absErrorMin\":130.591589,\"provenance\":\"synthetic\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":3.954071,\"dayOfJourney\":1,\"dayOfWeek\":1,\"delayTrendMin\":3.954071,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":22,\"remainingHalts\":34,\"remainingKm\":1534,\"season\":1,\"sectionMeanRunMin\":29,\"sectionP80RunMin\":34,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-23\",\"horizon\":\"destination\",\"currentHaltIndex\":21,\"targetHaltIndex\":51,\"actualDelayMin\":28.12751,\"predictedP50Min\":158.486612,\"absErrorMin\":130.359102,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":74.772547,\"dayOfJourney\":1,\"dayOfWeek\":6,\"delayTrendMin\":10.648548,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":14,\"remainingHalts\":30,\"remainingKm\":675,\"season\":1,\"sectionMeanRunMin\":14,\"sectionP80RunMin\":14,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11013\",\"runDate\":\"2026-02-01\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":33,\"actualDelayMin\":0,\"predictedP50Min\":130.258643,\"absErrorMin\":130.258643,\"provenance\":\"synthetic\",\"zone\":\"SWR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":43.258934,\"dayOfJourney\":1,\"dayOfWeek\":1,\"delayTrendMin\":43.258934,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":8,\"remainingHalts\":27,\"remainingKm\":1011,\"season\":1,\"sectionMeanRunMin\":23,\"sectionP80RunMin\":28,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12245\",\"runDate\":\"2026-01-20\",\"horizon\":\"next\",\"currentHaltIndex\":3,\"targetHaltIndex\":4,\"actualDelayMin\":144.354212,\"predictedP50Min\":15.41012,\"absErrorMin\":128.944092,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":6.828499,\"dayOfJourney\":1,\"dayOfWeek\":3,\"delayTrendMin\":-6.071654,\"downstreamOccupancy\":1,\"dwellOverrunMin\":0,\"hourOfDay\":4,\"remainingHalts\":2,\"remainingKm\":736,\"season\":1,\"sectionMeanRunMin\":370,\"sectionP80RunMin\":395,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12245\",\"runDate\":\"2026-01-20\",\"horizon\":\"plus3h\",\"currentHaltIndex\":3,\"targetHaltIndex\":4,\"actualDelayMin\":144.354212,\"predictedP50Min\":15.41012,\"absErrorMin\":128.944092,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":6.828499,\"dayOfJourney\":1,\"dayOfWeek\":3,\"delayTrendMin\":-6.071654,\"downstreamOccupancy\":1,\"dwellOverrunMin\":0,\"hourOfDay\":4,\"remainingHalts\":2,\"remainingKm\":736,\"season\":1,\"sectionMeanRunMin\":370,\"sectionP80RunMin\":395,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12201\",\"runDate\":\"2026-02-01\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":24,\"actualDelayMin\":5.348553,\"predictedP50Min\":133.733883,\"absErrorMin\":128.38533,\"provenance\":\"synthetic\",\"zone\":\"CR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":69.8664,\"dayOfJourney\":1,\"dayOfWeek\":1,\"delayTrendMin\":63.027618,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":0,\"remainingHalts\":21,\"remainingKm\":1178,\"season\":1,\"sectionMeanRunMin\":116,\"sectionP80RunMin\":176,\"speedDeviationKmph\":0,\"weatherCode\":61}},{\"trainNo\":\"11006\",\"runDate\":\"2026-01-29\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":37,\"actualDelayMin\":21.981021,\"predictedP50Min\":150.067525,\"absErrorMin\":128.086504,\"provenance\":\"synthetic\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":4.841871,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":1.109183,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":0,\"remainingHalts\":31,\"remainingKm\":1452,\"season\":1,\"sectionMeanRunMin\":40,\"sectionP80RunMin\":62,\"speedDeviationKmph\":0,\"weatherCode\":61}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-23\",\"horizon\":\"destination\",\"currentHaltIndex\":18,\"targetHaltIndex\":51,\"actualDelayMin\":28.12751,\"predictedP50Min\":155.845398,\"absErrorMin\":127.717887,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":64.123999,\"dayOfJourney\":1,\"dayOfWeek\":6,\"delayTrendMin\":17.471824,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":12,\"remainingHalts\":33,\"remainingKm\":738,\"season\":1,\"sectionMeanRunMin\":35,\"sectionP80RunMin\":54,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11028\",\"runDate\":\"2026-01-26\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":51,\"actualDelayMin\":15.796156,\"predictedP50Min\":141.910973,\"absErrorMin\":126.114816,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":4.878773,\"dayOfJourney\":1,\"dayOfWeek\":2,\"delayTrendMin\":4.878773,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":1,\"remainingHalts\":48,\"remainingKm\":1203,\"season\":1,\"sectionMeanRunMin\":28,\"sectionP80RunMin\":28,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11005\",\"runDate\":\"2026-01-23\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":38,\"actualDelayMin\":5.17068,\"predictedP50Min\":130.79643,\"absErrorMin\":125.62575,\"provenance\":\"synthetic\",\"zone\":\"CR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":1.285811,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":1.128061,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":23,\"remainingHalts\":35,\"remainingKm\":1518,\"season\":1,\"sectionMeanRunMin\":70,\"sectionP80RunMin\":85,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12245\",\"runDate\":\"2026-01-23\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":5,\"actualDelayMin\":122.372048,\"predictedP50Min\":-3.046043,\"absErrorMin\":125.418092,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":16.011174,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":11,\"remainingHalts\":5,\"remainingKm\":1957,\"season\":1,\"sectionMeanRunMin\":355,\"sectionP80RunMin\":355,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11005\",\"runDate\":\"2026-01-29\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":38,\"actualDelayMin\":17.386136,\"predictedP50Min\":141.53958,\"absErrorMin\":124.153444,\"provenance\":\"synthetic\",\"zone\":\"CR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":3,\"dwellOverrunMin\":0,\"hourOfDay\":21,\"remainingHalts\":38,\"remainingKm\":1636,\"season\":1,\"sectionMeanRunMin\":40,\"sectionP80RunMin\":42,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11028\",\"runDate\":\"2026-01-17\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":51,\"actualDelayMin\":12.898119,\"predictedP50Min\":137.0322,\"absErrorMin\":124.134081,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":0,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":1,\"remainingHalts\":48,\"remainingKm\":1203,\"season\":1,\"sectionMeanRunMin\":28,\"sectionP80RunMin\":28,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11005\",\"runDate\":\"2026-01-17\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":38,\"actualDelayMin\":9.51453,\"predictedP50Min\":133.280816,\"absErrorMin\":123.766286,\"provenance\":\"synthetic\",\"zone\":\"CR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":3.770197,\"dayOfJourney\":1,\"dayOfWeek\":6,\"delayTrendMin\":2.721542,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":23,\"remainingHalts\":35,\"remainingKm\":1518,\"season\":1,\"sectionMeanRunMin\":70,\"sectionP80RunMin\":85,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-02-01\",\"horizon\":\"destination\",\"currentHaltIndex\":27,\"targetHaltIndex\":51,\"actualDelayMin\":6.903313,\"predictedP50Min\":130.365957,\"absErrorMin\":123.462644,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":63.050249,\"dayOfJourney\":1,\"dayOfWeek\":1,\"delayTrendMin\":-12.798557,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":16,\"remainingHalts\":24,\"remainingKm\":550,\"season\":1,\"sectionMeanRunMin\":8,\"sectionP80RunMin\":9,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12138\",\"runDate\":\"2026-01-26\",\"horizon\":\"destination\",\"currentHaltIndex\":30,\"targetHaltIndex\":53,\"actualDelayMin\":14.620322,\"predictedP50Min\":138.038311,\"absErrorMin\":123.417989,\"provenance\":\"synthetic\",\"zone\":\"NR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":54.869881,\"dayOfJourney\":1,\"dayOfWeek\":2,\"delayTrendMin\":12.563162,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":13,\"remainingHalts\":23,\"remainingKm\":1109,\"season\":1,\"sectionMeanRunMin\":45,\"sectionP80RunMin\":45,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12201\",\"runDate\":\"2026-01-26\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":24,\"actualDelayMin\":8.805931,\"predictedP50Min\":132.139208,\"absErrorMin\":123.333277,\"provenance\":\"synthetic\",\"zone\":\"CR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":68.271725,\"dayOfJourney\":1,\"dayOfWeek\":2,\"delayTrendMin\":63.937335,\"downstreamOccupancy\":3,\"dwellOverrunMin\":0,\"hourOfDay\":0,\"remainingHalts\":21,\"remainingKm\":1178,\"season\":1,\"sectionMeanRunMin\":116,\"sectionP80RunMin\":176,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11028\",\"runDate\":\"2026-01-20\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":51,\"actualDelayMin\":0,\"predictedP50Min\":122.967128,\"absErrorMin\":122.967128,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":3.471437,\"dayOfJourney\":1,\"dayOfWeek\":2,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":23,\"remainingHalts\":51,\"remainingKm\":1283,\"season\":1,\"sectionMeanRunMin\":33,\"sectionP80RunMin\":34,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-26\",\"horizon\":\"destination\",\"currentHaltIndex\":9,\"targetHaltIndex\":51,\"actualDelayMin\":75.741291,\"predictedP50Min\":197.671276,\"absErrorMin\":121.929985,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":40.99233,\"dayOfJourney\":1,\"dayOfWeek\":2,\"delayTrendMin\":20.179918,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":7,\"remainingHalts\":42,\"remainingKm\":938,\"season\":1,\"sectionMeanRunMin\":18,\"sectionP80RunMin\":23,\"speedDeviationKmph\":0,\"weatherCode\":61}},{\"trainNo\":\"11027\",\"runDate\":\"2026-01-20\",\"horizon\":\"destination\",\"currentHaltIndex\":24,\"targetHaltIndex\":51,\"actualDelayMin\":17.182969,\"predictedP50Min\":138.857723,\"absErrorMin\":121.674755,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":63.342837,\"dayOfJourney\":1,\"dayOfWeek\":3,\"delayTrendMin\":-8.639607,\"downstreamOccupancy\":2,\"dwellOverrunMin\":0,\"hourOfDay\":14,\"remainingHalts\":27,\"remainingKm\":613,\"season\":1,\"sectionMeanRunMin\":28,\"sectionP80RunMin\":29,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11006\",\"runDate\":\"2026-01-17\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":37,\"actualDelayMin\":19.771712,\"predictedP50Min\":140.990713,\"absErrorMin\":121.219002,\"provenance\":\"synthetic\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0.260972,\"dayOfJourney\":1,\"dayOfWeek\":6,\"delayTrendMin\":0,\"downstreamOccupancy\":2,\"dwellOverrunMin\":0,\"hourOfDay\":20,\"remainingHalts\":37,\"remainingKm\":1639,\"season\":1,\"sectionMeanRunMin\":40,\"sectionP80RunMin\":45,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12138\",\"runDate\":\"2026-01-26\",\"horizon\":\"destination\",\"currentHaltIndex\":9,\"targetHaltIndex\":53,\"actualDelayMin\":14.620322,\"predictedP50Min\":135.742484,\"absErrorMin\":121.122162,\"provenance\":\"synthetic\",\"zone\":\"NR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":26.245553,\"dayOfJourney\":1,\"dayOfWeek\":2,\"delayTrendMin\":5.834793,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":1,\"remainingHalts\":44,\"remainingKm\":1742,\"season\":1,\"sectionMeanRunMin\":13,\"sectionP80RunMin\":15,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12245\",\"runDate\":\"2026-01-23\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":5,\"actualDelayMin\":122.372048,\"predictedP50Min\":1.36591,\"absErrorMin\":121.006138,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":6,\"delayTrendMin\":-16.011174,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":4,\"remainingHalts\":2,\"remainingKm\":736,\"season\":1,\"sectionMeanRunMin\":370,\"sectionP80RunMin\":395,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11005\",\"runDate\":\"2026-01-26\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":38,\"actualDelayMin\":8.798576,\"predictedP50Min\":129.510619,\"absErrorMin\":120.712043,\"provenance\":\"synthetic\",\"zone\":\"CR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":1,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":23,\"remainingHalts\":35,\"remainingKm\":1518,\"season\":1,\"sectionMeanRunMin\":70,\"sectionP80RunMin\":85,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12201\",\"runDate\":\"2026-01-26\",\"horizon\":\"destination\",\"currentHaltIndex\":9,\"targetHaltIndex\":24,\"actualDelayMin\":8.805931,\"predictedP50Min\":129.252831,\"absErrorMin\":120.446901,\"provenance\":\"synthetic\",\"zone\":\"CR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":65.629829,\"dayOfJourney\":1,\"dayOfWeek\":2,\"delayTrendMin\":9.097167,\"downstreamOccupancy\":1,\"dwellOverrunMin\":0,\"hourOfDay\":6,\"remainingHalts\":15,\"remainingKm\":749,\"season\":1,\"sectionMeanRunMin\":56,\"sectionP80RunMin\":56,\"speedDeviationKmph\":0,\"weatherCode\":61}},{\"trainNo\":\"11006\",\"runDate\":\"2026-01-17\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":37,\"actualDelayMin\":19.771712,\"predictedP50Min\":139.910511,\"absErrorMin\":120.1388,\"provenance\":\"synthetic\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":11.209732,\"dayOfJourney\":1,\"dayOfWeek\":6,\"delayTrendMin\":10.948759,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":23,\"remainingHalts\":34,\"remainingKm\":1534,\"season\":1,\"sectionMeanRunMin\":29,\"sectionP80RunMin\":34,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11028\",\"runDate\":\"2026-02-01\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":51,\"actualDelayMin\":0,\"predictedP50Min\":119.495692,\"absErrorMin\":119.495692,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":0,\"delayTrendMin\":0,\"downstreamOccupancy\":3,\"dwellOverrunMin\":0,\"hourOfDay\":23,\"remainingHalts\":51,\"remainingKm\":1283,\"season\":1,\"sectionMeanRunMin\":33,\"sectionP80RunMin\":34,\"speedDeviationKmph\":0,\"weatherCode\":61}},{\"trainNo\":\"11013\",\"runDate\":\"2026-01-23\",\"horizon\":\"destination\",\"currentHaltIndex\":9,\"targetHaltIndex\":33,\"actualDelayMin\":0,\"predictedP50Min\":119.427319,\"absErrorMin\":119.427319,\"provenance\":\"synthetic\",\"zone\":\"SWR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":49.824465,\"dayOfJourney\":1,\"dayOfWeek\":6,\"delayTrendMin\":-9.703169,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":10,\"remainingHalts\":24,\"remainingKm\":935,\"season\":1,\"sectionMeanRunMin\":25,\"sectionP80RunMin\":35,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11013\",\"runDate\":\"2026-01-17\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":33,\"actualDelayMin\":12.732654,\"predictedP50Min\":131.813671,\"absErrorMin\":119.081017,\"provenance\":\"synthetic\",\"zone\":\"SWR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":44.813963,\"dayOfJourney\":1,\"dayOfWeek\":0,\"delayTrendMin\":44.813963,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":8,\"remainingHalts\":27,\"remainingKm\":1011,\"season\":1,\"sectionMeanRunMin\":23,\"sectionP80RunMin\":28,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11006\",\"runDate\":\"2026-01-29\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":37,\"actualDelayMin\":21.981021,\"predictedP50Min\":140.729741,\"absErrorMin\":118.74872,\"provenance\":\"synthetic\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":20,\"remainingHalts\":37,\"remainingKm\":1639,\"season\":1,\"sectionMeanRunMin\":40,\"sectionP80RunMin\":45,\"speedDeviationKmph\":0,\"weatherCode\":45}},{\"trainNo\":\"12138\",\"runDate\":\"2026-01-26\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":53,\"actualDelayMin\":14.620322,\"predictedP50Min\":132.395467,\"absErrorMin\":117.775145,\"provenance\":\"synthetic\",\"zone\":\"NR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":20.41076,\"dayOfJourney\":1,\"dayOfWeek\":2,\"delayTrendMin\":4.768983,\"downstreamOccupancy\":3,\"dwellOverrunMin\":0,\"hourOfDay\":0,\"remainingHalts\":47,\"remainingKm\":1792,\"season\":1,\"sectionMeanRunMin\":15,\"sectionP80RunMin\":15,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12138\",\"runDate\":\"2026-01-26\",\"horizon\":\"destination\",\"currentHaltIndex\":12,\"targetHaltIndex\":53,\"actualDelayMin\":14.620322,\"predictedP50Min\":131.992668,\"absErrorMin\":117.372346,\"provenance\":\"synthetic\",\"zone\":\"NR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":28.041366,\"dayOfJourney\":1,\"dayOfWeek\":2,\"delayTrendMin\":1.795813,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":2,\"remainingHalts\":41,\"remainingKm\":1690,\"season\":1,\"sectionMeanRunMin\":32,\"sectionP80RunMin\":54,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11013\",\"runDate\":\"2026-01-29\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":33,\"actualDelayMin\":7.927351,\"predictedP50Min\":124.959301,\"absErrorMin\":117.03195,\"provenance\":\"synthetic\",\"zone\":\"SWR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":37.959593,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":37.959593,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":8,\"remainingHalts\":27,\"remainingKm\":1011,\"season\":1,\"sectionMeanRunMin\":23,\"sectionP80RunMin\":28,\"speedDeviationKmph\":0,\"weatherCode\":61}},{\"trainNo\":\"12201\",\"runDate\":\"2026-01-20\",\"horizon\":\"destination\",\"currentHaltIndex\":9,\"targetHaltIndex\":24,\"actualDelayMin\":4.650623,\"predictedP50Min\":121.276645,\"absErrorMin\":116.626023,\"provenance\":\"synthetic\",\"zone\":\"CR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":57.653642,\"dayOfJourney\":1,\"dayOfWeek\":3,\"delayTrendMin\":42.775764,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":6,\"remainingHalts\":15,\"remainingKm\":749,\"season\":1,\"sectionMeanRunMin\":56,\"sectionP80RunMin\":56,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11013\",\"runDate\":\"2026-01-29\",\"horizon\":\"destination\",\"currentHaltIndex\":9,\"targetHaltIndex\":33,\"actualDelayMin\":7.927351,\"predictedP50Min\":124.512114,\"absErrorMin\":116.584763,\"provenance\":\"synthetic\",\"zone\":\"SWR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":54.90926,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":16.949667,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":10,\"remainingHalts\":24,\"remainingKm\":935,\"season\":1,\"sectionMeanRunMin\":25,\"sectionP80RunMin\":35,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12245\",\"runDate\":\"2026-01-26\",\"horizon\":\"next\",\"currentHaltIndex\":0,\"targetHaltIndex\":1,\"actualDelayMin\":140.924424,\"predictedP50Min\":25.272693,\"absErrorMin\":115.651731,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":16.485393,\"dayOfJourney\":1,\"dayOfWeek\":1,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":11,\"remainingHalts\":5,\"remainingKm\":1957,\"season\":1,\"sectionMeanRunMin\":355,\"sectionP80RunMin\":355,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12245\",\"runDate\":\"2026-01-26\",\"horizon\":\"plus3h\",\"currentHaltIndex\":0,\"targetHaltIndex\":1,\"actualDelayMin\":140.924424,\"predictedP50Min\":25.272693,\"absErrorMin\":115.651731,\"provenance\":\"synthetic\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":16.485393,\"dayOfJourney\":1,\"dayOfWeek\":1,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":11,\"remainingHalts\":5,\"remainingKm\":1957,\"season\":1,\"sectionMeanRunMin\":355,\"sectionP80RunMin\":355,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"11005\",\"runDate\":\"2026-01-29\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":38,\"actualDelayMin\":17.386136,\"predictedP50Min\":132.973149,\"absErrorMin\":115.587013,\"provenance\":\"synthetic\",\"zone\":\"CR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":3.46253,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":3.46253,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":23,\"remainingHalts\":35,\"remainingKm\":1518,\"season\":1,\"sectionMeanRunMin\":70,\"sectionP80RunMin\":85,\"speedDeviationKmph\":0,\"weatherCode\":0}}]}"),
	real: /* @__PURE__ */ JSON.parse("{\"n\":108,\"horizons\":{\"next\":{\"n\":37,\"model\":{\"mae\":6.363252,\"medae\":3.82583,\"rmse\":9.082359},\"baselineA\":{\"mae\":7.756757,\"medae\":3,\"rmse\":12.15997},\"baselineB\":{\"mae\":5.756757,\"medae\":3,\"rmse\":9.160727},\"baselineC\":{\"mae\":5.810811,\"medae\":4,\"rmse\":9.204875},\"improvementVsBPct\":-10.535359,\"calibration\":{\"p80Coverage\":0.837838,\"p10Coverage\":0.972973,\"reliability\":[{\"bin\":\"0–5\",\"predictedMean\":3.359828,\"observedMean\":7.647059,\"n\":17},{\"bin\":\"5–15\",\"predictedMean\":7.779035,\"observedMean\":6.1,\"n\":10},{\"bin\":\"15–30\",\"predictedMean\":19.16904,\"observedMean\":16,\"n\":6},{\"bin\":\"60+\",\"predictedMean\":-3.010875,\"observedMean\":0,\"n\":4}]},\"breakdowns\":{\"zone\":[{\"key\":\"SR\",\"n\":5,\"mae\":4.491234,\"medae\":4.002221,\"rmse\":5.007172},{\"key\":\"UNZ\",\"n\":22,\"mae\":7.22774,\"medae\":3.645199,\"rmse\":10.537292},{\"key\":\"WR\",\"n\":10,\"mae\":5.39739,\"medae\":3.687772,\"rmse\":6.956894}],\"trainClass\":[{\"key\":\"Express\",\"n\":37,\"mae\":6.363252,\"medae\":3.82583,\"rmse\":9.082359}],\"hour\":[{\"key\":\"0\",\"n\":1,\"mae\":0.549567,\"medae\":0.549567,\"rmse\":0.549567},{\"key\":\"12\",\"n\":1,\"mae\":10.538225,\"medae\":10.538225,\"rmse\":10.538225},{\"key\":\"14\",\"n\":1,\"mae\":4.29753,\"medae\":4.29753,\"rmse\":4.29753},{\"key\":\"15\",\"n\":2,\"mae\":2.755601,\"medae\":2.755601,\"rmse\":2.824141},{\"key\":\"16\",\"n\":2,\"mae\":3,\"medae\":3,\"rmse\":3.061213},{\"key\":\"17\",\"n\":5,\"mae\":5.423108,\"medae\":3.137184,\"rmse\":7.38581},{\"key\":\"18\",\"n\":2,\"mae\":15.325916,\"medae\":15.325916,\"rmse\":21.425235},{\"key\":\"19\",\"n\":1,\"mae\":3.405774,\"medae\":3.405774,\"rmse\":3.405774},{\"key\":\"2\",\"n\":1,\"mae\":5.833948,\"medae\":5.833948,\"rmse\":5.833948},{\"key\":\"20\",\"n\":5,\"mae\":7.279336,\"medae\":4.862816,\"rmse\":8.705963},{\"key\":\"21\",\"n\":3,\"mae\":6.709657,\"medae\":4.002221,\"rmse\":7.736687},{\"key\":\"22\",\"n\":1,\"mae\":15.840934,\"medae\":15.840934,\"rmse\":15.840934},{\"key\":\"23\",\"n\":1,\"mae\":5.13764,\"medae\":5.13764,\"rmse\":5.13764},{\"key\":\"3\",\"n\":3,\"mae\":4.954264,\"medae\":4.660317,\"rmse\":5.550789},{\"key\":\"5\",\"n\":4,\"mae\":2.843252,\"medae\":2.507599,\"rmse\":3.311428},{\"key\":\"6\",\"n\":2,\"mae\":17.070889,\"medae\":17.070889,\"rmse\":18.278761},{\"key\":\"8\",\"n\":1,\"mae\":0.405014,\"medae\":0.405014,\"rmse\":0.405014},{\"key\":\"9\",\"n\":1,\"mae\":3.249914,\"medae\":3.249914,\"rmse\":3.249914}],\"dayOfJourney\":[{\"key\":\"1\",\"n\":37,\"mae\":6.363252,\"medae\":3.82583,\"rmse\":9.082359}],\"delayMagnitude\":[{\"key\":\"moderate\",\"n\":16,\"mae\":5.974597,\"medae\":3.985995,\"rmse\":7.558107},{\"key\":\"on-time\",\"n\":19,\"mae\":5.289201,\"medae\":3.164474,\"rmse\":7.73974},{\"key\":\"severe\",\"n\":2,\"mae\":19.675984,\"medae\":19.675984,\"rmse\":22.359944}]}},\"plus3h\":{\"n\":34,\"model\":{\"mae\":9.071978,\"medae\":5.407541,\"rmse\":12.779676},\"baselineA\":{\"mae\":5.970588,\"medae\":3,\"rmse\":10.100961},\"baselineB\":{\"mae\":6.323529,\"medae\":3.5,\"rmse\":10.193712},\"baselineC\":{\"mae\":7.147059,\"medae\":4.5,\"rmse\":10.942362},\"improvementVsBPct\":-43.463847,\"calibration\":{\"p80Coverage\":0.970588,\"p10Coverage\":0.970588,\"reliability\":[{\"bin\":\"0–5\",\"predictedMean\":2.80949,\"observedMean\":6.307692,\"n\":13},{\"bin\":\"5–15\",\"predictedMean\":8.301245,\"observedMean\":3.2,\"n\":10},{\"bin\":\"15–30\",\"predictedMean\":20.180131,\"observedMean\":7,\"n\":5},{\"bin\":\"30–60\",\"predictedMean\":34.232784,\"observedMean\":0,\"n\":1},{\"bin\":\"60+\",\"predictedMean\":-4.840364,\"observedMean\":-1.6,\"n\":5}]},\"breakdowns\":{\"zone\":[{\"key\":\"SR\",\"n\":4,\"mae\":15.066424,\"medae\":15.140791,\"rmse\":18.471332},{\"key\":\"UNZ\",\"n\":20,\"mae\":9.332435,\"medae\":5.561308,\"rmse\":13.445057},{\"key\":\"WR\",\"n\":10,\"mae\":6.153288,\"medae\":4.673034,\"rmse\":7.567909}],\"trainClass\":[{\"key\":\"Express\",\"n\":34,\"mae\":9.071978,\"medae\":5.407541,\"rmse\":12.779676}],\"hour\":[{\"key\":\"0\",\"n\":1,\"mae\":0.549567,\"medae\":0.549567,\"rmse\":0.549567},{\"key\":\"12\",\"n\":1,\"mae\":5.976642,\"medae\":5.976642,\"rmse\":5.976642},{\"key\":\"14\",\"n\":1,\"mae\":2.375902,\"medae\":2.375902,\"rmse\":2.375902},{\"key\":\"15\",\"n\":2,\"mae\":4.569549,\"medae\":4.569549,\"rmse\":4.884989},{\"key\":\"16\",\"n\":2,\"mae\":2.855797,\"medae\":2.855797,\"rmse\":2.893393},{\"key\":\"17\",\"n\":4,\"mae\":4.405627,\"medae\":2.289964,\"rmse\":6.326424},{\"key\":\"18\",\"n\":2,\"mae\":14.684916,\"medae\":14.684916,\"rmse\":20.518789},{\"key\":\"19\",\"n\":1,\"mae\":13.291723,\"medae\":13.291723,\"rmse\":13.291723},{\"key\":\"2\",\"n\":1,\"mae\":0.397127,\"medae\":0.397127,\"rmse\":0.397127},{\"key\":\"20\",\"n\":4,\"mae\":10.176359,\"medae\":8.064568,\"rmse\":11.521311},{\"key\":\"21\",\"n\":3,\"mae\":12.000909,\"medae\":12.15698,\"rmse\":13.716346},{\"key\":\"22\",\"n\":1,\"mae\":18.538126,\"medae\":18.538126,\"rmse\":18.538126},{\"key\":\"23\",\"n\":1,\"mae\":0.701836,\"medae\":0.701836,\"rmse\":0.701836},{\"key\":\"3\",\"n\":3,\"mae\":11.996171,\"medae\":4.660317,\"rmse\":17.159606},{\"key\":\"5\",\"n\":3,\"mae\":4.528522,\"medae\":4.68575,\"rmse\":4.573154},{\"key\":\"6\",\"n\":2,\"mae\":22.384656,\"medae\":22.384656,\"rmse\":25.326882},{\"key\":\"8\",\"n\":1,\"mae\":12.94461,\"medae\":12.94461,\"rmse\":12.94461},{\"key\":\"9\",\"n\":1,\"mae\":20.777149,\"medae\":20.777149,\"rmse\":20.777149}],\"dayOfJourney\":[{\"key\":\"1\",\"n\":34,\"mae\":9.071978,\"medae\":5.407541,\"rmse\":12.779676}],\"delayMagnitude\":[{\"key\":\"moderate\",\"n\":13,\"mae\":8.088994,\"medae\":5.976642,\"rmse\":10.439647},{\"key\":\"on-time\",\"n\":20,\"mae\":8.713728,\"medae\":4.673034,\"rmse\":12.833836},{\"key\":\"severe\",\"n\":1,\"mae\":29.01579,\"medae\":29.01579,\"rmse\":29.01579}]}},\"destination\":{\"n\":37,\"model\":{\"mae\":14.627865,\"medae\":10.3342,\"rmse\":19.154048},\"baselineA\":{\"mae\":7,\"medae\":0,\"rmse\":12.585921},\"baselineB\":{\"mae\":6.891892,\"medae\":0,\"rmse\":12.985439},\"baselineC\":{\"mae\":9.972973,\"medae\":4,\"rmse\":16.591271},\"improvementVsBPct\":-112.24745,\"calibration\":{\"p80Coverage\":0.972973,\"p10Coverage\":0.972973,\"reliability\":[{\"bin\":\"0–5\",\"predictedMean\":2.384203,\"observedMean\":-3.666667,\"n\":9},{\"bin\":\"5–15\",\"predictedMean\":11.160531,\"observedMean\":-1.222222,\"n\":9},{\"bin\":\"15–30\",\"predictedMean\":18.444351,\"observedMean\":-2.625,\"n\":8},{\"bin\":\"30–60\",\"predictedMean\":34.110861,\"observedMean\":0,\"n\":1},{\"bin\":\"60+\",\"predictedMean\":-8.069123,\"observedMean\":-1.8,\"n\":10}]},\"breakdowns\":{\"zone\":[{\"key\":\"SR\",\"n\":5,\"mae\":37.711649,\"medae\":35.388917,\"rmse\":38.349254},{\"key\":\"UNZ\",\"n\":22,\"mae\":10.621177,\"medae\":9.594804,\"rmse\":13.159602},{\"key\":\"WR\",\"n\":10,\"mae\":11.900685,\"medae\":7.177106,\"rmse\":15.528331}],\"trainClass\":[{\"key\":\"Express\",\"n\":37,\"mae\":14.627865,\"medae\":10.3342,\"rmse\":19.154048}],\"hour\":[{\"key\":\"0\",\"n\":1,\"mae\":34.110861,\"medae\":34.110861,\"rmse\":34.110861},{\"key\":\"12\",\"n\":1,\"mae\":14.756568,\"medae\":14.756568,\"rmse\":14.756568},{\"key\":\"14\",\"n\":1,\"mae\":17.394478,\"medae\":17.394478,\"rmse\":17.394478},{\"key\":\"15\",\"n\":2,\"mae\":6.813222,\"medae\":6.813222,\"rmse\":7.178773},{\"key\":\"16\",\"n\":2,\"mae\":8.238573,\"medae\":8.238573,\"rmse\":8.886938},{\"key\":\"17\",\"n\":5,\"mae\":11.959502,\"medae\":10.114794,\"rmse\":13.788167},{\"key\":\"18\",\"n\":2,\"mae\":7.949531,\"medae\":7.949531,\"rmse\":10.642557},{\"key\":\"19\",\"n\":1,\"mae\":30.990715,\"medae\":30.990715,\"rmse\":30.990715},{\"key\":\"2\",\"n\":1,\"mae\":0.397127,\"medae\":0.397127,\"rmse\":0.397127},{\"key\":\"20\",\"n\":5,\"mae\":14.389814,\"medae\":8.595894,\"rmse\":20.925327},{\"key\":\"21\",\"n\":3,\"mae\":28.510002,\"medae\":21.488217,\"rmse\":31.760563},{\"key\":\"22\",\"n\":1,\"mae\":6.245455,\"medae\":6.245455,\"rmse\":6.245455},{\"key\":\"23\",\"n\":1,\"mae\":32.483466,\"medae\":32.483466,\"rmse\":32.483466},{\"key\":\"3\",\"n\":3,\"mae\":12.181952,\"medae\":5.21766,\"rmse\":17.212996},{\"key\":\"5\",\"n\":4,\"mae\":12.627049,\"medae\":5.719,\"rmse\":18.247206},{\"key\":\"6\",\"n\":2,\"mae\":8.969426,\"medae\":8.969426,\"rmse\":9.105296},{\"key\":\"8\",\"n\":1,\"mae\":10.3342,\"medae\":10.3342,\"rmse\":10.3342},{\"key\":\"9\",\"n\":1,\"mae\":26.245986,\"medae\":26.245986,\"rmse\":26.245986}],\"dayOfJourney\":[{\"key\":\"1\",\"n\":37,\"mae\":14.627865,\"medae\":10.3342,\"rmse\":19.154048}],\"delayMagnitude\":[{\"key\":\"moderate\",\"n\":8,\"mae\":7.019576,\"medae\":5.731996,\"rmse\":8.127829},{\"key\":\"on-time\",\"n\":29,\"mae\":16.726703,\"medae\":13.639006,\"rmse\":21.209933}]}}},\"worst100\":[{\"trainNo\":\"12631\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":14,\"actualDelayMin\":-31,\"predictedP50Min\":17.048704,\"absErrorMin\":48.048704,\"provenance\":\"railradar\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":19,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":10,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":21,\"remainingHalts\":11,\"remainingKm\":558,\"season\":3,\"sectionMeanRunMin\":23,\"sectionP80RunMin\":23,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12631\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":14,\"actualDelayMin\":-31,\"predictedP50Min\":12.35488,\"absErrorMin\":43.35488,\"provenance\":\"railradar\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":9,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":20,\"remainingHalts\":14,\"remainingKm\":649,\"season\":3,\"sectionMeanRunMin\":28,\"sectionP80RunMin\":28,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12631\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":12,\"targetHaltIndex\":14,\"actualDelayMin\":-31,\"predictedP50Min\":4.388917,\"absErrorMin\":35.388917,\"provenance\":\"railradar\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":10,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":6,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":5,\"remainingHalts\":2,\"remainingKm\":87,\"season\":3,\"sectionMeanRunMin\":19,\"sectionP80RunMin\":24,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12163\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":6,\"targetHaltIndex\":12,\"actualDelayMin\":0,\"predictedP50Min\":34.232784,\"absErrorMin\":34.232784,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-11,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":6,\"remainingHalts\":17,\"remainingKm\":691,\"season\":3,\"sectionMeanRunMin\":25,\"sectionP80RunMin\":35,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12163\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":23,\"actualDelayMin\":0,\"predictedP50Min\":34.110861,\"absErrorMin\":34.110861,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":11,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":11,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":0,\"remainingHalts\":20,\"remainingKm\":1096,\"season\":3,\"sectionMeanRunMin\":245,\"sectionP80RunMin\":330,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12631\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":14,\"actualDelayMin\":-31,\"predictedP50Min\":1.483466,\"absErrorMin\":32.483466,\"provenance\":\"railradar\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":5,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":-14,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":23,\"remainingHalts\":8,\"remainingKm\":437,\"season\":3,\"sectionMeanRunMin\":125,\"sectionP80RunMin\":158,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12953\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":12,\"actualDelayMin\":-4,\"predictedP50Min\":26.990715,\"absErrorMin\":30.990715,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":15,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":15,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":19,\"remainingHalts\":9,\"remainingKm\":1197,\"season\":3,\"sectionMeanRunMin\":24,\"sectionP80RunMin\":28,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12001\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":3,\"targetHaltIndex\":4,\"actualDelayMin\":35,\"predictedP50Min\":4.70221,\"absErrorMin\":30.29779,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":18,\"remainingHalts\":6,\"remainingKm\":393,\"season\":3,\"sectionMeanRunMin\":73,\"sectionP80RunMin\":75,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12631\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":9,\"targetHaltIndex\":14,\"actualDelayMin\":-31,\"predictedP50Min\":-1.71772,\"absErrorMin\":29.28228,\"provenance\":\"railradar\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":4,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-1,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":3,\"remainingHalts\":5,\"remainingKm\":179,\"season\":3,\"sectionMeanRunMin\":39,\"sectionP80RunMin\":41,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12631\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":9,\"targetHaltIndex\":14,\"actualDelayMin\":-31,\"predictedP50Min\":-1.71772,\"absErrorMin\":29.28228,\"provenance\":\"railradar\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":4,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-1,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":3,\"remainingHalts\":5,\"remainingKm\":179,\"season\":3,\"sectionMeanRunMin\":39,\"sectionP80RunMin\":41,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12001\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":3,\"targetHaltIndex\":8,\"actualDelayMin\":32,\"predictedP50Min\":2.98421,\"absErrorMin\":29.01579,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":18,\"remainingHalts\":6,\"remainingKm\":393,\"season\":3,\"sectionMeanRunMin\":73,\"sectionP80RunMin\":75,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12163\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":12,\"targetHaltIndex\":23,\"actualDelayMin\":0,\"predictedP50Min\":-26.245986,\"absErrorMin\":26.245986,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-5,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":9,\"remainingHalts\":11,\"remainingKm\":504,\"season\":3,\"sectionMeanRunMin\":60,\"sectionP80RunMin\":70,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12953\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":12,\"actualDelayMin\":-4,\"predictedP50Min\":20.118312,\"absErrorMin\":24.118312,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":17,\"remainingHalts\":12,\"remainingKm\":1366,\"season\":3,\"sectionMeanRunMin\":21,\"sectionP80RunMin\":22,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12163\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":6,\"targetHaltIndex\":7,\"actualDelayMin\":0,\"predictedP50Min\":23.605249,\"absErrorMin\":23.605249,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-11,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":6,\"remainingHalts\":17,\"remainingKm\":691,\"season\":3,\"sectionMeanRunMin\":25,\"sectionP80RunMin\":35,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12953\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":12,\"actualDelayMin\":-4,\"predictedP50Min\":17.488217,\"absErrorMin\":21.488217,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":9,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":-6,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":21,\"remainingHalts\":6,\"remainingKm\":1045,\"season\":3,\"sectionMeanRunMin\":60,\"sectionP80RunMin\":65,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12163\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":12,\"targetHaltIndex\":16,\"actualDelayMin\":12,\"predictedP50Min\":-8.777149,\"absErrorMin\":20.777149,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-5,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":9,\"remainingHalts\":11,\"remainingKm\":504,\"season\":3,\"sectionMeanRunMin\":60,\"sectionP80RunMin\":70,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12631\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":3,\"targetHaltIndex\":7,\"actualDelayMin\":0,\"predictedP50Min\":20.056523,\"absErrorMin\":20.056523,\"provenance\":\"railradar\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":19,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":10,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":21,\"remainingHalts\":11,\"remainingKm\":558,\"season\":3,\"sectionMeanRunMin\":23,\"sectionP80RunMin\":23,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12163\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":0,\"targetHaltIndex\":3,\"actualDelayMin\":11,\"predictedP50Min\":-7.979757,\"absErrorMin\":18.979757,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":20,\"remainingHalts\":23,\"remainingKm\":1278,\"season\":3,\"sectionMeanRunMin\":40,\"sectionP80RunMin\":42,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12301\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":3,\"targetHaltIndex\":5,\"actualDelayMin\":0,\"predictedP50Min\":18.538126,\"absErrorMin\":18.538126,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":11,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":11,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":22,\"remainingHalts\":4,\"remainingKm\":982,\"season\":3,\"sectionMeanRunMin\":163,\"sectionP80RunMin\":175,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12305\",\"runDate\":\"2026-09-06\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":8,\"actualDelayMin\":0,\"predictedP50Min\":17.394478,\"absErrorMin\":17.394478,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":0,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":14,\"remainingHalts\":8,\"remainingKm\":1516,\"season\":3,\"sectionMeanRunMin\":68,\"sectionP80RunMin\":80,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12951\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":7,\"actualDelayMin\":0,\"predictedP50Min\":15.993084,\"absErrorMin\":15.993084,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":14,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":14,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":21,\"remainingHalts\":4,\"remainingKm\":982,\"season\":3,\"sectionMeanRunMin\":226,\"sectionP80RunMin\":247,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12301\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":3,\"targetHaltIndex\":4,\"actualDelayMin\":0,\"predictedP50Min\":15.840934,\"absErrorMin\":15.840934,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":11,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":11,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":22,\"remainingHalts\":4,\"remainingKm\":982,\"season\":3,\"sectionMeanRunMin\":163,\"sectionP80RunMin\":175,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12163\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":0,\"targetHaltIndex\":1,\"actualDelayMin\":19,\"predictedP50Min\":3.164474,\"absErrorMin\":15.835526,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":20,\"remainingHalts\":23,\"remainingKm\":1278,\"season\":3,\"sectionMeanRunMin\":40,\"sectionP80RunMin\":42,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12951\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":0,\"targetHaltIndex\":1,\"actualDelayMin\":19,\"predictedP50Min\":3.568599,\"absErrorMin\":15.431401,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":17,\"remainingHalts\":7,\"remainingKm\":1373,\"season\":3,\"sectionMeanRunMin\":32,\"sectionP80RunMin\":35,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12001\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":9,\"actualDelayMin\":13,\"predictedP50Min\":-2.025474,\"absErrorMin\":15.025474,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":18,\"remainingHalts\":6,\"remainingKm\":393,\"season\":3,\"sectionMeanRunMin\":73,\"sectionP80RunMin\":75,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12163\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":15,\"targetHaltIndex\":23,\"actualDelayMin\":0,\"predictedP50Min\":-14.756568,\"absErrorMin\":14.756568,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":4,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":4,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":12,\"remainingHalts\":8,\"remainingKm\":376,\"season\":3,\"sectionMeanRunMin\":59,\"sectionP80RunMin\":69,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12163\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":23,\"actualDelayMin\":0,\"predictedP50Min\":14.714363,\"absErrorMin\":14.714363,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":20,\"remainingHalts\":23,\"remainingKm\":1278,\"season\":3,\"sectionMeanRunMin\":40,\"sectionP80RunMin\":42,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12305\",\"runDate\":\"2026-09-06\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":8,\"actualDelayMin\":0,\"predictedP50Min\":13.639006,\"absErrorMin\":13.639006,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":0,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":17,\"remainingHalts\":5,\"remainingKm\":1207,\"season\":3,\"sectionMeanRunMin\":235,\"sectionP80RunMin\":243,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12953\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":3,\"targetHaltIndex\":8,\"actualDelayMin\":15,\"predictedP50Min\":28.291723,\"absErrorMin\":13.291723,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":15,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":15,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":19,\"remainingHalts\":9,\"remainingKm\":1197,\"season\":3,\"sectionMeanRunMin\":24,\"sectionP80RunMin\":28,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12163\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":9,\"targetHaltIndex\":13,\"actualDelayMin\":0,\"predictedP50Min\":12.94461,\"absErrorMin\":12.94461,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":5,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":5,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":8,\"remainingHalts\":14,\"remainingKm\":619,\"season\":3,\"sectionMeanRunMin\":42,\"sectionP80RunMin\":48,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12951\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":0,\"targetHaltIndex\":3,\"actualDelayMin\":14,\"predictedP50Min\":1.797563,\"absErrorMin\":12.202437,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":17,\"remainingHalts\":7,\"remainingKm\":1373,\"season\":3,\"sectionMeanRunMin\":32,\"sectionP80RunMin\":35,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12951\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":3,\"targetHaltIndex\":4,\"actualDelayMin\":0,\"predictedP50Min\":12.15698,\"absErrorMin\":12.15698,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":14,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":14,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":21,\"remainingHalts\":4,\"remainingKm\":982,\"season\":3,\"sectionMeanRunMin\":226,\"sectionP80RunMin\":247,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12951\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":3,\"targetHaltIndex\":4,\"actualDelayMin\":0,\"predictedP50Min\":12.15698,\"absErrorMin\":12.15698,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":14,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":14,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":21,\"remainingHalts\":4,\"remainingKm\":982,\"season\":3,\"sectionMeanRunMin\":226,\"sectionP80RunMin\":247,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12313\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":7,\"actualDelayMin\":0,\"predictedP50Min\":11.570775,\"absErrorMin\":11.570775,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":16,\"remainingHalts\":7,\"remainingKm\":1448,\"season\":3,\"sectionMeanRunMin\":118,\"sectionP80RunMin\":118,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12163\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":15,\"targetHaltIndex\":16,\"actualDelayMin\":12,\"predictedP50Min\":1.461775,\"absErrorMin\":10.538225,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":4,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":4,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":12,\"remainingHalts\":8,\"remainingKm\":376,\"season\":3,\"sectionMeanRunMin\":59,\"sectionP80RunMin\":69,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12259\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":4,\"actualDelayMin\":11,\"predictedP50Min\":0.463471,\"absErrorMin\":10.536529,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":1,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":1,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":6,\"remainingHalts\":1,\"remainingKm\":430,\"season\":3,\"sectionMeanRunMin\":330,\"sectionP80RunMin\":392,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12259\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":3,\"targetHaltIndex\":4,\"actualDelayMin\":11,\"predictedP50Min\":0.463471,\"absErrorMin\":10.536529,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":1,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":1,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":6,\"remainingHalts\":1,\"remainingKm\":430,\"season\":3,\"sectionMeanRunMin\":330,\"sectionP80RunMin\":392,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12259\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":3,\"targetHaltIndex\":4,\"actualDelayMin\":11,\"predictedP50Min\":0.463471,\"absErrorMin\":10.536529,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":1,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":1,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":6,\"remainingHalts\":1,\"remainingKm\":430,\"season\":3,\"sectionMeanRunMin\":330,\"sectionP80RunMin\":392,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12163\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":9,\"targetHaltIndex\":23,\"actualDelayMin\":0,\"predictedP50Min\":-10.3342,\"absErrorMin\":10.3342,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":5,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":5,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":8,\"remainingHalts\":14,\"remainingKm\":619,\"season\":3,\"sectionMeanRunMin\":42,\"sectionP80RunMin\":48,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12631\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":0,\"targetHaltIndex\":6,\"actualDelayMin\":5,\"predictedP50Min\":15.225059,\"absErrorMin\":10.225059,\"provenance\":\"railradar\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":9,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":20,\"remainingHalts\":14,\"remainingKm\":649,\"season\":3,\"sectionMeanRunMin\":28,\"sectionP80RunMin\":28,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12163\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":21,\"targetHaltIndex\":23,\"actualDelayMin\":0,\"predictedP50Min\":-10.114794,\"absErrorMin\":10.114794,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-12,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":17,\"remainingHalts\":2,\"remainingKm\":75,\"season\":3,\"sectionMeanRunMin\":48,\"sectionP80RunMin\":53,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12001\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":9,\"actualDelayMin\":13,\"predictedP50Min\":3.925187,\"absErrorMin\":9.074813,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":15,\"remainingHalts\":9,\"remainingKm\":688,\"season\":3,\"sectionMeanRunMin\":25,\"sectionP80RunMin\":31,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12001\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":6,\"targetHaltIndex\":7,\"actualDelayMin\":31,\"predictedP50Min\":21.945821,\"absErrorMin\":9.054179,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":22,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":22,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":20,\"remainingHalts\":3,\"remainingKm\":241,\"season\":3,\"sectionMeanRunMin\":52,\"sectionP80RunMin\":65,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12313\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":7,\"actualDelayMin\":0,\"predictedP50Min\":8.595894,\"absErrorMin\":8.595894,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":3,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":3,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":20,\"remainingHalts\":4,\"remainingKm\":1180,\"season\":3,\"sectionMeanRunMin\":168,\"sectionP80RunMin\":182,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12631\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":9,\"targetHaltIndex\":10,\"actualDelayMin\":12,\"predictedP50Min\":3.843441,\"absErrorMin\":8.156559,\"provenance\":\"railradar\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":4,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-1,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":3,\"remainingHalts\":5,\"remainingKm\":179,\"season\":3,\"sectionMeanRunMin\":39,\"sectionP80RunMin\":41,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12957\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":9,\"actualDelayMin\":0,\"predictedP50Min\":8.134749,\"absErrorMin\":8.134749,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":17,\"remainingHalts\":9,\"remainingKm\":931,\"season\":3,\"sectionMeanRunMin\":14,\"sectionP80RunMin\":16,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12163\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":23,\"actualDelayMin\":0,\"predictedP50Min\":7.402324,\"absErrorMin\":7.402324,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-11,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":6,\"remainingHalts\":17,\"remainingKm\":691,\"season\":3,\"sectionMeanRunMin\":25,\"sectionP80RunMin\":35,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12001\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":0,\"targetHaltIndex\":3,\"actualDelayMin\":0,\"predictedP50Min\":6.296494,\"absErrorMin\":6.296494,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":15,\"remainingHalts\":9,\"remainingKm\":688,\"season\":3,\"sectionMeanRunMin\":25,\"sectionP80RunMin\":31,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12301\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":7,\"actualDelayMin\":9,\"predictedP50Min\":15.245455,\"absErrorMin\":6.245455,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":11,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":11,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":22,\"remainingHalts\":4,\"remainingKm\":982,\"season\":3,\"sectionMeanRunMin\":163,\"sectionP80RunMin\":175,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12953\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":9,\"targetHaltIndex\":12,\"actualDelayMin\":-4,\"predictedP50Min\":2.219462,\"absErrorMin\":6.219462,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":5,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-4,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":5,\"remainingHalts\":3,\"remainingKm\":448,\"season\":3,\"sectionMeanRunMin\":88,\"sectionP80RunMin\":105,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12163\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":15,\"targetHaltIndex\":19,\"actualDelayMin\":8,\"predictedP50Min\":2.023358,\"absErrorMin\":5.976642,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":4,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":4,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":12,\"remainingHalts\":8,\"remainingKm\":376,\"season\":3,\"sectionMeanRunMin\":59,\"sectionP80RunMin\":69,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12313\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":3,\"targetHaltIndex\":5,\"actualDelayMin\":0,\"predictedP50Min\":5.904078,\"absErrorMin\":5.904078,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":3,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":3,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":20,\"remainingHalts\":4,\"remainingKm\":1180,\"season\":3,\"sectionMeanRunMin\":168,\"sectionP80RunMin\":182,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12305\",\"runDate\":\"2026-09-06\",\"horizon\":\"next\",\"currentHaltIndex\":6,\"targetHaltIndex\":7,\"actualDelayMin\":0,\"predictedP50Min\":5.833948,\"absErrorMin\":5.833948,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":1,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":2,\"remainingHalts\":2,\"remainingKm\":625,\"season\":3,\"sectionMeanRunMin\":147,\"sectionP80RunMin\":150,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12957\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":3,\"targetHaltIndex\":5,\"actualDelayMin\":0,\"predictedP50Min\":5.596544,\"absErrorMin\":5.596544,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":2,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":2,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":20,\"remainingHalts\":6,\"remainingKm\":798,\"season\":3,\"sectionMeanRunMin\":49,\"sectionP80RunMin\":60,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12301\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":7,\"actualDelayMin\":9,\"predictedP50Min\":3.781462,\"absErrorMin\":5.218538,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":9,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-2,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":5,\"remainingHalts\":1,\"remainingKm\":431,\"season\":3,\"sectionMeanRunMin\":330,\"sectionP80RunMin\":392,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12301\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":6,\"targetHaltIndex\":7,\"actualDelayMin\":9,\"predictedP50Min\":3.781462,\"absErrorMin\":5.218538,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":9,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-2,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":5,\"remainingHalts\":1,\"remainingKm\":431,\"season\":3,\"sectionMeanRunMin\":330,\"sectionP80RunMin\":392,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12301\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":6,\"targetHaltIndex\":7,\"actualDelayMin\":9,\"predictedP50Min\":3.781462,\"absErrorMin\":5.218538,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":9,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-2,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":5,\"remainingHalts\":1,\"remainingKm\":431,\"season\":3,\"sectionMeanRunMin\":330,\"sectionP80RunMin\":392,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12957\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":9,\"actualDelayMin\":0,\"predictedP50Min\":-5.21766,\"absErrorMin\":5.21766,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":4,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":2,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":3,\"remainingHalts\":3,\"remainingKm\":308,\"season\":3,\"sectionMeanRunMin\":206,\"sectionP80RunMin\":206,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12631\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":6,\"targetHaltIndex\":7,\"actualDelayMin\":0,\"predictedP50Min\":5.13764,\"absErrorMin\":5.13764,\"provenance\":\"railradar\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":5,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":-14,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":23,\"remainingHalts\":8,\"remainingKm\":437,\"season\":3,\"sectionMeanRunMin\":125,\"sectionP80RunMin\":158,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12301\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":7,\"actualDelayMin\":9,\"predictedP50Min\":13.906372,\"absErrorMin\":4.906372,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":16,\"remainingHalts\":7,\"remainingKm\":1438,\"season\":3,\"sectionMeanRunMin\":180,\"sectionP80RunMin\":180,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12957\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":3,\"targetHaltIndex\":4,\"actualDelayMin\":10,\"predictedP50Min\":5.137184,\"absErrorMin\":4.862816,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":2,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":2,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":20,\"remainingHalts\":6,\"remainingKm\":798,\"season\":3,\"sectionMeanRunMin\":49,\"sectionP80RunMin\":60,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12953\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":9,\"targetHaltIndex\":11,\"actualDelayMin\":0,\"predictedP50Min\":4.68575,\"absErrorMin\":4.68575,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":5,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-4,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":5,\"remainingHalts\":3,\"remainingKm\":448,\"season\":3,\"sectionMeanRunMin\":88,\"sectionP80RunMin\":105,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12957\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":6,\"targetHaltIndex\":7,\"actualDelayMin\":0,\"predictedP50Min\":4.660317,\"absErrorMin\":4.660317,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":4,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":2,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":3,\"remainingHalts\":3,\"remainingKm\":308,\"season\":3,\"sectionMeanRunMin\":206,\"sectionP80RunMin\":206,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12957\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":6,\"targetHaltIndex\":7,\"actualDelayMin\":0,\"predictedP50Min\":4.660317,\"absErrorMin\":4.660317,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":4,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":2,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":3,\"remainingHalts\":3,\"remainingKm\":308,\"season\":3,\"sectionMeanRunMin\":206,\"sectionP80RunMin\":206,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12163\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":18,\"targetHaltIndex\":23,\"actualDelayMin\":0,\"predictedP50Min\":-4.55163,\"absErrorMin\":4.55163,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":12,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":8,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":15,\"remainingHalts\":5,\"remainingKm\":217,\"season\":3,\"sectionMeanRunMin\":28,\"sectionP80RunMin\":33,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12305\",\"runDate\":\"2026-09-06\",\"horizon\":\"next\",\"currentHaltIndex\":0,\"targetHaltIndex\":1,\"actualDelayMin\":0,\"predictedP50Min\":4.29753,\"absErrorMin\":4.29753,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":0,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":14,\"remainingHalts\":8,\"remainingKm\":1516,\"season\":3,\"sectionMeanRunMin\":68,\"sectionP80RunMin\":80,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12001\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":9,\"actualDelayMin\":13,\"predictedP50Min\":17.275842,\"absErrorMin\":4.275842,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":22,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":22,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":20,\"remainingHalts\":3,\"remainingKm\":241,\"season\":3,\"sectionMeanRunMin\":52,\"sectionP80RunMin\":65,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12631\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":3,\"targetHaltIndex\":4,\"actualDelayMin\":24,\"predictedP50Min\":19.997779,\"absErrorMin\":4.002221,\"provenance\":\"railradar\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":19,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":10,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":21,\"remainingHalts\":11,\"remainingKm\":558,\"season\":3,\"sectionMeanRunMin\":23,\"sectionP80RunMin\":23,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12953\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":6,\"targetHaltIndex\":7,\"actualDelayMin\":22,\"predictedP50Min\":18.030231,\"absErrorMin\":3.969769,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":9,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":-6,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":21,\"remainingHalts\":6,\"remainingKm\":1045,\"season\":3,\"sectionMeanRunMin\":60,\"sectionP80RunMin\":65,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12631\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":0,\"targetHaltIndex\":1,\"actualDelayMin\":15,\"predictedP50Min\":11.17417,\"absErrorMin\":3.82583,\"provenance\":\"railradar\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":9,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":20,\"remainingHalts\":14,\"remainingKm\":649,\"season\":3,\"sectionMeanRunMin\":28,\"sectionP80RunMin\":28,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12951\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":7,\"actualDelayMin\":0,\"predictedP50Min\":3.790647,\"absErrorMin\":3.790647,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":17,\"remainingHalts\":7,\"remainingKm\":1373,\"season\":3,\"sectionMeanRunMin\":32,\"sectionP80RunMin\":35,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12953\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":6,\"targetHaltIndex\":8,\"actualDelayMin\":15,\"predictedP50Min\":18.789224,\"absErrorMin\":3.789224,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":9,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":-6,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":21,\"remainingHalts\":6,\"remainingKm\":1045,\"season\":3,\"sectionMeanRunMin\":60,\"sectionP80RunMin\":65,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12313\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":7,\"actualDelayMin\":0,\"predictedP50Min\":-3.681279,\"absErrorMin\":3.681279,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-3,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":5,\"remainingHalts\":1,\"remainingKm\":430,\"season\":3,\"sectionMeanRunMin\":330,\"sectionP80RunMin\":392,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12313\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":6,\"targetHaltIndex\":7,\"actualDelayMin\":0,\"predictedP50Min\":-3.681279,\"absErrorMin\":3.681279,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-3,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":5,\"remainingHalts\":1,\"remainingKm\":430,\"season\":3,\"sectionMeanRunMin\":330,\"sectionP80RunMin\":392,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12313\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":6,\"targetHaltIndex\":7,\"actualDelayMin\":0,\"predictedP50Min\":-3.681279,\"absErrorMin\":3.681279,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-3,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":5,\"remainingHalts\":1,\"remainingKm\":430,\"season\":3,\"sectionMeanRunMin\":330,\"sectionP80RunMin\":392,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12313\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":0,\"targetHaltIndex\":1,\"actualDelayMin\":9,\"predictedP50Min\":5.39088,\"absErrorMin\":3.60912,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":16,\"remainingHalts\":7,\"remainingKm\":1448,\"season\":3,\"sectionMeanRunMin\":118,\"sectionP80RunMin\":118,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12953\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":3,\"targetHaltIndex\":4,\"actualDelayMin\":19,\"predictedP50Min\":15.594226,\"absErrorMin\":3.405774,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":15,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":15,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":19,\"remainingHalts\":9,\"remainingKm\":1197,\"season\":3,\"sectionMeanRunMin\":24,\"sectionP80RunMin\":28,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12163\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":18,\"targetHaltIndex\":19,\"actualDelayMin\":8,\"predictedP50Min\":11.374017,\"absErrorMin\":3.374017,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":12,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":8,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":15,\"remainingHalts\":5,\"remainingKm\":217,\"season\":3,\"sectionMeanRunMin\":28,\"sectionP80RunMin\":33,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12313\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":0,\"targetHaltIndex\":3,\"actualDelayMin\":3,\"predictedP50Min\":6.320714,\"absErrorMin\":3.320714,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":16,\"remainingHalts\":7,\"remainingKm\":1448,\"season\":3,\"sectionMeanRunMin\":118,\"sectionP80RunMin\":118,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12163\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":12,\"targetHaltIndex\":13,\"actualDelayMin\":0,\"predictedP50Min\":-3.249914,\"absErrorMin\":3.249914,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-5,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":9,\"remainingHalts\":11,\"remainingKm\":504,\"season\":3,\"sectionMeanRunMin\":60,\"sectionP80RunMin\":70,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12953\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":0,\"targetHaltIndex\":1,\"actualDelayMin\":0,\"predictedP50Min\":3.164474,\"absErrorMin\":3.164474,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":17,\"remainingHalts\":12,\"remainingKm\":1366,\"season\":3,\"sectionMeanRunMin\":21,\"sectionP80RunMin\":22,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12957\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":0,\"targetHaltIndex\":1,\"actualDelayMin\":0,\"predictedP50Min\":3.137184,\"absErrorMin\":3.137184,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":17,\"remainingHalts\":9,\"remainingKm\":931,\"season\":3,\"sectionMeanRunMin\":14,\"sectionP80RunMin\":16,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12163\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":21,\"targetHaltIndex\":22,\"actualDelayMin\":0,\"predictedP50Min\":-3.066394,\"absErrorMin\":3.066394,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-12,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":17,\"remainingHalts\":2,\"remainingKm\":75,\"season\":3,\"sectionMeanRunMin\":48,\"sectionP80RunMin\":53,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12163\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":18,\"targetHaltIndex\":22,\"actualDelayMin\":0,\"predictedP50Min\":2.842603,\"absErrorMin\":2.842603,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":12,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":8,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":15,\"remainingHalts\":5,\"remainingKm\":217,\"season\":3,\"sectionMeanRunMin\":28,\"sectionP80RunMin\":33,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12313\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":3,\"targetHaltIndex\":4,\"actualDelayMin\":2,\"predictedP50Min\":4.818328,\"absErrorMin\":2.818328,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":3,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":3,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":20,\"remainingHalts\":4,\"remainingKm\":1180,\"season\":3,\"sectionMeanRunMin\":168,\"sectionP80RunMin\":182,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12301\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":0,\"targetHaltIndex\":1,\"actualDelayMin\":3,\"predictedP50Min\":5.39088,\"absErrorMin\":2.39088,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":16,\"remainingHalts\":7,\"remainingKm\":1438,\"season\":3,\"sectionMeanRunMin\":180,\"sectionP80RunMin\":180,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12301\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":0,\"targetHaltIndex\":1,\"actualDelayMin\":3,\"predictedP50Min\":5.39088,\"absErrorMin\":2.39088,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":16,\"remainingHalts\":7,\"remainingKm\":1438,\"season\":3,\"sectionMeanRunMin\":180,\"sectionP80RunMin\":180,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12305\",\"runDate\":\"2026-09-06\",\"horizon\":\"plus3h\",\"currentHaltIndex\":0,\"targetHaltIndex\":2,\"actualDelayMin\":0,\"predictedP50Min\":2.375902,\"absErrorMin\":2.375902,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":0,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":14,\"remainingHalts\":8,\"remainingKm\":1516,\"season\":3,\"sectionMeanRunMin\":68,\"sectionP80RunMin\":80,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12305\",\"runDate\":\"2026-09-06\",\"horizon\":\"next\",\"currentHaltIndex\":3,\"targetHaltIndex\":4,\"actualDelayMin\":0,\"predictedP50Min\":2.316086,\"absErrorMin\":2.316086,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":0,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":17,\"remainingHalts\":5,\"remainingKm\":1207,\"season\":3,\"sectionMeanRunMin\":235,\"sectionP80RunMin\":243,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12305\",\"runDate\":\"2026-09-06\",\"horizon\":\"plus3h\",\"currentHaltIndex\":3,\"targetHaltIndex\":4,\"actualDelayMin\":0,\"predictedP50Min\":2.316086,\"absErrorMin\":2.316086,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":0,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":17,\"remainingHalts\":5,\"remainingKm\":1207,\"season\":3,\"sectionMeanRunMin\":235,\"sectionP80RunMin\":243,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12957\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":0,\"targetHaltIndex\":4,\"actualDelayMin\":10,\"predictedP50Min\":12.263843,\"absErrorMin\":2.263843,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":17,\"remainingHalts\":9,\"remainingKm\":931,\"season\":3,\"sectionMeanRunMin\":14,\"sectionP80RunMin\":16,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12001\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":0,\"targetHaltIndex\":1,\"actualDelayMin\":1,\"predictedP50Min\":3.137184,\"absErrorMin\":2.137184,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":15,\"remainingHalts\":9,\"remainingKm\":688,\"season\":3,\"sectionMeanRunMin\":25,\"sectionP80RunMin\":31,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12951\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":6,\"targetHaltIndex\":7,\"actualDelayMin\":0,\"predictedP50Min\":-2.045915,\"absErrorMin\":2.045915,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-14,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":3,\"remainingHalts\":1,\"remainingKm\":455,\"season\":3,\"sectionMeanRunMin\":315,\"sectionP80RunMin\":360,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12951\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":6,\"targetHaltIndex\":7,\"actualDelayMin\":0,\"predictedP50Min\":-2.045915,\"absErrorMin\":2.045915,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-14,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":3,\"remainingHalts\":1,\"remainingKm\":455,\"season\":3,\"sectionMeanRunMin\":315,\"sectionP80RunMin\":360,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12951\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":6,\"targetHaltIndex\":7,\"actualDelayMin\":0,\"predictedP50Min\":-2.045915,\"absErrorMin\":2.045915,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-14,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":3,\"remainingHalts\":1,\"remainingKm\":455,\"season\":3,\"sectionMeanRunMin\":315,\"sectionP80RunMin\":360,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12631\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":12,\"targetHaltIndex\":13,\"actualDelayMin\":9,\"predictedP50Min\":10.333919,\"absErrorMin\":1.333919,\"provenance\":\"railradar\",\"zone\":\"SR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":10,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":6,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":5,\"remainingHalts\":2,\"remainingKm\":87,\"season\":3,\"sectionMeanRunMin\":19,\"sectionP80RunMin\":24,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12953\",\"runDate\":\"2026-09-03\",\"horizon\":\"next\",\"currentHaltIndex\":9,\"targetHaltIndex\":10,\"actualDelayMin\":7,\"predictedP50Min\":5.860729,\"absErrorMin\":1.139271,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":5,\"dayOfJourney\":1,\"dayOfWeek\":5,\"delayTrendMin\":-4,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":5,\"remainingHalts\":3,\"remainingKm\":448,\"season\":3,\"sectionMeanRunMin\":88,\"sectionP80RunMin\":105,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12957\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":3,\"targetHaltIndex\":9,\"actualDelayMin\":0,\"predictedP50Min\":1.008091,\"absErrorMin\":1.008091,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":2,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":2,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":20,\"remainingHalts\":6,\"remainingKm\":798,\"season\":3,\"sectionMeanRunMin\":49,\"sectionP80RunMin\":60,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12259\",\"runDate\":\"2026-09-03\",\"horizon\":\"destination\",\"currentHaltIndex\":0,\"targetHaltIndex\":4,\"actualDelayMin\":11,\"predictedP50Min\":10.126413,\"absErrorMin\":0.873587,\"provenance\":\"railradar\",\"zone\":\"UNZ\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":18,\"remainingHalts\":4,\"remainingKm\":1448,\"season\":3,\"sectionMeanRunMin\":201,\"sectionP80RunMin\":201,\"speedDeviationKmph\":0,\"weatherCode\":0}},{\"trainNo\":\"12953\",\"runDate\":\"2026-09-03\",\"horizon\":\"plus3h\",\"currentHaltIndex\":0,\"targetHaltIndex\":5,\"actualDelayMin\":9,\"predictedP50Min\":9.840144,\"absErrorMin\":0.840144,\"provenance\":\"railradar\",\"zone\":\"WR\",\"trainClass\":\"Express\",\"features\":{\"currentDelayMin\":0,\"dayOfJourney\":1,\"dayOfWeek\":4,\"delayTrendMin\":0,\"downstreamOccupancy\":0,\"dwellOverrunMin\":0,\"hourOfDay\":17,\"remainingHalts\":12,\"remainingKm\":1366,\"season\":3,\"sectionMeanRunMin\":21,\"sectionP80RunMin\":22,\"speedDeviationKmph\":0,\"weatherCode\":0}}]}")
};
var HORIZONS = [
	"next",
	"plus3h",
	"destination"
];
Number.POSITIVE_INFINITY;
var report = report_default;
var HORIZON_LABEL = {
	next: "Next halt",
	plus3h: "+3 hours",
	destination: "Destination"
};
function fmtMin$1(value) {
	return `${value.toFixed(1)} min`;
}
function fmtPct(value, digits = 1) {
	return `${value.toFixed(digits)}%`;
}
function coveragePct(value) {
	return fmtPct(value * 100, 1);
}
function SliceTable({ title, rows }) {
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border/70 bg-secondary/20 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold text-foreground",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-[11px] text-muted-foreground",
			children: "No rows in this slice."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border/70 bg-secondary/20 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold text-foreground",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 space-y-1",
			children: rows.slice(0, 6).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center justify-between gap-2 text-[11px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "truncate text-muted-foreground",
					children: [
						row.key,
						" · n=",
						row.n
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-foreground",
					children: fmtMin$1(row.mae)
				})]
			}, row.key))
		})]
	});
}
function CohortBody({ cohort, emptyHint }) {
	const next = cohort.horizons.next;
	const dest = cohort.horizons.destination;
	const reliability = next.calibration.reliability.map((bin) => ({
		bin: bin.bin,
		predicted: bin.predictedMean,
		observed: bin.observedMean
	}));
	if (cohort.n === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: emptyHint
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border/80 bg-background/60 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] uppercase tracking-wide text-muted-foreground",
								children: "Next halt vs Baseline B"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: `mt-1 text-2xl font-bold ${next.improvementVsBPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}`,
								children: [
									next.improvementVsBPct >= 0 ? "−" : "+",
									fmtPct(Math.abs(next.improvementVsBPct)),
									" MAE"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-[11px] text-muted-foreground",
								children: [
									"Model ",
									fmtMin$1(next.model.mae),
									" vs IR method ",
									fmtMin$1(next.baselineB.mae),
									" · n=",
									next.n
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border/80 bg-background/60 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] uppercase tracking-wide text-muted-foreground",
								children: "P80 coverage"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-2xl font-bold text-foreground",
								children: coveragePct(next.calibration.p80Coverage)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-[11px] text-muted-foreground",
								children: [
									"Target 80%. Destination P80 is ",
									coveragePct(dest.calibration.p80Coverage),
									" (compounds sectional error)."
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border/80 bg-background/60 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] uppercase tracking-wide text-muted-foreground",
								children: "Hold-out size"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-2xl font-bold text-foreground",
								"data-testid": "eval-holdout-n",
								children: cohort.n
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-[11px] text-muted-foreground",
								children: [
									"Walk-forward test predictions across ",
									HORIZONS.length,
									" horizons."
								]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[36rem] text-left text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "Horizon"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "Model MAE"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "A schedule"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "B IR"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "C persist"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "vs B"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "P80"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: HORIZONS.map((horizon) => {
						const block = cohort.horizons[horizon];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-2 pr-3 font-medium text-foreground",
									children: HORIZON_LABEL[horizon]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-2 pr-3 font-mono",
									children: fmtMin$1(block.model.mae)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-2 pr-3 font-mono text-muted-foreground",
									children: fmtMin$1(block.baselineA.mae)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-2 pr-3 font-mono",
									children: fmtMin$1(block.baselineB.mae)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-2 pr-3 font-mono text-muted-foreground",
									children: fmtMin$1(block.baselineC.mae)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "py-2 pr-3 font-mono",
									children: [block.improvementVsBPct >= 0 ? "−" : "+", fmtPct(Math.abs(block.improvementVsBPct))]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-2 font-mono",
									children: coveragePct(block.calibration.p80Coverage)
								})
							]
						}, horizon);
					}) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "text-xs font-semibold text-foreground",
					children: "Reliability (next-halt P50 bins)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-[11px] text-muted-foreground",
					children: "Predicted mean delay versus realised mean delay. A calibrated model sits on the diagonal."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 h-48",
					children: reliability.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No reliability bins."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReliabilityChart, { data: reliability })
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliceTable, {
						title: "By zone",
						rows: next.breakdowns.zone
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliceTable, {
						title: "By train class",
						rows: next.breakdowns.trainClass
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliceTable, {
						title: "By hour (IST)",
						rows: next.breakdowns.hour
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliceTable, {
						title: "By day of journey",
						rows: next.breakdowns.dayOfJourney
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliceTable, {
						title: "By delay magnitude",
						rows: next.breakdowns.delayMagnitude
					})
				]
			})
		]
	});
}
function ReliabilityChart({ data }) {
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setMounted(true);
	}, []);
	if (!mounted) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Loading reliability chart…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height: "100%",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
			data,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					strokeDasharray: "3 3",
					stroke: "var(--border)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					dataKey: "bin",
					fontSize: 11,
					stroke: "var(--muted-foreground)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					fontSize: 11,
					stroke: "var(--muted-foreground)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
					background: "var(--card)",
					border: "1px solid var(--border)",
					borderRadius: 12
				} }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					dataKey: "predicted",
					name: "Predicted P50",
					fill: "#38bdf8",
					radius: [
						6,
						6,
						0,
						0
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					dataKey: "observed",
					name: "Observed",
					fill: "#f59e0b",
					radius: [
						6,
						6,
						0,
						0
					]
				})
			]
		})
	});
}
function ModelEvalPanel() {
	const [cohort, setCohort] = (0, import_react.useState)("synthetic");
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setHydrated(true);
	}, []);
	const selected = cohort === "synthetic" ? report.synthetic : report.real;
	const nextImprove = report.synthetic.horizons.next.improvementVsBPct;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl border border-border bg-card p-5 shadow-card",
		"data-testid": "eval-panel",
		"data-eval-hydrated": hydrated ? "true" : "false",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "flex items-center gap-2 text-sm font-semibold text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "size-4 text-primary" }), "Walk-forward evaluation vs official IR method"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-0.5 max-w-2xl text-xs text-muted-foreground",
					children: [
						"Hold-out MAE against Baseline B (schedule + current delay + recovery). Synthetic and railradar rows are scored on identical folds and never blended. Source: eval/report.json · model ",
						report.modelVersion,
						" · ",
						report.foldCount,
						" folds."
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative z-10 flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 p-1 text-[11px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"data-testid": "eval-cohort-synthetic",
						"data-eval-active": cohort === "synthetic" ? "true" : "false",
						className: `rounded-full px-3 py-1 font-medium transition-colors ${cohort === "synthetic" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"}`,
						onClick: () => setCohort("synthetic"),
						onPointerDown: () => setCohort("synthetic"),
						children: ["Synthetic · ", report.synthetic.n]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"data-testid": "eval-cohort-real",
						"data-eval-active": cohort === "real" ? "true" : "false",
						className: `rounded-full px-3 py-1 font-medium transition-colors ${cohort === "real" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"}`,
						onClick: () => setCohort("real"),
						onPointerDown: () => setCohort("real"),
						children: ["Real · ", report.real.n]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1 rounded-full border border-border bg-secondary/50 px-2 py-0.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3" }),
						"Synthetic next-halt ",
						nextImprove >= 0 ? "beats" : "trails",
						" B by",
						" ",
						fmtPct(Math.abs(nextImprove))
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1 rounded-full border border-border bg-secondary/50 px-2 py-0.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareSplitVertical, { className: "size-3" }), "A = schedule · B = IR recovery · C = persistence"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CohortBody, {
					cohort: selected,
					emptyHint: cohort === "real" ? "No railradar hold-out in this report. Harvest live runs, then npm run eval." : "No synthetic hold-out in this report. Run npm run eval to generate one."
				})
			})
		]
	});
}
function haltKey(trainNo, runDate, stationCode) {
	return `${trainNo}|${runDate}|${stationCode}`;
}
function withOptional(row, key, value) {
	if (value === void 0) return row;
	return {
		...row,
		[key]: value
	};
}
/**
* Join each realised arrival to **every** earlier prediction for that halt.
* Predictions issued after the arrival are excluded.
*/
function joinResiduals(predictions, arrivals) {
	const byHalt = /* @__PURE__ */ new Map();
	for (const pred of predictions) {
		const key = haltKey(pred.trainNo, pred.runDate, pred.stationCode);
		const list = byHalt.get(key);
		if (list) list.push(pred);
		else byHalt.set(key, [pred]);
	}
	const rows = [];
	for (const arrival of arrivals) {
		const preds = byHalt.get(haltKey(arrival.trainNo, arrival.runDate, arrival.stationCode));
		if (!preds) continue;
		for (const pred of preds) {
			if (pred.sequence !== arrival.sequence) continue;
			if (pred.predictedAt > arrival.arrivedAt) continue;
			const residualMin = arrival.actualDelayMin - pred.predictedDelayMin;
			let row = {
				trainNo: arrival.trainNo,
				runDate: arrival.runDate,
				stationCode: arrival.stationCode,
				sequence: arrival.sequence,
				predictedAt: pred.predictedAt,
				arrivedAt: arrival.arrivedAt,
				predictedDelayMin: pred.predictedDelayMin,
				actualDelayMin: arrival.actualDelayMin,
				residualMin,
				horizonMin: (arrival.arrivedAt - pred.predictedAt) / 6e4,
				modelVersion: pred.modelVersion
			};
			row = withOptional(row, "fromStationCode", pred.fromStationCode);
			row = withOptional(row, "toStationCode", pred.toStationCode);
			row = withOptional(row, "zone", pred.zone);
			row = withOptional(row, "trainClass", pred.trainClass);
			rows.push(row);
		}
	}
	rows.sort((a, b) => a.predictedAt - b.predictedAt || a.arrivedAt - b.arrivedAt);
	return rows;
}
function calError(coverage) {
	return Math.abs(coverage - REFINE_POLICY.targetP80);
}
function maeImproveMargin(championMae) {
	return Math.max(championMae * REFINE_POLICY.maeImproveRelative, REFINE_POLICY.maeImproveFloorMin);
}
/**
* Promote only if hold-out MAE beats the champion by the preset margin
* **and** calibration error `|p80 − 0.8|` does not increase.
*/
function evaluatePromotion(champion, challenger) {
	const maeDeltaMin = champion.maeMin - challenger.maeMin;
	const maeImproved = maeDeltaMin >= maeImproveMargin(champion.maeMin);
	const championCalError = calError(champion.p80Coverage);
	const challengerCalError = calError(challenger.p80Coverage);
	const calibrationOk = challengerCalError <= championCalError + 1e-12;
	const promoted = maeImproved && calibrationOk;
	let reason = "promoted";
	if (!maeImproved && !calibrationOk) reason = "rejected: MAE margin and calibration";
	else if (!maeImproved) reason = "rejected: MAE did not beat champion by the required margin";
	else if (!calibrationOk) reason = "rejected: calibration regressed";
	return {
		promoted,
		reason,
		maeImproved,
		calibrationOk,
		maeDeltaMin,
		championCalError,
		challengerCalError
	};
}
function wrap(artifact, registeredAt) {
	return {
		artifact,
		metrics: artifact.metrics,
		registeredAt
	};
}
var ModelRegistry = class {
	championModel;
	previousModel;
	log = [];
	clock;
	constructor(now = 1) {
		this.clock = now;
	}
	get champion() {
		return this.championModel;
	}
	get previous() {
		return this.previousModel;
	}
	get history() {
		return this.log;
	}
	seedChampion(artifact) {
		const entry = wrap(artifact, this.clock++);
		this.championModel = entry;
		this.previousModel = void 0;
		this.log.push(entry);
		return entry;
	}
	consider(challenger) {
		if (!this.championModel) {
			this.seedChampion(challenger);
			return {
				promoted: true,
				reason: "promoted: first champion",
				maeImproved: true,
				calibrationOk: true,
				maeDeltaMin: 0,
				championCalError: calError(challenger.metrics.p80Coverage),
				challengerCalError: calError(challenger.metrics.p80Coverage)
			};
		}
		const decision = evaluatePromotion(this.championModel.metrics, challenger.metrics);
		if (!decision.promoted) return decision;
		this.previousModel = this.championModel;
		const entry = wrap(challenger, this.clock++);
		this.championModel = entry;
		this.log.push(entry);
		return decision;
	}
	/**
	* Restore the previous champion artifact **and** its metrics.
	* The displaced challenger is kept as `previous` so a second rollback is a no-op swap.
	*/
	rollback() {
		if (!this.previousModel || !this.championModel) throw new Error("no previous champion to restore");
		const restored = this.previousModel;
		this.previousModel = this.championModel;
		this.championModel = restored;
		this.log.push({
			...restored,
			registeredAt: this.clock++
		});
		return restored;
	}
};
var ZERO_LEAF = {
	kind: "leaf",
	value: 0
};
/** Metric-bearing stub used by registry tests and the retrain loop. */
function stubArtifact(version, metrics, extras) {
	return {
		version,
		featureVersion: "1",
		trainedAt: extras?.trainedAt ?? 1,
		rowCount: extras?.rowCount ?? 10,
		provenance: "synthetic",
		featureOrder: [...FEATURE_ORDER],
		trees: {
			p10: [ZERO_LEAF],
			p50: [ZERO_LEAF],
			p80: [ZERO_LEAF],
			p90: [ZERO_LEAF]
		},
		metrics
	};
}
var RETRAIN_HISTORY_SEED = 20260904;
function mulberry32(seed) {
	let t = seed >>> 0;
	return () => {
		t += 1831565813;
		let r = Math.imul(t ^ t >>> 15, 1 | t);
		r ^= r + Math.imul(r ^ r >>> 7, 61 | r);
		return ((r ^ r >>> 14) >>> 0) / 4294967296;
	};
}
function mae(actual, predicted) {
	const n = Math.min(actual.length, predicted.length);
	if (n === 0) return 0;
	let sum = 0;
	for (let i = 0; i < n; i++) sum += Math.abs(actual[i] - predicted[i]);
	return sum / n;
}
function p80Coverage(actual, p80) {
	const n = Math.min(actual.length, p80.length);
	if (n === 0) return 0;
	let hits = 0;
	for (let i = 0; i < n; i++) if (actual[i] <= p80[i]) hits += 1;
	return hits / n;
}
/**
* Deterministic refinement loop used by the control-room chart and tests.
*
* A synthetically biased section is scored, residual-corrected within the day,
* then "retrained" (the next artifact absorbs most of the remaining bias).
* Champion/challenger promotion is the same gate the registry uses in production.
*/
function buildRetrainHistory(seed = RETRAIN_HISTORY_SEED) {
	resetResidualTable();
	const rng = mulberry32(seed);
	const registry = new ModelRegistry(seed);
	const points = [];
	const fromCode = "UJN";
	const toCode = "NAD";
	const trueDelay = 18;
	const n = 48;
	let modelBias = 8.4;
	let trainedAt = Date.parse("2026-09-01T00:00:00Z");
	const sampleDay = (bias, correct) => {
		const predicted = [];
		const actual = [];
		const p80 = [];
		const preds = [];
		const arrivals = [];
		for (let i = 0; i < n; i++) {
			const noise = (rng() - .5) * .6;
			const raw = trueDelay - bias + noise;
			const used = correct ? applyCorrection(fromCode, toCode, raw) : raw;
			predicted.push(used);
			actual.push(trueDelay);
			p80.push(used + 3.5);
			const predictedAt = trainedAt + i * 6e4;
			const arrivedAt = predictedAt + 27e5;
			preds.push({
				trainNo: "19305",
				runDate: "2026-09-01",
				stationCode: toCode,
				sequence: 4,
				predictedAt,
				predictedDelayMin: raw,
				p50Min: raw,
				p80Min: raw + 3.5,
				p90Min: raw + 5,
				modelVersion: "loop",
				fromStationCode: fromCode,
				toStationCode: toCode,
				zone: "WR",
				trainClass: "Exp"
			});
			arrivals.push({
				trainNo: "19305",
				runDate: "2026-09-01",
				stationCode: toCode,
				sequence: 4,
				actualDelayMin: trueDelay,
				arrivedAt
			});
		}
		return {
			predicted,
			actual,
			p80,
			preds,
			arrivals
		};
	};
	const record = (version, step, source, maeMin, coverage, promoted, reason) => {
		points.push({
			version,
			step,
			trainedAt,
			maeMin,
			p80Coverage: coverage,
			promoted,
			source,
			reason
		});
	};
	const baseline = sampleDay(modelBias, false);
	const championMae = mae(baseline.actual, baseline.predicted);
	const championCover = p80Coverage(baseline.actual, baseline.p80);
	const champion = stubArtifact("1.0.0", {
		maeMin: championMae,
		medaeMin: championMae * .85,
		rmseMin: championMae * 1.2,
		p80Coverage: championCover
	}, {
		trainedAt,
		rowCount: n
	});
	registry.seedChampion(champion);
	record("1.0.0", "v1.0.0", "champion", championMae, championCover, true, "seeded champion");
	for (let round = 1; round <= 4; round++) {
		trainedAt += 864e5;
		const day = sampleDay(modelBias, false);
		const residuals = joinResiduals(day.preds, day.arrivals);
		updateFromResiduals(residuals);
		const rawPred = residuals.map((row) => row.predictedDelayMin);
		const actual = residuals.map((row) => row.actualDelayMin);
		const afterResidual = rawPred.map((p) => applyCorrection(fromCode, toCode, p));
		const residualMae = mae(actual, afterResidual);
		const residualCover = p80Coverage(actual, afterResidual.map((v) => v + 3.5));
		record(`1.0.${round - 1}+residual`, `residual day ${round}`, "residual", residualMae, residualCover, false, "intra-day section bias correction");
		modelBias *= .42;
		resetResidualTable();
		const holdout = sampleDay(modelBias, false);
		const holdoutMae = mae(holdout.actual, holdout.predicted);
		const holdoutCover = p80Coverage(holdout.actual, holdout.p80);
		const challenger = stubArtifact(`1.0.${round}`, {
			maeMin: holdoutMae,
			medaeMin: holdoutMae * .85,
			rmseMin: holdoutMae * 1.2,
			p80Coverage: holdoutCover
		}, {
			trainedAt,
			rowCount: n
		});
		const decision = registry.consider(challenger);
		record(`1.0.${round}`, `v1.0.${round}`, "retrain", holdoutMae, holdoutCover, decision.promoted, decision.reason);
	}
	return points;
}
/** Precomputed once so the control-room chart and tests share the same loop output. */
var RETRAIN_HISTORY = buildRetrainHistory();
function promotedMaeSeries(history = RETRAIN_HISTORY) {
	return history.filter((point) => point.promoted).map((point) => point.maeMin);
}
function fmtMin(value) {
	return `${value.toFixed(2)} min`;
}
function RetrainAccuracyPanel() {
	const history = RETRAIN_HISTORY;
	const promoted = promotedMaeSeries(history);
	const firstMae = promoted[0] ?? history[0]?.maeMin ?? 0;
	const lastMae = promoted[promoted.length - 1] ?? history[history.length - 1]?.maeMin ?? firstMae;
	const improvedPct = firstMae > 0 ? (firstMae - lastMae) / firstMae * 100 : 0;
	const chart = history.map((point) => ({
		step: point.step,
		mae: Number(point.maeMin.toFixed(3)),
		promoted: point.promoted ? point.maeMin : null,
		residual: point.source === "residual" ? point.maeMin : null
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl border border-border bg-card p-5 shadow-card",
		"data-testid": "retrain-accuracy",
		"data-mae-first": String(firstMae),
		"data-mae-last": String(lastMae),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "flex items-center gap-2 text-sm font-semibold text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLine, { className: "size-4 text-primary" }), "Accuracy over retrains"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 max-w-2xl text-xs text-muted-foreground",
					children: "Hold-out MAE from the same residual-join → champion/challenger loop the tests run. Intra-day section bias correction sits between retrains; a challenger is promoted only when MAE improves and calibration does not regress."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1 rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-[11px] text-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-3 text-primary" }),
						"Promoted MAE ",
						fmtMin(firstMae),
						" → ",
						fmtMin(lastMae),
						" (",
						improvedPct.toFixed(0),
						"% lower)"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 h-56",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
						data: chart,
						margin: {
							top: 8,
							right: 8,
							left: 0,
							bottom: 0
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								strokeDasharray: "3 3",
								stroke: "var(--border)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "step",
								fontSize: 11,
								stroke: "var(--muted-foreground)",
								interval: 0
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								fontSize: 11,
								stroke: "var(--muted-foreground)",
								tickFormatter: (value) => value.toFixed(1),
								width: 42
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								contentStyle: {
									background: "var(--card)",
									border: "1px solid var(--border)",
									borderRadius: 8,
									fontSize: 12
								},
								formatter: (value) => [fmtMin(Number(value)), "MAE"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								type: "monotone",
								dataKey: "mae",
								stroke: "var(--primary)",
								strokeWidth: 2,
								dot: { r: 3 },
								name: "MAE"
							})
						]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-4 grid gap-1.5 sm:grid-cols-2",
				children: history.map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-secondary/20 px-2.5 py-1.5 text-[11px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "truncate text-muted-foreground",
						children: [point.step, point.promoted ? " · promoted" : ` · ${point.source}`]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-foreground",
						children: fmtMin(point.maeMin)
					})]
				}, `${point.version}-${point.step}`))
			})
		]
	});
}
var OVERLAP_MS = 12e5;
function risksFromSlip(incoming, board) {
	const risks = [];
	const seen = /* @__PURE__ */ new Set();
	const p80 = Date.parse(incoming.p80);
	const readyBy = formatIstClock(incoming.p90);
	for (const entry of board) {
		if (entry.trainNo === incoming.trainNo) continue;
		const other = Date.parse(entry.eta);
		if (Math.abs(other - p80) <= OVERLAP_MS) {
			seen.add(entry.trainNo);
			risks.push({
				trainNo: entry.trainNo,
				trainName: entry.trainName,
				kind: "platform-hold",
				detail: `P80 arrival overlaps ${entry.trainName} on platform ${entry.platform}`,
				readyBy
			});
		}
	}
	if (incoming.delayMin >= 45) {
		const downstream = board.find((row) => row.trainNo === "12001") ?? fallbackDownstream(incoming);
		if (downstream && !seen.has(downstream.trainNo) && downstream.trainNo !== incoming.trainNo) risks.push({
			trainNo: downstream.trainNo,
			trainName: downstream.trainName,
			kind: "connection",
			detail: `45+ min slip puts ${downstream.trainName} at risk at ${incoming.station}`,
			readyBy
		});
	}
	return risks;
}
function p80OverlapsBoard(incoming, board) {
	const p80Ms = Date.parse(incoming.p80);
	return board.some((row) => row.trainNo !== incoming.trainNo && Math.abs(Date.parse(row.eta) - p80Ms) <= OVERLAP_MS);
}
function fallbackDownstream(incoming) {
	const train = getTrain("12001");
	if (!train) return null;
	return {
		trainNo: train.number,
		trainName: train.name,
		eta: incoming.eta,
		p50: incoming.p50,
		p80: incoming.p80,
		p90: incoming.p90,
		delayMin: 0,
		platform: "—",
		source: incoming.source
	};
}
function CascadePanel({ incomingTrainNo = "12951", stationCode = "NDLS", incoming, boardEntries }) {
	const [fetchedIncoming, setFetchedIncoming] = (0, import_react.useState)(null);
	const [fetchedBoard, setFetchedBoard] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (incoming && boardEntries) return;
		let cancelled = false;
		async function load() {
			const [etaRes, boardRes] = await Promise.all([fetch(`/api/v2/eta?train=${encodeURIComponent(incomingTrainNo)}&station=${encodeURIComponent(stationCode)}`), fetch(`/api/v2/station/${encodeURIComponent(stationCode)}/board`)]);
			if (cancelled) return;
			if (etaRes.ok) setFetchedIncoming(await etaRes.json());
			if (boardRes.ok) {
				const body = await boardRes.json();
				setFetchedBoard(body.entries);
			}
		}
		load();
		const id = window.setInterval(() => void load(), 8e3);
		return () => {
			cancelled = true;
			window.clearInterval(id);
		};
	}, [
		incoming,
		boardEntries,
		incomingTrainNo,
		stationCode
	]);
	const eta = incoming ?? fetchedIncoming;
	const board = boardEntries ?? fetchedBoard;
	const risks = (0, import_react.useMemo)(() => eta ? risksFromSlip(eta, board) : [], [eta, board]);
	if (!eta) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "rounded-2xl border border-border bg-card p-4",
		"aria-label": "Cascade",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading cascade…"
		})
	});
	const overlapping = p80OverlapsBoard(eta, board);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl border border-border bg-card p-4",
		"aria-label": "Cascade",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-bold uppercase tracking-wide",
					children: "Cascade"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceTierBadge, { source: eta.source }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EtaConfidenceBadge, { confidence: eta.confidence })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				"data-engine-eta": eta.eta,
				children: [
					eta.trainNo,
					" P50 ",
					formatIstClock(eta.eta),
					" · P80 ",
					formatIstClock(eta.p80),
					" · delay",
					" ",
					eta.delayMin,
					" min"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 rounded-xl border border-border bg-secondary/30 px-3 py-2",
				"data-testid": "ops-actions",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold",
						children: "Ops actions"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm",
						children: overlapping ? "Platform-hold suggested — P80 arrival overlaps the next occupancy." : "No platform-hold: P80 is clear of the next occupancy."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm",
						children: [
							"Cleaning / crew ready by ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatIstClock(eta.p90) }),
							" (P90)."
						]
					})
				]
			}),
			risks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted-foreground",
				children: "No downstream services currently at risk."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 divide-y divide-border",
				"data-testid": "cascade-list",
				children: risks.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-semibold",
						children: [
							row.trainNo,
							" ",
							row.trainName
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							row.kind === "platform-hold" ? "Platform slot" : "Downstream",
							" · ",
							row.detail
						]
					})]
				}, `${row.kind}-${row.trainNo}`))
			})
		]
	});
}
var reasonColors = {
	weather: "#38bdf8",
	congestion: "#f59e0b",
	"track-work": "#fb923c",
	"signal-failure": "#ef4444",
	technical: "#a855f7",
	unknown: "#94a3b8"
};
var zoneColors = {
	NR: "#3b82f6",
	WR: "#10b981",
	CR: "#8b5cf6",
	ER: "#f59e0b",
	SR: "#ec4899",
	NCR: "#06b6d4",
	ECR: "#f97316",
	WCR: "#6366f1",
	SCR: "#14b8a6",
	SWR: "#84cc16",
	SER: "#eab308",
	Other: "#94a3b8"
};
/**
* Determine the primary Indian Railway Zone for a given station code or train route.
*/
function getStationZone(stationCode) {
	const code = stationCode.toUpperCase();
	if ([
		"NDLS",
		"DLI",
		"NZM",
		"ANVT",
		"LKO",
		"BSB",
		"MB",
		"ASR",
		"JUC",
		"UMB",
		"KLK",
		"CDG",
		"HW",
		"DDN",
		"JAT",
		"SVDK",
		"BE",
		"GZB"
	].includes(code)) return "NR";
	if ([
		"MMCT",
		"BDTS",
		"BVI",
		"ST",
		"BRC",
		"ADI",
		"RTM",
		"UJN",
		"RJT",
		"BVP",
		"INDB",
		"GDA",
		"BL",
		"VAPI"
	].includes(code)) return "WR";
	if ([
		"CSMT",
		"DR",
		"LTT",
		"TNA",
		"KYN",
		"PUNE",
		"NGP",
		"BSL",
		"MMR",
		"SUR",
		"KOP",
		"NK",
		"IGP",
		"DD"
	].includes(code)) return "CR";
	if ([
		"HWH",
		"SDAH",
		"KOAA",
		"ASN",
		"BWN",
		"MLDT",
		"BGP",
		"DGR",
		"RPH",
		"BDC"
	].includes(code)) return "ER";
	if ([
		"MAS",
		"MS",
		"TBM",
		"CBE",
		"MDU",
		"TPJ",
		"TVC",
		"ERS",
		"CLT",
		"CAN",
		"ALLP",
		"SA",
		"ED",
		"PGT",
		"KRR"
	].includes(code)) return "SR";
	if ([
		"CNB",
		"PRYJ",
		"ALJN",
		"AGC",
		"AF",
		"GWL",
		"JHS",
		"GOY",
		"TDL",
		"ETW",
		"FTP"
	].includes(code)) return "NCR";
	if ([
		"PNBE",
		"PPTA",
		"DNR",
		"MGS",
		"DDU",
		"GAYA",
		"MFP",
		"SPJ",
		"DBG",
		"DHN",
		"DOS",
		"ARA",
		"BXR"
	].includes(code)) return "ECR";
	if ([
		"JBP",
		"BPL",
		"RKMP",
		"KOTA",
		"SWM",
		"BINA",
		"ET",
		"KTE",
		"STA",
		"NU",
		"GUNA"
	].includes(code)) return "WCR";
	if ([
		"SC",
		"HYB",
		"KCG",
		"BZA",
		"TPTY",
		"GNT",
		"KZJ",
		"WL",
		"RU",
		"GTL",
		"NED",
		"MDR"
	].includes(code)) return "SCR";
	if ([
		"SBC",
		"YPR",
		"SMVB",
		"MYS",
		"UBL",
		"BGM",
		"BAY",
		"DWR",
		"HPT",
		"DVG"
	].includes(code)) return "SWR";
	if ([
		"TATA",
		"ROU",
		"KGP",
		"RNC",
		"HTE",
		"BKSC",
		"SHM",
		"SRC",
		"CKP",
		"JSG"
	].includes(code)) return "SER";
	return "NR";
}
function getTrainZone(train) {
	if (train.zone) return train.zone;
	if (train.halts.length > 0) return getStationZone(train.halts[0].code);
	return "NR";
}
function ControlRoomDashboard() {
	const now = useLiveClock(4e3);
	const [secondsAgo, setSecondsAgo] = (0, import_react.useState)(0);
	const [isBannerDismissed, setIsBannerDismissed] = (0, import_react.useState)(false);
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [selectedZone, setSelectedZone] = (0, import_react.useState)("all");
	const [selectedCause, setSelectedCause] = (0, import_react.useState)("all");
	const [sortBy, setSortBy] = (0, import_react.useState)("delay-desc");
	const [acknowledgedAlerts, setAcknowledgedAlerts] = (0, import_react.useState)({});
	const [showAcknowledgedSection, setShowAcknowledgedSection] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setSecondsAgo(0);
		const interval = setInterval(() => {
			setSecondsAgo((prev) => prev + 1);
		}, 1e3);
		return () => clearInterval(interval);
	}, [now]);
	const toggleAcknowledge = (trainNumber) => {
		setAcknowledgedAlerts((prev) => ({
			...prev,
			[trainNumber]: !prev[trainNumber]
		}));
	};
	const statuses = (0, import_react.useMemo)(() => now ? trainRoutes.map((t) => ({
		t,
		s: computeLiveStatus(t, now)
	})) : [], [now]);
	const fleet = (0, import_react.useMemo)(() => {
		const running = statuses.filter((x) => x.s.state === "running" || x.s.state === "halted");
		const onTime = running.filter((x) => (x.s.forecast?.delayMin ?? 0) <= 2).length;
		const late = running.length - onTime;
		const halted = running.filter((x) => x.s.state === "halted").length;
		const highConf = running.filter((x) => (x.s.forecast?.confidence ?? 0) >= .7).length;
		return {
			running: running.length,
			onTime,
			late,
			halted,
			highConf
		};
	}, [statuses]);
	const reasonBreakdown = (0, import_react.useMemo)(() => {
		const counts = {};
		for (const { s } of statuses) if ((s.forecast?.delayMin ?? 0) > 2) counts[s.delayReason] = (counts[s.delayReason] ?? 0) + 1;
		return Object.keys(DELAY_REASONS).filter((r) => (counts[r] ?? 0) > 0).map((r) => ({
			reason: r,
			label: DELAY_REASONS[r].short,
			count: counts[r] ?? 0
		}));
	}, [statuses]);
	const zoneBreakdown = (0, import_react.useMemo)(() => {
		const zoneMap = {};
		statuses.forEach(({ t, s }) => {
			if ((s.forecast?.delayMin ?? 0) > 2) {
				const zone = getTrainZone(t);
				if (!zoneMap[zone]) zoneMap[zone] = {
					count: 0,
					totalDelay: 0
				};
				zoneMap[zone].count += 1;
				zoneMap[zone].totalDelay += s.forecast?.delayMin ?? s.delay;
			}
		});
		return Object.entries(zoneMap).map(([zone, data]) => ({
			zone,
			count: data.count,
			avgDelay: Math.round(data.totalDelay / (data.count || 1))
		})).sort((a, b) => b.count - a.count);
	}, [statuses]);
	const rawAlerts = (0, import_react.useMemo)(() => statuses.filter(({ s }) => (s.forecast?.delayMin ?? 0) > 15).map(({ t, s }) => ({
		t,
		s,
		zone: getTrainZone(t),
		isAcknowledged: !!acknowledgedAlerts[t.number]
	})), [statuses, acknowledgedAlerts]);
	const weatherAdvisory = (0, import_react.useMemo)(() => {
		const weatherAlerts = statuses.filter(({ s }) => s.delayReason === "weather" && (s.forecast?.delayMin ?? 0) > 10);
		if (weatherAlerts.length === 0) return null;
		const impactedZones = Array.from(new Set(weatherAlerts.map(({ t }) => getTrainZone(t)))).join(", ");
		return {
			count: weatherAlerts.length,
			zones: impactedZones || "NR, ER, SR"
		};
	}, [statuses]);
	const filteredAlerts = (0, import_react.useMemo)(() => {
		let list = rawAlerts;
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter((item) => item.t.number.includes(q) || item.t.name.toLowerCase().includes(q) || item.t.halts.some((h) => h.code.toLowerCase().includes(q) || h.name.toLowerCase().includes(q)));
		}
		if (selectedZone !== "all") list = list.filter((item) => item.zone === selectedZone);
		if (selectedCause !== "all") list = list.filter((item) => item.s.delayReason === selectedCause);
		list = [...list].sort((a, b) => {
			const delayA = a.s.forecast?.delayMin ?? a.s.delay;
			const delayB = b.s.forecast?.delayMin ?? b.s.delay;
			const confA = a.s.forecast?.confidence ?? a.s.confidence;
			const confB = b.s.forecast?.confidence ?? b.s.confidence;
			if (sortBy === "delay-desc") return delayB - delayA;
			if (sortBy === "delay-asc") return delayA - delayB;
			if (sortBy === "conf-desc") return confB - confA;
			if (sortBy === "number") return a.t.number.localeCompare(b.t.number);
			return 0;
		});
		return list;
	}, [
		rawAlerts,
		searchQuery,
		selectedZone,
		selectedCause,
		sortBy
	]);
	const activePendingAlerts = (0, import_react.useMemo)(() => filteredAlerts.filter((a) => !a.isAcknowledged), [filteredAlerts]);
	const activeAckAlerts = (0, import_react.useMemo)(() => filteredAlerts.filter((a) => a.isAcknowledged), [filteredAlerts]);
	const availableZones = (0, import_react.useMemo)(() => {
		const zSet = /* @__PURE__ */ new Set();
		rawAlerts.forEach((a) => zSet.add(a.zone));
		return Array.from(zSet).sort();
	}, [rawAlerts]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-bold uppercase tracking-wider text-foreground",
						children: "Network Operations Feed"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-emerald-500 animate-pulse" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-[11px] font-medium text-foreground",
							children: [
								"Last updated ",
								secondsAgo,
								"s ago"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-muted-foreground",
							children: "• Live model telemetry"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpotlightEta, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CascadePanel, {
				incomingTrainNo: "12951",
				stationCode: "NDLS"
			}),
			!isBannerDismissed && weatherAdvisory && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 text-sky-950 dark:text-sky-100 shadow-sm animate-in fade-in duration-300",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudRain, { className: "size-4.5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-bold tracking-tight",
						children: "Weather & Speed Restriction Advisory · Elevated Corridor Delays"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 text-xs text-sky-800 dark:text-sky-200",
						children: [
							"Adverse weather and fog alerts detected across",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: weatherAdvisory.zones }),
							" zones (",
							weatherAdvisory.count,
							" trains affected). Speed restrictions enforced on active trunk sections."
						]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setIsBannerDismissed(true),
					className: "rounded-lg p-1 text-sky-700 hover:bg-sky-500/20 dark:text-sky-300 transition-colors cursor-pointer",
					title: "Dismiss Advisory",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-4" }),
							label: "Trains monitored",
							value: fleet.running,
							sub: `${fleet.running} monitored (${fleet.onTime} on time)`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" }),
							label: "Running late",
							value: fleet.late,
							sub: "predicted by model",
							alert: fleet.late > 0
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePause, { className: "size-4" }),
							label: "Halted at stations",
							value: fleet.halted,
							sub: "currently stationary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }),
							label: "High-confidence forecasts",
							value: fleet.highConf,
							sub: "≥ 70% confidence"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border/80 bg-secondary/30 px-3.5 py-2 text-xs text-muted-foreground flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Dataset Note:" }), " Reflects a curated high-variance sample selected for delay-history depth — not representative of full-network baseline punctuality."] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelEvalPanel, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RetrainAccuracyPanel, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-border bg-card p-5 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-semibold text-foreground",
							children: "Delay cause distribution"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-xs text-muted-foreground",
							children: "Classified causes for trains the model predicts as late."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 h-56",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
									data: reasonBreakdown,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
											strokeDasharray: "3 3",
											stroke: "var(--border)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
											dataKey: "label",
											fontSize: 11,
											stroke: "var(--muted-foreground)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
											allowDecimals: false,
											fontSize: 11,
											stroke: "var(--muted-foreground)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
											cursor: { fill: "var(--secondary)" },
											contentStyle: {
												background: "var(--card)",
												border: "1px solid var(--border)",
												borderRadius: 12
											}
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
											dataKey: "count",
											radius: [
												6,
												6,
												0,
												0
											],
											children: reasonBreakdown.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: reasonColors[r.reason] }, r.reason))
										})
									]
								})
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-border bg-card p-5 shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-semibold text-foreground",
							children: "Zone-wise delay breakdown"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-xs text-muted-foreground",
							children: "Affected train counts and average delay severity grouped by Railway Zone."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-4 text-primary" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 h-56",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: zoneBreakdown,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										strokeDasharray: "3 3",
										stroke: "var(--border)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "zone",
										fontSize: 11,
										stroke: "var(--muted-foreground)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										allowDecimals: false,
										fontSize: 11,
										stroke: "var(--muted-foreground)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
										cursor: { fill: "var(--secondary)" },
										content: ({ active, payload }) => {
											if (active && payload && payload.length) {
												const data = payload[0].payload;
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "rounded-xl border border-border bg-card p-2 text-xs shadow-lg",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															className: "font-bold text-foreground",
															children: ["Zone ", data.zone]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															className: "text-primary font-semibold",
															children: ["Delayed Trains: ", data.count]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															className: "text-muted-foreground",
															children: [
																"Avg Delay: ",
																data.avgDelay,
																" min"
															]
														})
													]
												});
											}
											return null;
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "count",
										radius: [
											6,
											6,
											0,
											0
										],
										children: zoneBreakdown.map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: zoneColors[z.zone] ?? "#3b82f6" }, z.zone))
									})
								]
							})
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-card shadow-card overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/30 px-5 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-bold text-foreground",
									children: "Active delay alerts"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded-full bg-rail-alert/15 px-2 py-0.5 font-mono text-[10px] font-bold text-rail-alert",
									children: [activePendingAlerts.length, " Actionable"]
								}),
								activeAckAlerts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400",
									children: [activeAckAlerts.length, " Acknowledged"]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted-foreground",
							children: [rawAlerts.length, " total trains >15 min delay"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3 border-b border-border bg-card p-3 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative flex-1 min-w-[200px]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "Search train no, name or station...",
										value: searchQuery,
										onChange: (e) => setSearchQuery(e.target.value),
										className: "w-full rounded-lg border border-border bg-secondary/30 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
									}),
									searchQuery && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setSearchQuery(""),
										className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
										children: "✕"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground font-medium",
									children: "Zone:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: selectedZone,
									onChange: (e) => setSelectedZone(e.target.value),
									className: "rounded-lg border border-border bg-secondary/30 px-2 py-1.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "all",
										children: "All Zones"
									}), availableZones.map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: z,
										children: z
									}, z))]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground font-medium",
									children: "Cause:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: selectedCause,
									onChange: (e) => setSelectedCause(e.target.value),
									className: "rounded-lg border border-border bg-secondary/30 px-2 py-1.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden cursor-pointer",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "all",
											children: "All Causes"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "weather",
											children: "Weather"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "congestion",
											children: "Congestion"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "track-work",
											children: "Track Work"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "signal-failure",
											children: "Signal Failure"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "technical",
											children: "Technical"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "unknown",
											children: "Unknown"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: "size-3 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: sortBy,
									onChange: (e) => setSortBy(e.target.value),
									className: "rounded-lg border border-border bg-secondary/30 px-2 py-1.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden cursor-pointer",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "delay-desc",
											children: "Delay: High → Low"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "delay-asc",
											children: "Delay: Low → High"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "conf-desc",
											children: "Confidence: High → Low"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "number",
											children: "Train Number"
										})
									]
								})]
							})
						]
					}),
					activePendingAlerts.length === 0 && activeAckAlerts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-5 py-8 text-center text-sm text-muted-foreground",
						children: "No matching delay alerts found for the selected filter criteria."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-border",
						children: activePendingAlerts.map(({ t, s, zone }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-secondary/20",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => toggleAcknowledge(t.number),
									className: "flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors cursor-pointer",
									title: "Acknowledge Alert",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/train/$number",
									params: { number: t.number },
									className: "min-w-0 flex-1 group",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-sm font-bold text-foreground group-hover:text-primary transition-colors",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono text-muted-foreground",
													children: t.number
												}),
												" ",
												t.name
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded bg-secondary/80 px-1.5 py-0.2 font-mono text-[9px] font-bold text-foreground",
											children: zone
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-1 flex flex-wrap items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DelayReasonTag, { reason: s.delayReason }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-muted-foreground",
											children: ["Approaching: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: s.nextHalt?.code ?? "Destination" })]
										})]
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center gap-4 text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block font-mono text-base font-bold text-rail-alert",
									children: [
										"+",
										s.forecast?.delayMin ?? s.delay,
										" min"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EtaConfidenceBadge, { confidence: s.forecast?.confidence ?? 0 })] })
							})]
						}, t.number))
					}),
					activeAckAlerts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-t border-border bg-secondary/15",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setShowAcknowledgedSection(!showAcknowledgedSection),
							className: "flex w-full items-center justify-between px-5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5 text-emerald-600 dark:text-emerald-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Acknowledged Alerts (",
									activeAckAlerts.length,
									")"
								] })]
							}), showAcknowledgedSection ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3.5" })]
						}), showAcknowledgedSection && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "divide-y divide-border/60 bg-secondary/5 opacity-75",
							children: activeAckAlerts.map(({ t, s, zone }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-secondary/10",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3 min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => toggleAcknowledge(t.number),
										className: "flex size-6 shrink-0 items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-amber-500/20 hover:text-amber-600 transition-colors cursor-pointer",
										title: "Reopen Alert",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/train/$number",
										params: { number: t.number },
										className: "min-w-0 flex-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-xs font-medium line-through text-muted-foreground",
													children: [
														t.number,
														" ",
														t.name
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "rounded bg-secondary px-1 py-0.2 font-mono text-[8px] text-muted-foreground",
													children: zone
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "rounded-xs bg-emerald-500/10 px-1 py-0.2 text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase",
													children: "Actioned"
												})
											]
										})
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-right",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono text-xs text-muted-foreground",
										children: [
											"+",
											s.forecast?.delayMin ?? s.delay,
											" min"
										]
									})
								})]
							}, t.number))
						})]
					})
				]
			})
		]
	});
}
function SpotlightEta() {
	const { payload } = useEngineEta("12951", "NDLS");
	if (!payload) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "rounded-2xl border border-border bg-card p-4",
		"aria-label": "Spotlight ETA",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading engine ETA…"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl border border-border bg-card p-4",
		"aria-label": "Spotlight ETA",
		"data-testid": "engine-spotlight",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-bold uppercase tracking-wide",
					children: "Spotlight · 12951 → NDLS"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceTierBadge, { source: payload.source }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EtaConfidenceBadge, { confidence: payload.confidence })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 font-mono text-2xl font-bold",
			"data-engine-eta": payload.eta,
			children: payload.eta
		})]
	});
}
function Kpi({ icon, label, value, sub, alert }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-5 shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-1.5 text-xs text-muted-foreground",
				children: [icon, label]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `mt-2 text-3xl font-bold ${alert ? "text-rail-alert" : "text-foreground"}`,
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: sub
			})
		]
	});
}
function ControlRoomPage() {
	const { t } = useTranslation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-6xl px-4 py-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap items-end justify-between gap-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-3xl font-bold",
						children: t("controlRoom.title")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: t("controlRoom.subtitle")
					})] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ControlRoomDashboard, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {})
		]
	});
}
//#endregion
export { ControlRoomPage as component };
