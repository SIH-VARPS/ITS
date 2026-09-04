import { REFINE_POLICY } from "./policy";
import type { ResidualRow } from "./outcomes";

export type PsiResult = {
  psi: number;
  alarm: boolean;
  binCount: number;
};

export type FeatureDriftRow = {
  feature: string;
  psi: number;
  alarm: boolean;
};

export type RollingMaeRow = {
  group: "zone" | "trainClass";
  key: string;
  n: number;
  maeMin: number;
  alarm: boolean;
};

function quantileEdges(sorted: readonly number[], binCount: number): number[] {
  const edges: number[] = [];
  for (let i = 0; i <= binCount; i++) {
    const t = i / binCount;
    const idx = Math.min(sorted.length - 1, Math.floor(t * (sorted.length - 1)));
    edges.push(sorted[idx]!);
  }
  for (let i = 1; i < edges.length; i++) {
    if (edges[i]! < edges[i - 1]!) edges[i] = edges[i - 1]!;
  }
  if (edges[0] === edges[edges.length - 1]) {
    const mid = edges[0] ?? 0;
    edges[0] = mid - 0.5;
    edges[edges.length - 1] = mid + 0.5;
  }
  return edges;
}

function bucket(value: number, edges: readonly number[]): number {
  const last = edges.length - 2;
  for (let i = 0; i < last; i++) {
    if (value <= edges[i + 1]!) return i;
  }
  return Math.max(0, last);
}

/**
 * Population Stability Index between a reference sample and a current sample.
 * Empty or singleton inputs yield PSI 0 (not enough mass to alarm).
 */
export function populationStabilityIndex(
  reference: readonly number[],
  current: readonly number[],
  binCount: number = REFINE_POLICY.psiBinCount,
): PsiResult {
  if (reference.length < 2 || current.length < 2 || binCount < 2) {
    return { psi: 0, alarm: false, binCount };
  }
  const sorted = [...reference].sort((a, b) => a - b);
  const edges = quantileEdges(sorted, binCount);
  const refCounts = new Array<number>(binCount).fill(0);
  const curCounts = new Array<number>(binCount).fill(0);
  for (const value of reference) refCounts[bucket(value, edges)]! += 1;
  for (const value of current) curCounts[bucket(value, edges)]! += 1;

  const eps = REFINE_POLICY.psiEpsilon;
  let psi = 0;
  for (let i = 0; i < binCount; i++) {
    const pRef = (refCounts[i]! + eps) / (reference.length + binCount * eps);
    const pCur = (curCounts[i]! + eps) / (current.length + binCount * eps);
    psi += (pCur - pRef) * Math.log(pCur / pRef);
  }
  const alarm = psi > REFINE_POLICY.psiAlarm;
  return { psi, alarm, binCount };
}

export function featureDriftReport(
  reference: Readonly<Record<string, readonly number[]>>,
  current: Readonly<Record<string, readonly number[]>>,
): FeatureDriftRow[] {
  const names = Object.keys(reference).sort();
  const rows: FeatureDriftRow[] = [];
  for (const feature of names) {
    const ref = reference[feature];
    const cur = current[feature];
    if (!ref || !cur) continue;
    const result = populationStabilityIndex(ref, cur);
    rows.push({ feature, psi: result.psi, alarm: result.alarm });
  }
  return rows;
}

function groupKey(row: ResidualRow, group: "zone" | "trainClass"): string {
  const value = group === "zone" ? row.zone : row.trainClass;
  return value && value.length > 0 ? value : "unknown";
}

/**
 * Rolling MAE per zone or train class. Alarms when enough samples sit above the MAE threshold.
 */
export function rollingMae(
  residuals: readonly ResidualRow[],
  group: "zone" | "trainClass",
  options?: { window?: number; alarmMin?: number; minSamples?: number },
): RollingMaeRow[] {
  const alarmMin = options?.alarmMin ?? REFINE_POLICY.maeAlarmMin;
  const minSamples = options?.minSamples ?? REFINE_POLICY.minMaeSamples;
  const window = options?.window;

  const buckets = new Map<string, ResidualRow[]>();
  const ordered = [...residuals].sort((a, b) => a.arrivedAt - b.arrivedAt);
  for (const row of ordered) {
    const key = groupKey(row, group);
    const list = buckets.get(key);
    if (list) list.push(row);
    else buckets.set(key, [row]);
  }

  const rows: RollingMaeRow[] = [];
  for (const [key, list] of [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const sliced = window === undefined ? list : window <= 0 ? [] : list.slice(-window);
    if (sliced.length === 0) continue;
    let sum = 0;
    for (const row of sliced) sum += Math.abs(row.residualMin);
    const maeMin = sum / sliced.length;
    rows.push({
      group,
      key,
      n: sliced.length,
      maeMin,
      alarm: sliced.length >= minSamples && maeMin > alarmMin,
    });
  }
  return rows;
}

export function anyPsiAlarm(rows: readonly FeatureDriftRow[]): boolean {
  return rows.some((row) => row.alarm);
}

export function anyMaeAlarm(rows: readonly RollingMaeRow[]): boolean {
  return rows.some((row) => row.alarm);
}
