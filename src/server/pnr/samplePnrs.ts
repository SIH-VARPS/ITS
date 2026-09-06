/** Demo chips on `/pnr`. Live PRS will not have these; they always fall back to synthetic. */
export const SAMPLE_PNRS = ["8421950247", "4920194821", "6730192845", "9120485721"] as const;

export function isSamplePnr(pnr: string): boolean {
  const cleaned = pnr.replace(/\D/g, "");
  return (SAMPLE_PNRS as readonly string[]).includes(cleaned);
}
