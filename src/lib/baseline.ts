import type { TrainRoute } from "@/data/trainTypes";

/**
 * Official Indian Railways schedule baseline (SIH_PLAN W0).
 *
 * Units follow the project naming standard:
 * - `*Min` — minutes (clock or elapsed, as documented per field)
 * - halt `arr` / `dep` — minutes after origin departure
 * - `startsAt` — minutes after midnight of the origin-departure day
 */

/**
 * Published dwell at a halt (scheduled departure minus arrival).
 *
 * @param haltIndex - 0-based halt along the train
 * @returns slack in minutes, never negative
 */
export function haltSlackMin(train: TrainRoute, haltIndex: number): number {
  const halt = train.halts[haltIndex];
  if (!halt) return 0;
  return Math.max(0, halt.dep - halt.arr);
}

/**
 * Recovery allowance between two halts: sum of published dwell (slack)
 * at every halt from `fromHaltIndex` inclusive up to `toHaltIndex` exclusive.
 *
 * @returns minutes of schedule padding that may absorb delay
 */
export function recoveryAllowanceMin(
  train: TrainRoute,
  fromHaltIndex: number,
  toHaltIndex: number,
): number {
  const last = Math.min(Math.max(toHaltIndex, fromHaltIndex), train.halts.length - 1);
  let sum = 0;
  for (let i = fromHaltIndex; i < last; i++) {
    sum += haltSlackMin(train, i);
  }
  return sum;
}

/**
 * Published arrival at `haltIndex`, as minutes after midnight of journey day 0.
 * Multi-day trains exceed 1440.
 */
export function scheduledArrivalMin(train: TrainRoute, haltIndex: number): number {
  const halt = train.halts[haltIndex];
  if (!halt) return train.startsAt;
  return train.startsAt + halt.arr;
}

export type BaselineEta = {
  /** predicted arrival, minutes after midnight of journey day 0 */
  etaMin: number;
  /** minutes late after recovery; never negative (never earlier than schedule) */
  delayMin: number;
  /** published arrival, minutes after midnight of journey day 0 */
  scheduledArrivalMin: number;
  /** minutes of recovery actually applied (clamped to the current delay) */
  recoveryAppliedMin: number;
};

/**
 * IR baseline: `ETA = scheduledArrivalMin + currentDelayMin − recoveryMin`,
 * then clamped so the train cannot be predicted earlier than the published
 * arrival.
 *
 * @param currentDelayMin - observed minutes late at the reference point
 * @param recoveryMin - slack that may still be recovered before this halt
 */
/**
 * Baseline B delay: current delay minus remaining recovery, never earlier
 * than the published schedule (delay never negative).
 */
export function recoveredDelayMin(currentDelayMin: number, recoveryMin: number): number {
  const delayIn = Number.isFinite(currentDelayMin) ? currentDelayMin : 0;
  const recoveryIn = Number.isFinite(recoveryMin) ? Math.max(0, recoveryMin) : 0;
  const recoveryAppliedMin = Math.min(recoveryIn, Math.max(0, delayIn));
  return Math.max(0, delayIn - recoveryAppliedMin);
}

/**
 * Baseline C delay: current delay carries forward unchanged (no recovery).
 * Invalid inputs become 0.
 */
export function persistenceDelayMin(currentDelayMin: number): number {
  return Number.isFinite(currentDelayMin) ? currentDelayMin : 0;
}

export function baselineEta(
  train: TrainRoute,
  haltIndex: number,
  currentDelayMin: number,
  recoveryMin: number,
): BaselineEta {
  const scheduled = scheduledArrivalMin(train, haltIndex);
  const delayIn = Number.isFinite(currentDelayMin) ? currentDelayMin : 0;
  const recoveryIn = Number.isFinite(recoveryMin) ? Math.max(0, recoveryMin) : 0;
  const recoveryAppliedMin = Math.min(recoveryIn, Math.max(0, delayIn));
  const delayMin = recoveredDelayMin(currentDelayMin, recoveryMin);
  return {
    etaMin: scheduled + delayMin,
    delayMin,
    scheduledArrivalMin: scheduled,
    recoveryAppliedMin,
  };
}

/**
 * Baseline C: ETA = scheduledArrivalMin + currentDelayMin, no recovery.
 */
export function persistenceEta(
  train: TrainRoute,
  haltIndex: number,
  currentDelayMin: number,
): BaselineEta {
  const scheduled = scheduledArrivalMin(train, haltIndex);
  const delayMin = persistenceDelayMin(currentDelayMin);
  return {
    etaMin: scheduled + delayMin,
    delayMin,
    scheduledArrivalMin: scheduled,
    recoveryAppliedMin: 0,
  };
}

/**
 * Baseline A: ignore delay and recovery; return the published schedule.
 */
export function scheduleOnlyEta(train: TrainRoute, haltIndex: number): BaselineEta {
  return baselineEta(train, haltIndex, 0, 0);
}
