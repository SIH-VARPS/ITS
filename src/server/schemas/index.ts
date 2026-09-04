export { API_V2_VERSION, errorEnvelopeSchema, trainObservationSchema } from "./common";
export type { ApiErrorEnvelope, TrainObservationDto } from "./common";

export { etaQuerySchema, etaResponseSchema } from "./eta";
export type { EtaQuery, EtaResponse } from "./eta";

export { forecastResponseSchema } from "./forecast";
export type { ForecastResponse } from "./forecast";

export { boardQuerySchema, boardResponseSchema } from "./board";
export type { BoardQuery, BoardResponse } from "./board";

export { congestionResponseSchema } from "./congestion";
export type { CongestionResponse } from "./congestion";

export { trainGeoJsonResponseSchema } from "./geojson";
export type { TrainGeoJsonResponse } from "./geojson";

export {
  observationIntakeSchema,
  observationIntakeResponseSchema,
  observationDeleteQuerySchema,
  observationDeleteResponseSchema,
} from "./observations";
export type { ObservationIntake, ObservationIntakeResponse } from "./observations";

export { healthResponseSchema } from "./health";
export type { HealthResponse } from "./health";
