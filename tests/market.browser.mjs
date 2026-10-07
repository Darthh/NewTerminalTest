import { chromium, expect } from "@playwright/test";
import fs from "node:fs/promises";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const base = process.env.LUNA_TEST_URL || "http://127.0.0.1:3000";
const artifacts = "artifacts/market-qa";
await fs.mkdir(artifacts, { recursive: true });
const checks = [];
function pass(name) {
  checks.push(name);
  console.log(`PASS ${name}`);
}
async function goto(route) {
  await page.goto(base + route);
  await page.locator(".market-view h1").first().waitFor();
}
async function chartDrag(from, to) {
  const box = await page
    .locator(".stock-chart-panel .main-price-svg")
    .boundingBox();
  await page.mouse.move(box.x + box.width * from, box.y + box.height * 0.45);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * to, box.y + box.height * 0.45, {
    steps: 15,
  });
  await page.mouse.up();
}
try {
  await goto("/dashboard");
  await page.evaluate(() =>
    localStorage.removeItem("luna-dashboard-layout-v1"),
  );
  await page.reload();
  await page.waitForFunction(
    () => localStorage.getItem("luna-dashboard-layout-v1") !== null,
  );
  await expect(page.locator(".dashboard-widget")).toHaveCount(4);
  await page
    .getByRole("button", { name: "Resize Market sentiment", exact: true })
    .click();
  await expect(page.locator(".dashboard-widget").first()).toHaveAttribute(
    "style",
    /12/,
  );
  await page
    .getByRole("button", {
      name: "Move Market performance earlier",
      exact: true,
    })
    .click();
  await expect(page.locator(".dashboard-widget h2").first()).toHaveText(
    "Market performance",
  );
  await page.reload();
  await expect(page.locator(".dashboard-widget h2").first()).toHaveText(
    "Market performance",
  );
  pass("dashboard resize and keyboard reordering persist");
  await page.getByRole("button", { name: "Add widget", exact: true }).click();
  await expect(
    page
      .locator(".widget-add-menu")
      .getByRole("button", { name: "Market movers", exact: true }),
  ).toBeDisabled();
  await page
    .locator(".widget-add-menu")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  while (await page.locator(".dashboard-widget").count())
    await page
      .locator(".dashboard-widget .widget-controls button")
      .last()
      .click();
  await expect(page.getByText("A little room to think.")).toBeVisible();
  await page.reload();
  await expect(page.locator(".dashboard-widget")).toHaveCount(0);
  pass("four-widget limit and deliberately empty layout persist");
  await page.getByRole("button", { name: "Add widget", exact: true }).click();
  await page
    .getByRole("button", { name: "Market sentiment", exact: true })
    .click();
  await expect(page.locator(".dashboard-widget")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".dashboard-widget")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Restore default layout", exact: true })
    .click();
  await expect(page.locator(".dashboard-widget")).toHaveCount(4);
  await page.screenshot({
    path: artifacts + "/dashboard-desktop.png",
    fullPage: true,
  });
  pass("dashboard adding and restore work");
  await goto("/stock/NVDA");
  await chartDrag(0.18, 0.74);
  await expect(page.locator(".measurement-result")).toBeVisible();
  const first = await page.locator(".measurement-result").textContent();
  await page.mouse.move(10, 10);
  await expect(page.locator(".measurement-result")).toHaveText(first);
  await chartDrag(0.74, 0.18);
  await expect(page.locator(".measurement-result")).toHaveText(first);
  pass(
    "forward/backward chart measurement normalized and persists after release",
  );
  await page
    .locator(".stock-chart-panel .main-price-svg")
    .click({ position: { x: 50, y: 60 } });
  await expect(page.locator(".measurement-result")).toHaveCount(0);
  await chartDrag(0.2, 0.8);
  await page
    .locator(".stock-chart-tools .range-tabs")
    .getByRole("button", { name: "3M", exact: true })
    .click();
  await expect(page.locator(".measurement-result")).toHaveCount(0);
  pass("chart click and range changes clear the measurement");
  await page.getByLabel("Compare SPY", { exact: true }).check();
  await expect(
    page.getByText("Return rebased to 0% · aligned dates"),
  ).toBeVisible();
  await page.getByText("Measure with keyboard", { exact: true }).click();
  await page.locator(".accessible-measure select").nth(0).selectOption("90");
  await page.locator(".accessible-measure select").nth(1).selectOption("10");
  await page
    .getByRole("button", { name: "Measure interval", exact: true })
    .click();
  await expect(page.locator(".measurement-result")).toBeVisible();
  await page.screenshot({
    path: artifacts + "/stock-desktop.png",
    fullPage: true,
  });
  pass("SPY comparison and accessible interval measurement work");
  await goto("/watchlist");
  await page.waitForFunction(
    () => localStorage.getItem("luna-watchlist-v1") !== null,
  );
  const original = await page.locator(".watchlist-table tbody tr").count();
  await page.getByPlaceholder("Find a company to add").fill("AMD");
  await page
    .locator(".watchlist-search-results button")
    .filter({ hasText: "AMD" })
    .click();
  await expect(page.locator(".watchlist-table tbody tr")).toHaveCount(
    original + 1,
  );
  await page.getByLabel("AMD shares", { exact: true }).fill("12.5");
  await page.reload();
  await expect(page.getByLabel("AMD shares", { exact: true })).toHaveValue(
    "12.5",
  );
  await page.getByPlaceholder("Find a company to add").fill("AMD");
  await expect(
    page.getByText("No new symbols match your search."),
  ).toBeVisible();
  await page.getByLabel("Remove AMD", { exact: true }).click();
  await page.reload();
  await expect(page.locator(".watchlist-table tbody tr")).toHaveCount(original);
  pass(
    "watchlist add, nullable quantity, duplicate prevention, remove and reload persistence",
  );
  await goto("/screener");
  await page.getByPlaceholder("Search company or ticker").fill("nvidia");
  await expect(page.locator(".market-table tbody tr")).toHaveCount(1);
  await expect(page.locator(".market-table tbody")).toContainText("NVDA");
  await page
    .getByRole("button", { name: "Reset filters", exact: true })
    .click();
  await page
    .getByLabel("Filter by sector", { exact: true })
    .selectOption("Financials");
  await expect(page.locator(".market-table tbody tr")).toHaveCount(2);
  pass("search and sector filtering work");
  await goto("/alerts");
  await page.getByRole("button", { name: "Create rule", exact: true }).click();
  await page
    .getByText("Test a crossing with a simulated quote", { exact: true })
    .click();
  await page
    .getByRole("button", { name: "Evaluate locally", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "1 new threshold crossing",
  );
  await page
    .getByRole("button", { name: "Evaluate locally", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "0 new threshold crossings",
  );
  await page.reload();
  await expect(page.locator(".alert-rule")).toHaveCount(1);
  pass(
    "alert rules persist and simulations deduplicate crossings without delivery claims",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "/dashboard",
    "/stock/NVDA",
    "/watchlist",
    "/screener",
    "/alerts",
    "/maps",
  ]) {
    await goto(route);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
    if (route === "/dashboard" || route === "/stock/NVDA")
      await page.screenshot({
        path: artifacts + route.replaceAll("/", "-") + "-mobile.png",
        fullPage: true,
      });
  }
  pass("six market routes fit 390px without horizontal page overflow");
  expect(errors).toEqual([]);
  pass("no client hydration or runtime errors");
  await fs.writeFile(
    artifacts + "/results.json",
    JSON.stringify({ checks, errors }, null, 2),
  );
} finally {
  await browser.close();
}
