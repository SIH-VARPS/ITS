/** Process-local request id. Server handlers set this per request. */
let currentRequestId = "boot";

/** Create a unique request id (UUID when available). */
export function createRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getRequestId(): string {
  return currentRequestId;
}

export function setRequestId(requestId: string): void {
  currentRequestId = requestId;
}

/**
 * Run `fn` with `requestId` as the current id, restoring the previous value
 * after the function (and any returned promise) settles.
 */
export async function runWithRequestId<T>(requestId: string, fn: () => T | Promise<T>): Promise<T> {
  const previous = currentRequestId;
  currentRequestId = requestId;
  try {
    return await fn();
  } finally {
    currentRequestId = previous;
  }
}
