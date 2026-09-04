import type { Section, TrainRoute, TrainSummary } from "../src/data/trainTypes";

export function parseCsv(text: string, hasHeader?: boolean): unknown[];

export function clockToMin(clock: string): number | null;

export function classifyType(trainNo: string): string;

export function sanitizeZone(zone: string | null | undefined): string;

export function interpolateHaltCoords(
  stops: Array<{ code: string; km: number }>,
  lookup: Map<string, [number, number]>,
): { coords: [number, number][]; sources: string[] };

export function buildSections(routes: TrainRoute[]): Section[];

export function ingest(opts?: {
  root?: string;
  publicDir?: string;
  outDir?: string;
  stationPath?: string;
  overridesPath?: string;
  hotSetPath?: string;
  enrich?: boolean;
  apiKey?: string;
  fetchImpl?: typeof fetch;
  loadEnv?: boolean;
}): Promise<{
  outDir: string;
  routes: TrainRoute[];
  sections: Section[];
  catalog: {
    routeCount: number;
    zones: string[];
    networkCounts: { name: string; active: number }[];
    localCounts: { city: string; active: number }[];
    trains: TrainSummary[];
  };
  featured: TrainRoute[];
  zoneNames: string[];
  interpolatedHaltCount: number;
  maxElapsed: number;
  written: string[];
}>;
