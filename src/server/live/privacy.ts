/** Coarse GPS at rest: 3 decimal places ≈ 111 m. */
export const GPS_AT_REST_DECIMALS = 3;

export function roundGpsCoord(value: number): number {
  const factor = 10 ** GPS_AT_REST_DECIMALS;
  return Math.round(value * factor) / factor;
}
