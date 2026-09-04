import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export const FORBIDDEN_CLIENT_SUBSTRINGS = ["rr_live_"] as const;

export const BUNDLE_BUDGETS = {
  totalJsBytes: 6_500_000,
  assets: [
    { prefix: "index-", maxBytes: 1_600_000 },
    { prefix: "control-room-", maxBytes: 900_000 },
    { prefix: "catalog-", maxBytes: 2_200_000 },
  ],
} as const;

export function clientAssetDir(root: string = process.cwd()): string {
  return join(root, ".vercel", "output", "static", "assets");
}

export type AssetSize = { name: string; bytes: number };

export type BundleScanResult = {
  available: boolean;
  dir: string;
  files: AssetSize[];
  leaks: Array<{ file: string; needle: string }>;
  totalJsBytes: number;
  overBudget: string[];
};

export function listClientJs(dir: string): AssetSize[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".js"))
    .map((name) => ({ name, bytes: statSync(join(dir, name)).size }))
    .sort((a, b) => b.bytes - a.bytes);
}

export function scanHaystack(haystack: string, needles: readonly string[]): string[] {
  return needles.filter((needle) => haystack.includes(needle));
}

export function scanClientBundle(root: string = process.cwd()): BundleScanResult {
  const dir = clientAssetDir(root);
  const files = listClientJs(dir);
  const leaks: Array<{ file: string; needle: string }> = [];
  let totalJsBytes = 0;
  for (const file of files) {
    totalJsBytes += file.bytes;
    const haystack = readFileSync(join(dir, file.name), "utf8");
    for (const needle of scanHaystack(haystack, FORBIDDEN_CLIENT_SUBSTRINGS)) {
      leaks.push({ file: file.name, needle });
    }
  }
  const overBudget: string[] = [];
  if (totalJsBytes > BUNDLE_BUDGETS.totalJsBytes) {
    overBudget.push(`total JS ${totalJsBytes} > ${BUNDLE_BUDGETS.totalJsBytes}`);
  }
  for (const asset of BUNDLE_BUDGETS.assets) {
    const match = files.find((file) => file.name.startsWith(asset.prefix));
    if (match && match.bytes > asset.maxBytes) {
      overBudget.push(`${match.name} ${match.bytes} > ${asset.maxBytes}`);
    }
  }
  return {
    available: files.length > 0,
    dir,
    files,
    leaks,
    totalJsBytes,
    overBudget,
  };
}

export function assertClientBundle(root: string = process.cwd()): BundleScanResult {
  const result = scanClientBundle(root);
  if (!result.available) {
    throw new Error(`Client assets missing at ${result.dir}. Run npm run build first.`);
  }
  if (result.leaks.length > 0) {
    const detail = result.leaks.map((row) => `${row.file}:${row.needle}`).join(", ");
    throw new Error(`Forbidden substring in client bundle: ${detail}`);
  }
  if (result.overBudget.length > 0) {
    throw new Error(`Bundle budget exceeded: ${result.overBudget.join("; ")}`);
  }
  return result;
}
