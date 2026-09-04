import { cn } from "@/lib/utils";
import type { ObservationSource } from "@/server/live/types";

const LABELS: Record<ObservationSource, string> = {
  railradar: "Vendor",
  crowd: "Crowd",
  replay: "Replay",
};

export function SourceTierBadge({
  source,
  className,
}: {
  source: ObservationSource;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide",
        source === "railradar" && "border-sky-500/40 bg-sky-500/15 text-sky-800 dark:text-sky-200",
        source === "crowd" &&
          "border-amber-500/40 bg-amber-500/15 text-amber-900 dark:text-amber-200",
        source === "replay" && "border-border bg-secondary/60 text-muted-foreground",
        className,
      )}
      data-source-tier={source}
    >
      {LABELS[source]}
    </span>
  );
}
