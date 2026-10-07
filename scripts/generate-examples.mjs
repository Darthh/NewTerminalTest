import { mkdir, writeFile } from "node:fs/promises";
import {
  createDemoWorkspace,
  createReport,
  buildReportPdf,
  reportCsv,
} from "../lib/advisor.mjs";
const workspace = createDemoWorkspace();
const report = createReport({
  type: "Standard",
  template: "Overview Summary Report",
  portfolioIds: ["model-1"],
  title: "Balanced Global — Portfolio Overview",
  client: "Illustrative research",
  preparedBy: "Luna Terminal",
  dateRange: "October 2026 · Allocation snapshot",
});
report.createdAt = "2026-10-07T00:00:00.000Z";
report.pages[0].text =
  "This fictional model allocates 40% to US equities, 20% to international equities, and 40% to fixed income. The allocation describes a research example, not a personalized recommendation or a brokerage account. The figures use a $100,000 illustrative notional. No live performance, income, fees, or suitability assessment is included.";
report.pages.at(-1).text =
  "Questions for a portfolio review: How much liquidity is required? Does the investment horizon match the allocation? Is regional or sector concentration appropriate? What assumptions would change after reviewing actual fund holdings, expense ratios, tax considerations, and historical total returns? Those provider inputs are unavailable in this preview.";
await mkdir("docs/examples", { recursive: true });
await writeFile(
  "docs/examples/balanced-global.pdf",
  await buildReportPdf(report, workspace.portfolios),
);
await writeFile(
  "docs/examples/balanced-global.csv",
  reportCsv(report, workspace.portfolios),
);
console.log("Generated fictional Balanced Global PDF and CSV examples.");
