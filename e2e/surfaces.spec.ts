import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function injectDelay(
  request: import("@playwright/test").APIRequestContext,
  delayMin: number,
) {
  const live = await request.get("/api/v2/live/12951");
  expect(live.ok()).toBeTruthy();
  const body = (await live.json()) as {
    observations?: Array<{ scheduledMin: number; runDate: string; lat?: number; lng?: number }>;
    lat?: number;
    lng?: number;
  };
  const geo = await request.get("/api/v2/train/12951/geojson");
  const geoBody = (await geo.json()) as {
    features: Array<{ geometry: { coordinates: Array<[number, number]> } }>;
  };
  const origin = geoBody.features[0]?.geometry.coordinates[0];
  const obs = body.observations?.[0];
  const scheduledMin = obs?.scheduledMin ?? 0;
  const runDate = obs?.runDate ?? "2026-09-04";
  const recordedAt = Date.parse(`${runDate}T00:00:00+05:30`) + (scheduledMin + delayMin) * 60_000;
  const posted = await request.post("/api/v2/observations", {
    data: {
      trainNo: "12951",
      lat: obs?.lat ?? body.lat ?? origin?.[1],
      lng: obs?.lng ?? body.lng ?? origin?.[0],
      recordedAt,
      consent: true,
    },
  });
  expect(posted.ok()).toBeTruthy();
}

test.describe.configure({ timeout: 120_000 });

test("axe reports zero violations on display and passenger routes", async ({ page }) => {
  await page.goto("/display/NDLS");
  const displayResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(displayResults.violations).toEqual([]);

  await page.goto("/train/12951");
  const trainResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(trainResults.violations).toEqual([]);
});

test("one injected delay updates passenger, display, and control room with the same eta", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await request.delete("/api/v2/observations?train=12951");

  await injectDelay(request, 90);

  await expect
    .poll(
      async () => {
        const afterRes = await request.get("/api/v2/eta?train=12951&station=NDLS");
        const after = (await afterRes.json()) as { eta: string; delayMin: number };
        return after.delayMin >= 45 ? after.eta : "";
      },
      { timeout: 20_000 },
    )
    .not.toBe("");

  await page.goto("/train/12951", { waitUntil: "domcontentloaded" });
  const passenger = page.getByTestId("engine-eta-block").locator("[data-engine-eta]");
  await expect(passenger).toBeVisible({ timeout: 30_000 });
  await expect
    .poll(
      async () => {
        const fresh = await request.get("/api/v2/eta?train=12951&station=NDLS");
        const body = (await fresh.json()) as { eta: string };
        return passenger.getAttribute("data-engine-eta").then((attr) => attr === body.eta);
      },
      { timeout: 30_000 },
    )
    .toBe(true);

  const expectedRes = await request.get("/api/v2/eta?train=12951&station=NDLS");
  const expected = (await expectedRes.json()) as { eta: string };

  await page.goto("/display/NDLS", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("station-display")).toBeVisible();
  const display = page.locator('[data-train-no="12951"]');
  await expect(display).toHaveAttribute("data-engine-eta", expected.eta, { timeout: 30_000 });
  expect(errors.filter((row) => !row.includes("favicon"))).toEqual([]);

  await page.goto("/control-room", { waitUntil: "domcontentloaded" });
  const control = page.getByTestId("engine-spotlight").locator("[data-engine-eta]");
  await expect(control).toHaveAttribute("data-engine-eta", expected.eta, { timeout: 45_000 });
  await expect(page.getByTestId("cascade-list")).toContainText("12001", { timeout: 20_000 });
  const accuracy = page.getByTestId("retrain-accuracy");
  await expect(accuracy).toBeVisible();
  const firstMae = Number(await accuracy.getAttribute("data-mae-first"));
  const lastMae = Number(await accuracy.getAttribute("data-mae-last"));
  expect(lastMae).toBeLessThan(firstMae);
});
