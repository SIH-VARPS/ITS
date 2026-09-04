import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/rail/SiteHeader";
import { SearchPanel } from "@/components/rail/SearchPanel";
import { LiveTrainList } from "@/components/rail/LiveTrainList";
import {
  Features,
  ApiBanner,
  Networks,
  Stations,
  Faq,
  SiteFooter,
} from "@/components/rail/Sections";
import { useTranslation } from "@/lib/i18n";
import { ROUTE_COUNT } from "@/data/trains";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ITS Indian Train System — Live ETA Forecast & Train Running Status" },
      {
        name: "description",
        content:
          "Look up Indian Railways trains from the published timetable, read predicted arrival times with confidence, delay causes and a control-room dashboard.",
      },
      {
        property: "og:title",
        content: "ITS Indian Train System — Live ETA Forecast & Train Running Status",
      },
      {
        property: "og:description",
        content:
          "Timetable-backed train tracking with predicted ETA, delay cause tags and a control-room view for Indian Railways.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="mx-auto max-w-6xl px-4 pt-10 pb-4">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="order-2 lg:order-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground shadow-card">
                <span className="size-1.5 rounded-full bg-rail-live animate-rail-pulse" />
                {t("home.liveTrainsBadge", { count: ROUTE_COUNT.toLocaleString("en-IN") })}
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-[1.05] sm:text-5xl">
                {t("home.heroTitle")}
              </h1>
              <p className="mt-4 max-w-xl text-muted-foreground">{t("home.heroDescription")}</p>

              <div className="mt-8">
                <LiveTrainList />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <SearchPanel />
            </div>
          </div>
        </section>

        <Features />
        <ApiBanner />
        <Networks />
        <Stations />
        <Faq />
      </main>

      <SiteFooter />
      <Toaster />
    </div>
  );
}
