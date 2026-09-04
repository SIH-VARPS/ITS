/** Champion/challenger and drift thresholds. Keep scripts/promote-model.mjs in sync. */
export const REFINE_POLICY = {
  /** Challenger MAE must beat champion by this relative margin. */
  maeImproveRelative: 0.02,
  /** Absolute MAE floor so a near-zero champion still requires a real gain. */
  maeImproveFloorMin: 0.05,
  /** Target P80 coverage used for calibration error. */
  targetP80: 0.8,
  /** PSI above this raises a distribution-shift alarm. */
  psiAlarm: 0.25,
  psiBinCount: 10,
  psiEpsilon: 1e-6,
  /** Rolling MAE (minutes) that raises a zone/class alarm. */
  maeAlarmMin: 12,
  minMaeSamples: 5,
  /** EMA weight for per-section residual bias between retrains. */
  residualAlpha: 0.35,
} as const;
