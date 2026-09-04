import { createHash } from "node:crypto";
import { corsHeaders } from "./cors";

export function weakEtag(payload: string): string {
  return `W/"${createHash("sha1").update(payload).digest("hex")}"`;
}

export function jsonWithEtag(
  data: unknown,
  request: Request,
  extra: Record<string, string> = {},
  ttlSec: number = 30,
): Response {
  const payload = JSON.stringify(data);
  const etag = weakEtag(payload);
  const headers: Record<string, string> = {
    ...corsHeaders(),
    etag,
    "cache-control": `public, max-age=${ttlSec}`,
    ...extra,
  };
  const incoming = request.headers.get("if-none-match");
  if (incoming && incoming === etag) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(payload, { status: 200, headers });
}
