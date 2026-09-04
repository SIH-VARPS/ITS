import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/rail/SiteHeader";
import { SiteFooter } from "@/components/rail/Sections";

export const Route = createFileRoute("/ops")({
  component: OpsPage,
  head: () => ({
    meta: [
      { title: "Ops — ITS Indian Train System" },
      {
        name: "description",
        content: "Live-feed quota, cache, tier mix, and harvest health for operators.",
      },
    ],
  }),
});

type HealthPayload = {
  status: string;
  storeReachable: boolean;
  modelLoaded: boolean;
  modelVersion: string | null;
  lastHarvestAt: number | null;
  quotaRemaining: number | null;
  updatedAt: number;
};

type MetricsPayload = {
  vendorCalls: number;
  quotaUsed: number;
  quotaRemaining: number;
  cacheHitRatio: number;
  etaLatencyP50Ms: number;
  etaLatencyP95Ms: number;
  tierMix: { railradar: number; crowd: number; replay: number };
  modelVersion: string | null;
  predictionVolume: number;
};

function fmtTime(epochMs: number | null): string {
  if (epochMs === null) return "never";
  return new Date(epochMs).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}

function OpsPage() {
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [metrics, setMetrics] = useState<MetricsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [healthRes, metricsRes] = await Promise.all([
          fetch("/api/v2/health"),
          fetch("/api/v2/metrics"),
        ]);
        if (!healthRes.ok || !metricsRes.ok) throw new Error("ops endpoints unavailable");
        const healthJson = (await healthRes.json()) as HealthPayload;
        const metricsJson = (await metricsRes.json()) as MetricsPayload;
        if (cancelled) return;
        setHealth(healthJson);
        setMetrics(metricsJson);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "load failed");
      }
    }
    void load();
    const timer = window.setInterval(() => void load(), 10_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold">Ops</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quota burn, cache hit ratio, live-feed tier mix, and harvest freshness.
        </p>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OpsCard
            label="Health"
            value={health?.status ?? "…"}
            hint={health ? `store ${health.storeReachable ? "up" : "down"}` : "loading"}
          />
          <OpsCard
            label="Model"
            value={
              health ? (health.modelLoaded ? (health.modelVersion ?? "loaded") : "missing") : "…"
            }
            hint="artifact"
          />
          <OpsCard
            label="Quota remaining"
            value={String(metrics?.quotaRemaining ?? health?.quotaRemaining ?? "…")}
            hint={`${metrics?.quotaUsed ?? 0} used`}
          />
          <OpsCard label="Last harvest" value={fmtTime(health?.lastHarvestAt ?? null)} hint="IST" />
          <OpsCard
            label="Cache hit ratio"
            value={metrics ? `${Math.round(metrics.cacheHitRatio * 100)}%` : "…"}
            hint={`${metrics?.vendorCalls ?? 0} vendor calls`}
          />
          <OpsCard
            label="ETA latency"
            value={
              metrics
                ? `${Math.round(metrics.etaLatencyP50Ms)} / ${Math.round(metrics.etaLatencyP95Ms)} ms`
                : "…"
            }
            hint="p50 / p95"
          />
          <OpsCard
            label="Tier mix"
            value={
              metrics
                ? `A ${metrics.tierMix.railradar} · B ${metrics.tierMix.crowd} · C ${metrics.tierMix.replay}`
                : "…"
            }
            hint="railradar / crowd / replay"
          />
          <OpsCard
            label="Predictions"
            value={String(metrics?.predictionVolume ?? 0)}
            hint={metrics?.modelVersion ?? "no model"}
          />
        </div>
      </main>
      <SiteFooter />
      <Toaster />
    </div>
  );
}

function OpsCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-mono text-lg font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
