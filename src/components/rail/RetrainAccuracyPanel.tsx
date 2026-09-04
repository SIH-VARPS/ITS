import { LineChart, TrendingDown } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { promotedMaeSeries, RETRAIN_HISTORY } from "@/lib/refine/loop";

function fmtMin(value: number): string {
  return `${value.toFixed(2)} min`;
}

export function RetrainAccuracyPanel() {
  const history = RETRAIN_HISTORY;
  const promoted = promotedMaeSeries(history);
  const firstMae = promoted[0] ?? history[0]?.maeMin ?? 0;
  const lastMae = promoted[promoted.length - 1] ?? history[history.length - 1]?.maeMin ?? firstMae;
  const improvedPct = firstMae > 0 ? ((firstMae - lastMae) / firstMae) * 100 : 0;
  const chart = history.map((point) => ({
    step: point.step,
    mae: Number(point.maeMin.toFixed(3)),
    promoted: point.promoted ? point.maeMin : null,
    residual: point.source === "residual" ? point.maeMin : null,
  }));

  return (
    <section
      className="rounded-2xl border border-border bg-card p-5 shadow-card"
      data-testid="retrain-accuracy"
      data-mae-first={String(firstMae)}
      data-mae-last={String(lastMae)}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <LineChart className="size-4 text-primary" />
            Accuracy over retrains
          </h3>
          <p className="mt-0.5 max-w-2xl text-xs text-muted-foreground">
            Hold-out MAE from the same residual-join → champion/challenger loop the tests run.
            Intra-day section bias correction sits between retrains; a challenger is promoted only
            when MAE improves and calibration does not regress.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-[11px] text-foreground">
          <TrendingDown className="size-3 text-primary" />
          Promoted MAE {fmtMin(firstMae)} → {fmtMin(lastMae)} ({improvedPct.toFixed(0)}% lower)
        </span>
      </div>

      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLine data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="step" fontSize={11} stroke="var(--muted-foreground)" interval={0} />
            <YAxis
              fontSize={11}
              stroke="var(--muted-foreground)"
              tickFormatter={(value: number) => value.toFixed(1)}
              width={42}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number | string) => [fmtMin(Number(value)), "MAE"]}
            />
            <Line
              type="monotone"
              dataKey="mae"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="MAE"
            />
          </RechartsLine>
        </ResponsiveContainer>
      </div>

      <ol className="mt-4 grid gap-1.5 sm:grid-cols-2">
        {history.map((point) => (
          <li
            key={`${point.version}-${point.step}`}
            className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-secondary/20 px-2.5 py-1.5 text-[11px]"
          >
            <span className="truncate text-muted-foreground">
              {point.step}
              {point.promoted ? " · promoted" : ` · ${point.source}`}
            </span>
            <span className="font-mono text-foreground">{fmtMin(point.maeMin)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
