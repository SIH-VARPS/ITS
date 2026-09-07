import { syntheticPnrStatus } from "./syntheticPnr";
import type { PnrStatus } from "./types";

export type ClientPnrResult =
  | { ok: true; data: PnrStatus }
  | { ok: false; reason: "invalid" | "not_found"; message?: string };

type ApiPnrBody = {
  error?: boolean;
  message?: string;
  data?: PnrStatus;
};

async function readApiBody(response: Response): Promise<ApiPnrBody | null> {
  try {
    return (await response.json()) as ApiPnrBody;
  } catch {
    return null;
  }
}

/**
 * Live PNR first; if the hosted API is down or rejects a demo chip, show a
 * bundled ticket instead of "invalid PNR".
 */
export async function fetchPnrClient(
  pnr: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ClientPnrResult> {
  const cleaned = pnr.replace(/\D/g, "");
  if (cleaned.length !== 10) return { ok: false, reason: "invalid" };

  try {
    const response = await fetchImpl(`/api/v1/pnr/${cleaned}`);
    const body = await readApiBody(response);
    if (body?.data && !body.error) return { ok: true, data: body.data };
  } catch {
    // fall through to the bundled demo ticket
  }

  const demo = syntheticPnrStatus(cleaned);
  if (demo) return { ok: true, data: demo };
  return { ok: false, reason: "not_found" };
}
