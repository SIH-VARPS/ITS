export function mulberry32(seed: number): () => number;

export function gauss(rng: () => number): number;

export function loadDelayPriors(csvPath: string): Record<string, Record<string, number>>;

export function simulateAr1Delays(
  halts: Array<{ code: string }>,
  stationMeans: Record<string, number>,
  rng: () => number,
  rho?: number,
): number[];

export function generateRawRuns(options?: { seed?: number; runsPerTrain?: number }): {
  runs: unknown[];
  priors: Record<string, Record<string, number>>;
  featured: unknown[];
};

export function writeTrainingCorpus(): { outPath: string; count: number; real: number };
