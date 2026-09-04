export type PredictionRecord = {
  trainNo: string;
  runDate: string;
  stationCode: string;
  sequence: number;
  /** Epoch milliseconds when the forecast was issued. */
  predictedAt: number;
  predictedDelayMin: number;
  p50Min: number;
  p80Min: number;
  p90Min: number;
  modelVersion: string;
  fromStationCode?: string;
  toStationCode?: string;
  zone?: string;
  trainClass?: string;
};

export type ArrivalOutcome = {
  trainNo: string;
  runDate: string;
  stationCode: string;
  sequence: number;
  actualDelayMin: number;
  /** Epoch milliseconds of the realised arrival. */
  arrivedAt: number;
};

export type ResidualRow = {
  trainNo: string;
  runDate: string;
  stationCode: string;
  sequence: number;
  predictedAt: number;
  arrivedAt: number;
  predictedDelayMin: number;
  actualDelayMin: number;
  /** `actualDelayMin - predictedDelayMin`. */
  residualMin: number;
  /** Minutes between forecast issue and realised arrival. */
  horizonMin: number;
  modelVersion: string;
  fromStationCode?: string;
  toStationCode?: string;
  zone?: string;
  trainClass?: string;
};

function haltKey(trainNo: string, runDate: string, stationCode: string): string {
  return `${trainNo}|${runDate}|${stationCode}`;
}

function withOptional<T extends object, K extends string, V>(
  row: T,
  key: K,
  value: V | undefined,
): T & { [P in K]?: V } {
  if (value === undefined) return row;
  return { ...row, [key]: value };
}

/**
 * Join each realised arrival to **every** earlier prediction for that halt.
 * Predictions issued after the arrival are excluded.
 */
export function joinResiduals(
  predictions: readonly PredictionRecord[],
  arrivals: readonly ArrivalOutcome[],
): ResidualRow[] {
  const byHalt = new Map<string, PredictionRecord[]>();
  for (const pred of predictions) {
    const key = haltKey(pred.trainNo, pred.runDate, pred.stationCode);
    const list = byHalt.get(key);
    if (list) list.push(pred);
    else byHalt.set(key, [pred]);
  }

  const rows: ResidualRow[] = [];
  for (const arrival of arrivals) {
    const preds = byHalt.get(haltKey(arrival.trainNo, arrival.runDate, arrival.stationCode));
    if (!preds) continue;
    for (const pred of preds) {
      if (pred.sequence !== arrival.sequence) continue;
      if (pred.predictedAt > arrival.arrivedAt) continue;
      const residualMin = arrival.actualDelayMin - pred.predictedDelayMin;
      let row: ResidualRow = {
        trainNo: arrival.trainNo,
        runDate: arrival.runDate,
        stationCode: arrival.stationCode,
        sequence: arrival.sequence,
        predictedAt: pred.predictedAt,
        arrivedAt: arrival.arrivedAt,
        predictedDelayMin: pred.predictedDelayMin,
        actualDelayMin: arrival.actualDelayMin,
        residualMin,
        horizonMin: (arrival.arrivedAt - pred.predictedAt) / 60_000,
        modelVersion: pred.modelVersion,
      };
      row = withOptional(row, "fromStationCode", pred.fromStationCode);
      row = withOptional(row, "toStationCode", pred.toStationCode);
      row = withOptional(row, "zone", pred.zone);
      row = withOptional(row, "trainClass", pred.trainClass);
      rows.push(row);
    }
  }

  rows.sort((a, b) => a.predictedAt - b.predictedAt || a.arrivedAt - b.arrivedAt);
  return rows;
}

export function meanAbsError(rows: readonly ResidualRow[]): number {
  if (rows.length === 0) return 0;
  let sum = 0;
  for (const row of rows) sum += Math.abs(row.residualMin);
  return sum / rows.length;
}
