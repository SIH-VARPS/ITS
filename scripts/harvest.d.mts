export function loadDotEnv(envPath?: string): void;

export function loadHotSet(configPath?: string): string[];

export function requireApiKey(apiKey: string): string;

export function fetchLegacyTrain(
  trainNo: string,
  opts: {
    apiKey: string;
    fetchImpl?: typeof fetch;
  },
): Promise<{
  trainNo: string;
  ok: boolean;
  source: "railradar";
  status: number;
  body: unknown;
}>;

export function harvest(opts?: {
  apiKey?: string;
  trainNos?: string[];
  hotSetPath?: string;
  outDir?: string;
  now?: Date;
  fetchImpl?: typeof fetch;
  loadEnv?: boolean;
}): Promise<{
  outDir: string;
  mode: "live";
  count: number;
  records: Array<{
    harvestedAt: number;
    trainNo: string;
    ok: boolean;
    source: string;
    status: number;
    body: unknown;
    outFile: string;
  }>;
}>;
