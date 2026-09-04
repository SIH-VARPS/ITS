import { getRequestId } from "./requestId";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogFields = Record<string, unknown>;

const SECRET_ENV_KEYS = [
  "RAILRADAR_API_KEY",
  "INTERNAL_REFRESH_SECRET",
  "SENTRY_DSN",
  "VITE_SENTRY_DSN",
  "GOOGLE_MAPS_API_KEY",
] as const;

type LogSink = (line: string) => void;

let sink: LogSink = defaultSink;

function defaultSink(line: string): void {
  if (typeof process !== "undefined" && typeof process.stdout?.write === "function") {
    process.stdout.write(`${line}\n`);
    return;
  }
  console.log(line);
}

export function setLogSink(next: LogSink | null): void {
  sink = next ?? defaultSink;
}

function secretValues(): string[] {
  const values: string[] = [];
  if (typeof process === "undefined" || !process.env) return values;
  for (const key of SECRET_ENV_KEYS) {
    const raw = process.env[key];
    if (typeof raw === "string" && raw.trim().length >= 4) {
      values.push(raw.trim());
    }
  }
  return values;
}

/** Strip configured secret values from a string. */
export function redactSecrets(text: string): string {
  let out = text;
  for (const secret of secretValues()) {
    if (!secret) continue;
    out = out.split(secret).join("[redacted]");
  }
  return out;
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value, (_key, nested) => {
      if (typeof nested === "string") return redactSecrets(nested);
      if (typeof nested === "bigint") return nested.toString();
      return nested as unknown;
    });
  } catch {
    return JSON.stringify({ unserializable: true });
  }
}

export type LogLine = {
  level: LogLevel;
  msg: string;
  requestId: string;
  ts: number;
  [key: string]: unknown;
};

/**
 * Structured JSON log. Every line includes `requestId`. Secret env values
 * are stripped before the sink sees the line.
 */
export function log(level: LogLevel, msg: string, fields: LogFields = {}): LogLine {
  const line: LogLine = {
    level,
    msg: redactSecrets(msg),
    requestId: getRequestId(),
    ts: Date.now(),
    ...fields,
  };
  const encoded = redactSecrets(safeJson(line));
  sink(encoded);
  return line;
}

export const logger = {
  debug: (msg: string, fields?: LogFields) => log("debug", msg, fields),
  info: (msg: string, fields?: LogFields) => log("info", msg, fields),
  warn: (msg: string, fields?: LogFields) => log("warn", msg, fields),
  error: (msg: string, fields?: LogFields) => log("error", msg, fields),
};
