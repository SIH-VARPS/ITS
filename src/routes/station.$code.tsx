import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowDownUp, Clock } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/rail/SiteHeader";
import { SiteFooter } from "@/components/rail/Sections";
import { EtaConfidenceBadge } from "@/components/rail/EtaConfidenceBadge";
import { DelayReasonTag } from "@/components/rail/DelayReasonTag";
import { stations } from "@/data/rail";
import { stationFor } from "@/data/generated/stations";
import { useTranslation } from "@/lib/i18n";
import type { DelayReason } from "@/lib/delayReasons";

export const Route = createFileRoute("/station/$code")({
  loader: ({ params }) => {
    const code = params.code.toUpperCase();
    const stationInfo = stationFor(code);
    const hardcodedStation = stations.find(([, c]) => c === code);
    const name = stationInfo?.name || hardcodedStation?.[0];
    if (!name && !stationInfo) throw notFound();
    return { code, name: name ?? code };
  },
  head: ({ loaderData }) => {
    const code = loaderData?.code;
    const name = loaderData?.name;
    return {
      meta: [
        {
          title: `${name ? `${name} (${code})` : "Station"} — Station Board | ITS Indian Train System`,
        },
        {
          name: "description",
          content: `Live arrivals and departures with predicted times and platforms at ${name ?? ""} (${code ?? ""}), from the ITS Indian Train System ETA forecasting model.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: StationNotFound,
  component: StationBoard,
});

function StationNotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold">{t("station.notFoundTitle")}</h1>
        <p className="mt-3 text-muted-foreground">{t("station.notFoundMsg")}</p>
        <Link to="/" className="mt-6 inline-block text-primary underline">
          {t("station.backToBoard")}
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

type BoardService = {
  trainNumber: string;
  trainName: string;
  serviceType: string;
  platform: string;
  scheduledTime: string;
  predictedTime: string;
  delayMinutes: number;
  delayReason: DelayReason | null;
  confidencePercent: number;
};

function StationBoard() {
  const { code, name } = Route.useLoaderData();
  const { t } = useTranslation();
  const [services, setServices] = useState<BoardService[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/v1/station/${encodeURIComponent(code)}/board`)
      .then((res) => res.json())
      .then((body: { data?: { services?: BoardService[] } }) => {
        if (!cancelled) setServices(body.data?.services ?? []);
      })
      .catch(() => {
        if (!cancelled) setServices([]);
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  const arrivals = services.filter(
    (r) => r.serviceType === "Arrival" || r.serviceType === "Terminal",
  );
  const departures = services.filter(
    (r) => r.serviceType === "Departure" || r.serviceType === "Arrival",
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> {t("station.liveBoard")}
        </Link>

        <div className="mt-4">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-3xl font-bold">{name}</h1>
            <span className="rounded-md border border-border bg-secondary/60 px-2.5 py-0.5 text-sm font-semibold text-muted-foreground">
              {code}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t("station.subtitle")}</p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <BoardTable
            title={t("station.arrivals")}
            icon={<ArrowDownUp className="size-4" />}
            rows={arrivals}
          />
          <BoardTable
            title={t("station.departures")}
            icon={<ArrowDownUp className="size-4" />}
            rows={departures}
          />
        </div>
      </main>

      <SiteFooter />
      <Toaster />
    </div>
  );
}

function BoardTable({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: React.ReactNode;
  rows: BoardService[];
}) {
  const { t } = useTranslation();

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border bg-subtle-gradient px-5 py-3">
        {icon}
        <h2 className="text-sm font-semibold">{title}</h2>
        <Clock className="ml-auto size-4 text-muted-foreground" />
      </div>
      {rows.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          {t("station.noServices")}
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((row) => (
            <li key={`${row.trainNumber}-${row.serviceType}`} className="px-5 py-3">
              <Link
                to="/train/$number"
                params={{ number: row.trainNumber }}
                className="flex items-center justify-between gap-3"
              >
                <span>
                  <span className="block text-sm font-semibold">
                    <span className="text-muted-foreground">{row.trainNumber}</span> {row.trainName}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border bg-secondary/50 px-1.5 py-0.5 text-[10px] font-semibold">
                      {row.serviceType}
                    </span>
                    <span>{t("station.platform", { p: row.platform })}</span>
                    {row.delayReason && row.delayMinutes > 2 && (
                      <DelayReasonTag reason={row.delayReason} />
                    )}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-sm font-semibold">
                    <span className="text-muted-foreground line-through">{row.scheduledTime}</span>{" "}
                    → {row.predictedTime}
                  </span>
                  <EtaConfidenceBadge confidence={row.confidencePercent / 100} className="mt-1" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
