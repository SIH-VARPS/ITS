import { expect, test } from "@playwright/test";

test.describe.configure({ timeout: 120_000 });

test("control room renders synthetic and real eval hold-outs separately", async ({ page }) => {
  await page.goto("/control-room", { waitUntil: "domcontentloaded" });
  const panel = page.locator('[data-testid="eval-panel"][data-eval-hydrated="true"]');
  await expect(panel).toBeVisible({ timeout: 45_000 });
  const synthetic = panel.getByTestId("eval-cohort-synthetic");
  const real = panel.getByTestId("eval-cohort-real");
  await expect(synthetic).toBeVisible();
  await expect(real).toBeVisible();
  const syntheticN = Number((await synthetic.innerText()).replace(/[^\d]/g, ""));
  const realN = Number((await real.innerText()).replace(/[^\d]/g, ""));
  expect(syntheticN).toBeGreaterThan(0);
  expect(realN).toBeGreaterThan(0);
  expect(syntheticN).not.toBe(realN);
  await expect(panel.getByTestId("eval-holdout-n")).toHaveText(String(syntheticN));
  await expect(synthetic).toHaveAttribute("data-eval-active", "true");
  await real.scrollIntoViewIfNeeded();
  await real.click({ force: true });
  await expect(real).toHaveAttribute("data-eval-active", "true", { timeout: 15_000 });
  await expect(panel.getByTestId("eval-holdout-n")).toHaveText(String(realN));
});

test("live tier on the passenger page matches /api/v2/live and eta still serves", async ({
  page,
  request,
}) => {
  const liveRes = await request.get("/api/v2/live/12951");
  expect(liveRes.ok()).toBeTruthy();
  const live = (await liveRes.json()) as { source: string };
  expect(["railradar", "crowd", "replay"]).toContain(live.source);

  await page.goto("/train/12951", { waitUntil: "domcontentloaded" });
  const etaNode = page.locator("[data-engine-eta]").first();
  await expect(etaNode).toBeVisible({ timeout: 30_000 });
  await expect
    .poll(
      async () => {
        const etaRes = await request.get("/api/v2/eta?train=12951&station=NDLS");
        expect(etaRes.ok()).toBeTruthy();
        const eta = (await etaRes.json()) as { eta: string };
        return etaNode.getAttribute("data-engine-eta").then((attr) => attr === eta.eta);
      },
      { timeout: 30_000 },
    )
    .toBe(true);
  await expect(page.locator("[data-source-tier]").first()).toHaveAttribute(
    "data-source-tier",
    live.source,
  );
});

test("blocked vendor hosts do not stop the engine eta (replay path)", async ({ page }) => {
  await page.route("https://api.railradar.in/**", (route) => route.abort());
  await page.route("https://api.open-meteo.com/**", (route) => route.abort());
  await page.goto("/train/12951", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-engine-eta]").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.locator("[data-source-tier]").first()).toHaveAttribute(
    "data-source-tier",
    /railradar|crowd|replay/,
  );
});

test("GPS consent is required before an observation POST", async ({ page, context, request }) => {
  const geo = await request.get("/api/v2/train/12951/geojson");
  expect(geo.ok()).toBeTruthy();
  const geoBody = (await geo.json()) as {
    features: Array<{ geometry: { coordinates: Array<[number, number]> } }>;
  };
  const origin = geoBody.features[0]?.geometry.coordinates[0];
  expect(origin).toBeTruthy();
  const recordedAt = Date.now();

  const denied = await request.post("/api/v2/observations", {
    data: {
      trainNo: "12951",
      lat: origin![1],
      lng: origin![0],
      recordedAt,
      consent: false,
    },
  });
  expect(denied.status()).toBe(400);

  const posts: string[] = [];
  page.on("request", (req) => {
    if (req.method() === "POST" && req.url().includes("/api/v2/observations")) {
      posts.push(req.url());
    }
  });

  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: origin![1], longitude: origin![0] });
  await page.goto("/train/12951", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("gps-consent")).not.toBeChecked();
  await page.getByRole("button", { name: /in train/i }).click();
  await expect(
    page.getByText(/Acquiring GPS|On-Board GPS|GPS active|Location permission|Geolocation/i),
  ).toBeVisible({ timeout: 15_000 });
  expect(posts).toEqual([]);

  const allowed = await request.post("/api/v2/observations", {
    data: {
      trainNo: "12951",
      lat: origin![1],
      lng: origin![0],
      recordedAt: recordedAt + 1,
      consent: true,
    },
  });
  expect(allowed.ok()).toBeTruthy();
  await request.delete("/api/v2/observations?train=12951");
});
