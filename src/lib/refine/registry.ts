import type { ModelArtifact, ModelMetrics } from "@/lib/model/types";
import { REFINE_POLICY } from "./policy";

export type RegisteredModel = {
  artifact: ModelArtifact;
  metrics: ModelMetrics;
  registeredAt: number;
};

export type PromotionDecision = {
  promoted: boolean;
  reason: string;
  maeImproved: boolean;
  calibrationOk: boolean;
  maeDeltaMin: number;
  championCalError: number;
  challengerCalError: number;
};

export type DiskRegistryPointer = {
  version: string;
  artifactPath: string;
  metrics: ModelMetrics;
};

export type DiskRegistryState = {
  champion: DiskRegistryPointer;
  previous: DiskRegistryPointer | null;
};

function calError(coverage: number): number {
  return Math.abs(coverage - REFINE_POLICY.targetP80);
}

export function maeImproveMargin(championMae: number): number {
  return Math.max(championMae * REFINE_POLICY.maeImproveRelative, REFINE_POLICY.maeImproveFloorMin);
}

/**
 * Promote only if hold-out MAE beats the champion by the preset margin
 * **and** calibration error `|p80 − 0.8|` does not increase.
 */
export function evaluatePromotion(
  champion: ModelMetrics,
  challenger: ModelMetrics,
): PromotionDecision {
  const maeDeltaMin = champion.maeMin - challenger.maeMin;
  const maeImproved = maeDeltaMin >= maeImproveMargin(champion.maeMin);
  const championCalError = calError(champion.p80Coverage);
  const challengerCalError = calError(challenger.p80Coverage);
  const calibrationOk = challengerCalError <= championCalError + 1e-12;
  const promoted = maeImproved && calibrationOk;
  let reason = "promoted";
  if (!maeImproved && !calibrationOk) {
    reason = "rejected: MAE margin and calibration";
  } else if (!maeImproved) {
    reason = "rejected: MAE did not beat champion by the required margin";
  } else if (!calibrationOk) {
    reason = "rejected: calibration regressed";
  }
  return {
    promoted,
    reason,
    maeImproved,
    calibrationOk,
    maeDeltaMin,
    championCalError,
    challengerCalError,
  };
}

function wrap(artifact: ModelArtifact, registeredAt: number): RegisteredModel {
  return { artifact, metrics: artifact.metrics, registeredAt };
}

export class ModelRegistry {
  private championModel: RegisteredModel | undefined;
  private previousModel: RegisteredModel | undefined;
  private readonly log: RegisteredModel[] = [];
  private clock: number;

  constructor(now: number = 1) {
    this.clock = now;
  }

  get champion(): RegisteredModel | undefined {
    return this.championModel;
  }

  get previous(): RegisteredModel | undefined {
    return this.previousModel;
  }

  get history(): readonly RegisteredModel[] {
    return this.log;
  }

  seedChampion(artifact: ModelArtifact): RegisteredModel {
    const entry = wrap(artifact, this.clock++);
    this.championModel = entry;
    this.previousModel = undefined;
    this.log.push(entry);
    return entry;
  }

  consider(challenger: ModelArtifact): PromotionDecision {
    if (!this.championModel) {
      this.seedChampion(challenger);
      return {
        promoted: true,
        reason: "promoted: first champion",
        maeImproved: true,
        calibrationOk: true,
        maeDeltaMin: 0,
        championCalError: calError(challenger.metrics.p80Coverage),
        challengerCalError: calError(challenger.metrics.p80Coverage),
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
  rollback(): RegisteredModel {
    if (!this.previousModel || !this.championModel) {
      throw new Error("no previous champion to restore");
    }
    const restored = this.previousModel;
    this.previousModel = this.championModel;
    this.championModel = restored;
    this.log.push({ ...restored, registeredAt: this.clock++ });
    return restored;
  }
}

/** Pointer-level rollback used by `npm run model:rollback`. */
export function rollbackDiskState(state: DiskRegistryState): DiskRegistryState {
  if (!state.previous) {
    throw new Error("no previous champion to restore");
  }
  return {
    champion: state.previous,
    previous: state.champion,
  };
}
