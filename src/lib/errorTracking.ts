import { logger, redactSecrets } from "./logger";

type SentryDsn = {
  publicKey: string;
  host: string;
  projectId: string;
};

function readServerDsn(): string {
  if (typeof process === "undefined" || !process.env) return "";
  return (process.env["SENTRY_DSN"] ?? "").trim();
}

function describeUnknown(error: unknown): string {
  if (error instanceof Error) return error.stack ?? `${error.name}: ${error.message}`;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error) ?? String(error);
  } catch {
    return String(error);
  }
}

/** Parse a Sentry DSN. Returns null when unset or malformed. */
export function parseSentryDsn(dsn: string): SentryDsn | null {
  const trimmed = dsn.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    const publicKey = url.username;
    const projectId = url.pathname.replace(/^\//, "").split("/")[0] ?? "";
    if (!publicKey || !url.host || !projectId) return null;
    return { publicKey, host: url.host, projectId };
  } catch {
    return null;
  }
}

async function postSentryEvent(dsn: SentryDsn, error: unknown, extras?: Record<string, unknown>) {
  const message = redactSecrets(describeUnknown(error)).slice(0, 4000);
  const payload = {
    event_id: crypto.randomUUID?.() ?? `${Date.now()}`,
    timestamp: new Date().toISOString(),
    platform: "javascript",
    logger: "raildristhi",
    message,
    extra: extras ?? {},
  };
  const auth = `Sentry sentry_version=7, sentry_client=raildristhi/1.0, sentry_key=${dsn.publicKey}`;
  await fetch(`https://${dsn.host}/api/${dsn.projectId}/store/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Sentry-Auth": auth,
    },
    body: JSON.stringify(payload),
  });
}

/**
 * Report an exception. No-ops network when `SENTRY_DSN` is unset.
 * Always writes a structured log line (secrets redacted).
 */
export function captureException(error: unknown, extras: Record<string, unknown> = {}): void {
  logger.error("exception", {
    message: describeUnknown(error),
    ...extras,
  });
  const parsed = parseSentryDsn(readServerDsn());
  if (!parsed) return;
  void postSentryEvent(parsed, error, extras).catch(() => {
    /* swallow — logging already happened */
  });
}

declare global {
  interface Window {
    __rdSentryBound?: boolean;
  }
}

function readClientDsn(): string {
  try {
    const env = import.meta.env as { VITE_SENTRY_DSN?: string };
    return (env.VITE_SENTRY_DSN ?? "").trim();
  } catch {
    return "";
  }
}

/**
 * Browser error tracking. Disabled when `VITE_SENTRY_DSN` is unset.
 * The DSN is a public client key (not the RailRadar secret).
 */
export function initClientErrorTracking(): void {
  if (typeof window === "undefined") return;
  if (window.__rdSentryBound) return;
  const dsn = readClientDsn();
  if (!parseSentryDsn(dsn)) return;
  window.__rdSentryBound = true;
  window.addEventListener("error", (event) => {
    captureException(event.error ?? event.message, { origin: "window.error" });
  });
  window.addEventListener("unhandledrejection", (event) => {
    captureException(event.reason, { origin: "unhandledrejection" });
  });
}

/** Server init. Disabled when the DSN is unset. */
export function initServerErrorTracking(): void {
  if (!parseSentryDsn(readServerDsn())) return;
  logger.info("error_tracking_enabled", { side: "server" });
}
