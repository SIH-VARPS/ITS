export function mulberry32(seed: number): () => number;

export function gauss(rng: () => number): number;

export function loadDelayPriors(csvPath: string): Record<string, Record<string, number>>;

export function simulateAr1Delays(
  halts: Array<{ code: string }>,
  stationMeans: Record<string, number>,
  rng: () => number,
  rho?: number,
): number[];

export function harvestRuns(
  graph: Map<string, { p50RunMin: number; p80RunMin: number }>,
  trainsByNumber: Map<string, unknown>,
  harvestRoot?: string,
): unknown[];

export function syntheticWeatherAt(
  month: number,
  rng: () => number,
): {
  weatherCode: number;
  precipitationMm: number;
  visibilityKm: number;
  windSpeedKmph: number;
};

export function applyWeatherDelayBump(
  delays: number[],
  weatherByHalt: unknown[],
): number[];

export function generateRawRuns(options?: {
  seed?: number;
  runsPerTrain?: number;
  harvestRoot?: string;
}): {
  runs: unknown[];
  priors: Record<string, Record<string, number>>;
  featured: unknown[];
};

export function writeTrainingCorpus(options?: {
  seed?: number;
  runsPerTrain?: number;
  harvestRoot?: string;
  fetchImpl?: (
    input: string,
    init?: { signal?: AbortSignal },
  ) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;
  offline?: boolean;
}): Promise<{ outPath: string; count: number; real: number; archived: number }>;
