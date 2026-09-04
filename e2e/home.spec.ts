import { expect, test } from "@playwright/test";

test("home page renders a five-digit timetable count", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/\d{1,2},\d{3} trains in the published timetable/)).toBeVisible();
});
