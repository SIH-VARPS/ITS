import { REFINE_POLICY } from "./policy";
import type { ResidualRow } from "./outcomes";

export type SectionBias = {
  key: string;
  biasMin: number;
  n: number;
};

type Cell = { biasMin: number; n: number };

const table = new Map<string, Cell>();

export function sectionKey(fromCode: string, toCode: string): string {
  return `${fromCode}|${toCode}`;
}

export function resetResidualTable(): void {
  table.clear();
}

export function getSectionBiasMin(fromCode: string, toCode: string): number {
  return table.get(sectionKey(fromCode, toCode))?.biasMin ?? 0;
}

export function setSectionBiasMin(fromCode: string, toCode: string, biasMin: number): void {
  const key = sectionKey(fromCode, toCode);
  const existing = table.get(key);
  table.set(key, { biasMin, n: existing?.n ?? 1 });
}

export function snapshotResidualTable(): SectionBias[] {
  return [...table.entries()]
    .map(([key, cell]) => ({ key, biasMin: cell.biasMin, n: cell.n }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

function updateCell(fromCode: string, toCode: string, residualMin: number): void {
  const key = sectionKey(fromCode, toCode);
  const existing = table.get(key);
  if (!existing || existing.n === 0) {
    table.set(key, { biasMin: residualMin, n: 1 });
    return;
  }
  const alpha = REFINE_POLICY.residualAlpha;
  table.set(key, {
    biasMin: alpha * residualMin + (1 - alpha) * existing.biasMin,
    n: existing.n + 1,
  });
}

/** Fold residual rows into the live per-section EMA table. */
export function updateFromResiduals(rows: readonly ResidualRow[]): void {
  for (const row of rows) {
    if (!row.fromStationCode || !row.toStationCode) continue;
    updateCell(row.fromStationCode, row.toStationCode, row.residualMin);
  }
}

/**
 * Correct a raw P50 delay by adding the learned section bias
 * (`bias ≈ E[actual − predicted]`).
 */
export function applyCorrection(
  fromCode: string,
  toCode: string,
  predictedDelayMin: number,
): number {
  return predictedDelayMin + getSectionBiasMin(fromCode, toCode);
}

export function meanAbsErrorOnSection(
  fromCode: string,
  toCode: string,
  predicted: readonly number[],
  actual: readonly number[],
  correct: boolean,
): number {
  const n = Math.min(predicted.length, actual.length);
  if (n === 0) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const pred = predicted[i]!;
    const act = actual[i]!;
    const used = correct ? applyCorrection(fromCode, toCode, pred) : pred;
    sum += Math.abs(act - used);
  }
  return sum / n;
}
