import { loadModelArtifact } from "@/lib/model/loadArtifact";
import { setModelVersionServed } from "@/lib/metrics";
import { healthResponseSchema, type HealthResponse } from "@/server/schemas/health";
import { getHarvestLog } from "@/server/live/harvest";
import { getQuotaRemaining, readMonthlyQuotaCap } from "@/server/live/quota";
import { getObservationStore } from "@/server/live/store";

export type HealthDeps = {
  storePing?: () => Promise<boolean>;
  modelLoaded?: boolean;
  modelVersion?: string | null;
  lastHarvestAt?: number | null;
  quotaRemaining?: number | null;
  now?: () => number;
};

/**
 * Operability snapshot for `GET /api/v2/health`.
 * Status is `degraded` when the model artifact is missing.
 */
export async function buildHealthResponse(deps: HealthDeps = {}): Promise<HealthResponse> {
  const now = deps.now ?? (() => Date.now());
  let storeReachable = true;
  if (deps.storePing) {
    try {
      storeReachable = await deps.storePing();
    } catch {
      storeReachable = false;
    }
  } else {
    try {
      storeReachable = await getObservationStore().ping();
    } catch {
      storeReachable = false;
    }
  }

  const artifact = deps.modelLoaded === undefined ? loadModelArtifact() : null;
  const modelLoaded = deps.modelLoaded ?? artifact !== null;
  const modelVersion =
    deps.modelVersion !== undefined ? deps.modelVersion : (artifact?.version ?? null);
  setModelVersionServed(modelVersion);

  const lastHarvestAt =
    deps.lastHarvestAt !== undefined
      ? deps.lastHarvestAt
      : ((await getObservationStore().getLastHarvestAt()) ?? getHarvestLog().lastHarvestAt());

  const quotaRemaining =
    deps.quotaRemaining !== undefined
      ? deps.quotaRemaining
      : await getQuotaRemaining(getObservationStore(), readMonthlyQuotaCap(), now());

  let status: HealthResponse["status"] = "ok";
  if (!storeReachable) status = "down";
  else if (!modelLoaded) status = "degraded";

  const payload: HealthResponse = {
    status,
    storeReachable,
    modelLoaded,
    modelVersion,
    lastHarvestAt,
    quotaRemaining,
    updatedAt: now(),
  };
  return healthResponseSchema.parse(payload);
}
