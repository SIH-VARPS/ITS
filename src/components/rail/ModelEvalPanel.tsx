import { useEffect, useState } from "react";
import { Gauge, ShieldCheck, SplitSquareVertical } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import rawReport from "../../../eval/report.json";
import { HORIZONS, type CohortReport, type EvalReport, type Horizon } from "@/lib/eval/harness";

const report = rawReport as EvalReport;

const HORIZON_LABEL: Record<Horizon, string> = {
  next: "Next halt",
  plus3h: "+3 hours",
  destination: "Destination",
};

function fmtMin(value: number): string {
  return `${value.toFixed(1)} min`;
}

function fmtPct(value: number, digits: number = 1): string {
  return `${value.toFixed(digits)}%`;
}

function coveragePct(value: number): string {
  return fmtPct(value * 100, 1);
}

function SliceTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ key: string; n: number; mae: number }>;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border/70 bg-secondary/20 p-3">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">No rows in this slice.</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border/70 bg-secondary/20 p-3">
      <p className="text-xs font-semibold text-foreground">{title}</p>
      <ul className="mt-2 space-y-1">
        {rows.slice(0, 6).map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-2 text-[11px]">
            <span className="truncate text-muted-foreground">
              {row.key} · n={row.n}
            </span>
            <span className="font-mono text-foreground">{fmtMin(row.mae)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CohortBody({ cohort, emptyHint }: { cohort: CohortReport; emptyHint: string }) {
  const next = cohort.horizons.next;
  const dest = cohort.horizons.destination;
  const reliability = next.calibration.reliability.map((bin) => ({
    bin: bin.bin,
    predicted: bin.predictedMean,
    observed: bin.observedMean,
  }));

  if (cohort.n === 0) {
    return <p className="text-sm text-muted-foreground">{emptyHint}</p>;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/80 bg-background/60 p-3">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Next halt vs Baseline B
          </p>
          <p
            className={`mt-1 text-2xl font-bold ${
              next.improvementVsBPct >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600"
            }`}
          >
            {next.improvementVsBPct >= 0 ? "−" : "+"}
            {fmtPct(Math.abs(next.improvementVsBPct))} MAE
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Model {fmtMin(next.model.mae)} vs IR method {fmtMin(next.baselineB.mae)} · n={next.n}
          </p>
        </div>
        <div className="rounded-xl border border-border/80 bg-background/60 p-3">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">P80 coverage</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {coveragePct(next.calibration.p80Coverage)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Target 80%. Destination P80 is {coveragePct(dest.calibration.p80Coverage)} (compounds
            sectional error).
          </p>
        </div>
        <div className="rounded-xl border border-border/80 bg-background/60 p-3">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Hold-out size</p>
          <p className="mt-1 text-2xl font-bold text-foreground" data-testid="eval-holdout-n">
            {cohort.n}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Walk-forward test predictions across {HORIZONS.length} horizons.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-xs">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Horizon</th>
              <th className="py-2 pr-3 font-medium">Model MAE</th>
              <th className="py-2 pr-3 font-medium">A schedule</th>
              <th className="py-2 pr-3 font-medium">B IR</th>
              <th className="py-2 pr-3 font-medium">C persist</th>
              <th className="py-2 pr-3 font-medium">vs B</th>
              <th className="py-2 font-medium">P80</th>
            </tr>
          </thead>
          <tbody>
            {HORIZONS.map((horizon) => {
              const block = cohort.horizons[horizon];
              return (
                <tr key={horizon} className="border-b border-border/60">
                  <td className="py-2 pr-3 font-medium text-foreground">
                    {HORIZON_LABEL[horizon]}
                  </td>
                  <td className="py-2 pr-3 font-mono">{fmtMin(block.model.mae)}</td>
                  <td className="py-2 pr-3 font-mono text-muted-foreground">
                    {fmtMin(block.baselineA.mae)}
                  </td>
                  <td className="py-2 pr-3 font-mono">{fmtMin(block.baselineB.mae)}</td>
                  <td className="py-2 pr-3 font-mono text-muted-foreground">
                    {fmtMin(block.baselineC.mae)}
                  </td>
                  <td className="py-2 pr-3 font-mono">
                    {block.improvementVsBPct >= 0 ? "−" : "+"}
                    {fmtPct(Math.abs(block.improvementVsBPct))}
                  </td>
                  <td className="py-2 font-mono">{coveragePct(block.calibration.p80Coverage)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-foreground">Reliability (next-halt P50 bins)</h4>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Predicted mean delay versus realised mean delay. A calibrated model sits on the diagonal.
        </p>
        <div className="mt-3 h-48">
          {reliability.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reliability bins.</p>
          ) : (
            <ReliabilityChart data={reliability} />
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SliceTable title="By zone" rows={next.breakdowns.zone} />
        <SliceTable title="By train class" rows={next.breakdowns.trainClass} />
        <SliceTable title="By hour (IST)" rows={next.breakdowns.hour} />
        <SliceTable title="By day of journey" rows={next.breakdowns.dayOfJourney} />
        <SliceTable title="By delay magnitude" rows={next.breakdowns.delayMagnitude} />
      </div>
    </div>
  );
}

function ReliabilityChart({
  data,
}: {
  data: Array<{ bin: string; predicted: number; observed: number }>;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return <p className="text-sm text-muted-foreground">Loading reliability chart…</p>;
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="bin" fontSize={11} stroke="var(--muted-foreground)" />
        <YAxis fontSize={11} stroke="var(--muted-foreground)" />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
          }}
        />
        <Legend />
        <Bar dataKey="predicted" name="Predicted P50" fill="#38bdf8" radius={[6, 6, 0, 0]} />
        <Bar dataKey="observed" name="Observed" fill="#f59e0b" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ModelEvalPanel() {
  const [cohort, setCohort] = useState<"synthetic" | "real">("synthetic");
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  const selected = cohort === "synthetic" ? report.synthetic : report.real;
  const nextImprove = report.synthetic.horizons.next.improvementVsBPct;

  return (
    <section
      className="rounded-2xl border border-border bg-card p-5 shadow-card"
      data-testid="eval-panel"
      data-eval-hydrated={hydrated ? "true" : "false"}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Gauge className="size-4 text-primary" />
            Walk-forward evaluation vs official IR method
          </h3>
          <p className="mt-0.5 max-w-2xl text-xs text-muted-foreground">
            Hold-out MAE against Baseline B (schedule + current delay + recovery). Synthetic and
            railradar rows are scored on identical folds and never blended. Source: eval/report.json
            · model {report.modelVersion} · {report.foldCount} folds.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 p-1 text-[11px]">
          <button
            type="button"
            data-testid="eval-cohort-synthetic"
            data-eval-active={cohort === "synthetic" ? "true" : "false"}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              cohort === "synthetic"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground"
            }`}
            onClick={() => setCohort("synthetic")}
            onPointerDown={() => setCohort("synthetic")}
          >
            Synthetic · {report.synthetic.n}
          </button>
          <button
            type="button"
            data-testid="eval-cohort-real"
            data-eval-active={cohort === "real" ? "true" : "false"}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              cohort === "real"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground"
            }`}
            onClick={() => setCohort("real")}
            onPointerDown={() => setCohort("real")}
          >
            Real · {report.real.n}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/50 px-2 py-0.5">
          <ShieldCheck className="size-3" />
          Synthetic next-halt {nextImprove >= 0 ? "beats" : "trails"} B by{" "}
          {fmtPct(Math.abs(nextImprove))}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/50 px-2 py-0.5">
          <SplitSquareVertical className="size-3" />A = schedule · B = IR recovery · C = persistence
        </span>
      </div>

      <div className="mt-5">
        <CohortBody
          cohort={selected}
          emptyHint={
            cohort === "real"
              ? "No railradar hold-out in this report. Harvest live runs, then npm run eval."
              : "No synthetic hold-out in this report. Run npm run eval to generate one."
          }
        />
      </div>
    </section>
  );
}
