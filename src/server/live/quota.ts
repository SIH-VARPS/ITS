import { IST_OFFSET_MIN } from "./parseLegacy";
import type { ObservationStore } from "./store";

/** Default monthly RailRadar call cap (free-tier budget). */
export const DEFAULT_MONTHLY_QUOTA = 1000;

export function monthKeyIst(epochMs: number = Date.now()): string {
  return new Date(epochMs + IST_OFFSET_MIN * 60 * 1000).toISOString().slice(0, 7);
}

export function readMonthlyQuotaCap(): number {
  if (typeof process === "undefined" || !process.env) return DEFAULT_MONTHLY_QUOTA;
  const raw = process.env["RAILRADAR_MONTHLY_QUOTA"];
  const parsed = raw !== undefined ? Number(raw) : DEFAULT_MONTHLY_QUOTA;
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : DEFAULT_MONTHLY_QUOTA;
}

export async function getQuotaRemaining(
  store: ObservationStore,
  cap: number = readMonthlyQuotaCap(),
  nowMs: number = Date.now(),
): Promise<number> {
  const used = await store.getQuotaUsed(monthKeyIst(nowMs));
  return Math.max(0, cap - used);
}

export async function canSpendQuota(
  store: ObservationStore,
  cap: number = readMonthlyQuotaCap(),
  nowMs: number = Date.now(),
): Promise<boolean> {
  return (await getQuotaRemaining(store, cap, nowMs)) > 0;
}

export async function spendQuota(
  store: ObservationStore,
  nowMs: number = Date.now(),
): Promise<number> {
  return store.incrementQuota(monthKeyIst(nowMs), 1);
}
