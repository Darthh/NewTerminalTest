import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import assert from "node:assert/strict";

const base = process.env.LUNA_TEST_URL || "http://127.0.0.1:3000";
await fs.mkdir("artifacts/qa", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const routes = [
  "about",
  "dashboard/chat",
  "dashboard",
  "stock/NVDA",
  "finance-crm",
  "client-portfolios",
  "model-portfolios",
  "reports",
  "13Filings",
  "screener",
  "market-movers",
  "earnings-calendar",
  "maps",
  "supply-chain",
  "graphs/comparison",
  "regression-analysis",
  "global-markets",
  "watchlist",
  "alerts",
];
try {
  for (const route of routes) {
    const response = await page.goto(`${base}/${route}`, {
      waitUntil: "networkidle",
    });
    assert.equal(response.status(), 200, route);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(
      (await page.locator("h1").count()) > 0,
      true,
      `Heading on ${route}`,
    );
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    );
    assert.equal(overflow, false, `Desktop overflow ${route}`);
    if (
      [
        "about",
        "dashboard/chat",
        "dashboard",
        "stock/NVDA",
        "finance-crm",
        "reports",
      ].includes(route)
    )
      await page.screenshot({
        path: `artifacts/qa/desktop-${route.replaceAll("/", "-")}.png`,
        fullPage: true,
        animations: "disabled",
      });
    console.log(
      JSON.stringify({
        route,
        viewport: "desktop",
        status: response.status(),
        overflow,
      }),
    );
  }
  for (const width of [1280, 820, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of [
      "about",
      "dashboard/chat",
      "dashboard",
      "stock/NVDA",
      "finance-crm",
      "reports",
      "screener",
      "watchlist",
    ]) {
      await page.goto(`${base}/${route}`, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      assert.equal(overflow, false, `${width}px overflow ${route}`);
      if (width === 390)
        await page.screenshot({
          path: `artifacts/qa/mobile-${route.replaceAll("/", "-")}.png`,
          fullPage: true,
          animations: "disabled",
        });
      console.log(JSON.stringify({ route, width, overflow }));
    }
  }
  assert.deepEqual(errors, [], "No browser runtime errors");
  await fs.writeFile(
    "artifacts/qa/routes.json",
    JSON.stringify(
      { routes, viewports: [1440, 1280, 820, 390], errors },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
