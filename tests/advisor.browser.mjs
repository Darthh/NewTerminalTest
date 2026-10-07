import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";

const base = process.env.LUNA_TEST_URL || "http://127.0.0.1:3000";
const output = path.resolve("artifacts/advisor-qa");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
  timezoneId: "America/Los_Angeles",
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const clientName = "QA Local Client";
const portfolioName = "QA Balanced Allocation";
const reportTitle = "QA Portfolio Review";
const result = { journeys: [], downloads: [], errors };
const click = (name, exact = true) =>
  page.getByRole("button", { name, exact }).click();
const assertNoOverflow = async (label) => {
  const dimensions = await page.evaluate(() => ({
    width: window.innerWidth,
    body: document.body.scrollWidth,
    html: document.documentElement.scrollWidth,
  }));
  assert.ok(
    dimensions.body <= dimensions.width + 1 &&
      dimensions.html <= dimensions.width + 1,
    `${label}: document overflow ${JSON.stringify(dimensions)}`,
  );
  result.journeys.push(`${label}: no document overflow`);
};
async function saveDownload(button, file) {
  const promise = page.waitForEvent("download");
  await button.click();
  const downloaded = await promise;
  const destination = path.join(output, file);
  await downloaded.saveAs(destination);
  assert.equal(await downloaded.failure(), null);
  result.downloads.push(file);
  return destination;
}

try {
  await page.goto(`${base}/finance-crm`);
  await page
    .getByRole("heading", { name: "Finance CRM", exact: true })
    .waitFor();
  await click("Add client");
  await page.getByLabel("Client / household name").fill(clientName);
  await page.getByLabel("Email address").fill("qa.local@example.com");
  await page.getByLabel("Phone", { exact: true }).fill("(415) 555-0100");
  await page.getByLabel("Next review").fill("2026-10-28");
  await page
    .getByLabel("Notes", { exact: true })
    .fill("Created during local browser verification. Fictional client.");
  await click("Save client");
  await page.getByLabel("Search clients, email, or advisor").fill(clientName);
  await page
    .locator(".advisor-client-name")
    .filter({ hasText: clientName })
    .waitFor();
  await page.reload();
  await page.getByLabel("Search clients, email, or advisor").fill(clientName);
  await page
    .locator(".advisor-client-name")
    .filter({ hasText: clientName })
    .click();
  await page
    .getByLabel("Notes", { exact: true })
    .fill("Edited after a reload. Local persistence verified.");
  await click("Save client");
  await page.reload();
  let saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("luna:advisor:demo:v1")),
  );
  assert.equal(
    saved.clients.find((c) => c.name === clientName).notes,
    "Edited after a reload. Local persistence verified.",
  );
  result.journeys.push(
    "Create client, edit, reload, and verify local persistence",
  );
  await page.getByRole("tab", { name: "Reviews", exact: true }).click();
  await page
    .locator(".advisor-review")
    .filter({ hasText: clientName })
    .waitFor();
  result.journeys.push("Scheduled client review appears in Reviews");
  await page.getByRole("tab", { name: /^Clients/ }).click();
  await page.getByLabel("Search clients, email, or advisor").fill(clientName);
  await saveDownload(
    page.getByRole("button", { name: "Export CSV", exact: true }),
    "clients.csv",
  );
  await page.screenshot({
    path: path.join(output, "crm-desktop.png"),
    fullPage: true,
  });
  await assertNoOverflow("1440px CRM");

  await page.goto(`${base}/client-portfolios`);
  await click("Add New");
  await page.getByLabel("Portfolio name", { exact: true }).fill(portfolioName);
  const client = saved.clients.find((c) => c.name === clientName);
  await page.getByLabel("Client association").selectOption(client.id);
  await page.getByLabel("Holding 1 ticker").fill("SPY");
  await page.getByLabel("Holding 1 name").fill("SPDR S&P 500 ETF Trust");
  await page.getByLabel("Holding 1 weight").fill("110");
  await click("Save portfolio");
  await page
    .getByRole("alert")
    .filter({ hasText: "cannot exceed 100%" })
    .waitFor();
  await page.getByLabel("Holding 1 weight").fill("70");
  await click("Add holding");
  await page.getByLabel("Holding 2 ticker").fill("BND");
  await page
    .getByLabel("Holding 2 name")
    .fill("Vanguard Total Bond Market ETF");
  await page.getByLabel("Holding 2 weight").fill("30");
  await page.getByLabel("Holding 2 asset class").selectOption("Fixed income");
  await click("Save portfolio");
  await page.getByLabel("Search client portfolios").fill(portfolioName);
  await page
    .locator(".advisor-portfolio-name")
    .filter({ hasText: portfolioName })
    .waitFor();
  await page.reload();
  saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("luna:advisor:demo:v1")),
  );
  const portfolio = saved.portfolios.find((p) => p.name === portfolioName);
  assert.equal(portfolio.holdings.length, 2);
  assert.equal(
    saved.clients
      .find((c) => c.id === client.id)
      .portfolioIds.includes(portfolio.id),
    true,
  );
  result.journeys.push(
    "Portfolio validation rejects 110% and saves a valid 70/30 allocation with linked client",
  );
  await page.getByLabel("Search client portfolios").fill(portfolioName);
  await saveDownload(
    page.getByRole("button", {
      name: `Download ${portfolioName}`,
      exact: true,
    }),
    "portfolio.csv",
  );
  await page.screenshot({
    path: path.join(output, "portfolios-desktop.png"),
    fullPage: true,
  });

  await page.goto(`${base}/reports`);
  await click("Create Report");
  await page
    .locator(".advisor-report-type")
    .filter({ hasText: "Standard" })
    .click();
  await click("Continue");
  await page
    .locator(".advisor-template-choice")
    .filter({ hasText: "Overview Summary Report" })
    .click();
  await click("Continue");
  await page
    .locator(".advisor-portfolio-choices label")
    .filter({ hasText: portfolioName })
    .locator("input")
    .check();
  await click("Continue");
  await page.getByLabel("Report title").fill(reportTitle);
  await page.getByLabel("Prepared for").selectOption(clientName);
  await page.getByLabel("Prepared by").fill("QA Advisor");
  await click("Open report builder");
  await page
    .getByRole("dialog", { name: "Report builder", exact: true })
    .waitFor();
  await click("Edit Page");
  await page.getByLabel("Page heading").fill("An allocation with a purpose");
  await page
    .getByLabel("Editorial content")
    .fill(
      "Local browser verification confirms a diversified illustrative allocation. ".repeat(
        50,
      ),
    );
  await click("Done editing");
  await page.getByLabel("Continuation page").waitFor();
  await page
    .getByRole("button", { name: "Move Portfolio holdings up", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Hide Research & next steps", exact: true })
    .click();
  await click("Add page");
  await click("Edit Page");
  await page.getByLabel("Page heading").fill("Next review agenda");
  await page
    .getByLabel("Editorial content")
    .fill(
      "Review contribution plans and liquidity needs. All test figures are illustrative.",
    );
  await click("Done editing");
  await click("Save as Template");
  await page.getByLabel("Template name").fill("QA Quarterly Review Template");
  await click("Save template");
  await click("Save Report");
  await page
    .locator(".advisor-builder-status")
    .filter({ hasText: "Report saved in this browser." })
    .waitFor();
  const pdfFile = await saveDownload(
    page.getByRole("button", { name: "Export PDF", exact: true }),
    "portfolio-review.pdf",
  );
  await saveDownload(
    page.getByRole("button", { name: "CSV", exact: true }),
    "report.csv",
  );
  const pdf = await PDFDocument.load(await readFile(pdfFile));
  assert.ok(
    pdf.getPageCount() >= 6,
    `Expected continuation pages; got ${pdf.getPageCount()}`,
  );
  assert.equal(pdf.getTitle(), reportTitle);
  assert.deepEqual(pdf.getPage(0).getSize(), { width: 842, height: 595 });
  result.pdf = {
    pages: pdf.getPageCount(),
    title: pdf.getTitle(),
    size: pdf.getPage(0).getSize(),
  };
  await page.screenshot({
    path: path.join(output, "report-builder-desktop.png"),
    fullPage: true,
  });
  await assertNoOverflow("1440px report builder");
  await page.setViewportSize({ width: 390, height: 844 });
  await assertNoOverflow("390px report builder");
  await page.screenshot({
    path: path.join(output, "report-builder-mobile.png"),
    fullPage: false,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await click("Close report builder");
  await page.reload();
  await page
    .locator(".advisor-report-name")
    .filter({ hasText: reportTitle })
    .click();
  await page
    .getByRole("dialog", { name: "Report builder", exact: true })
    .waitFor();
  saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("luna:advisor:demo:v1")),
  );
  const storedReport = saved.reports.find((r) => r.title === reportTitle);
  assert.equal(storedReport.pages[0].title, "An allocation with a purpose");
  assert.equal(storedReport.pages[1].kind, "holdings");
  assert.equal(
    storedReport.pages.find((p) => p.title === "Research & next steps").visible,
    false,
  );
  assert.equal(storedReport.pages.at(-1).title, "Next review agenda");
  assert.equal(
    saved.templates.some((t) => t.name === "QA Quarterly Review Template"),
    true,
  );
  result.journeys.push(
    "Create report, edit long content, paginate, reorder, hide, add page, save template, export PDF/CSV, and reopen saved report",
  );
  await click("Close report builder");
  await click("Create Report");
  await click("Continue");
  await page
    .locator(".advisor-template-choice")
    .filter({ hasText: "QA Quarterly Review Template" })
    .waitFor();
  await page
    .locator(".advisor-template-choice")
    .filter({ hasText: "QA Quarterly Review Template" })
    .click();
  await click("Continue");
  await page
    .locator(".advisor-portfolio-choices label")
    .filter({ hasText: portfolioName })
    .locator("input")
    .check();
  await click("Continue");
  await page.getByLabel("Report title").fill("QA Reused Template");
  await click("Open report builder");
  await page
    .locator(".advisor-page-select")
    .filter({ hasText: "An allocation with a purpose" })
    .waitFor();
  await click("Close report builder");
  result.journeys.push("Reuse saved report template");

  for (const type of ["One Pager", "Comparison"]) {
    await click("Create Report");
    await page
      .locator(".advisor-report-type")
      .filter({ hasText: type })
      .click();
    await click("Continue");
    await click("Continue");
    await page
      .locator(".advisor-portfolio-choices label")
      .filter({ hasText: portfolioName })
      .locator("input")
      .check();
    await click("Continue");
    await page.getByLabel("Report title").fill(`QA ${type}`);
    await click("Open report builder");
    await click("Save Report");
    await click("Close report builder");
    result.journeys.push(`Create and save ${type} report`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/finance-crm`);
  await page
    .getByRole("heading", { name: "Finance CRM", exact: true })
    .waitFor();
  await assertNoOverflow("390px CRM");
  await page.screenshot({
    path: path.join(output, "crm-mobile.png"),
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  result.status = "passed";
  await writeFile(
    path.join(output, "results.json"),
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  result.status = "failed";
  result.failure = error.stack;
  await page.screenshot({
    path: path.join(output, "failure.png"),
    fullPage: true,
  });
  await writeFile(
    path.join(output, "results.json"),
    JSON.stringify(result, null, 2),
  );
  throw error;
} finally {
  await context.close();
  await browser.close();
}
