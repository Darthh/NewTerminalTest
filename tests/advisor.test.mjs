import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument, PDFName } from "pdf-lib";
import {
  ADVISOR_STORAGE_KEY,
  buildReportPdf,
  clientsCsv,
  createDemoWorkspace,
  createReport,
  csvCell,
  layoutReport,
  parseCsv,
  parseHoldings,
  portfolioAllocation,
  readWorkspace,
  reportCsv,
  reportRows,
  saveWorkspaceRecord,
  validateClient,
  validateHoldings,
  validatePortfolio,
  validateReport,
} from "../lib/advisor.mjs";

function memoryStorage() {
  const items = new Map();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => items.set(key, value),
  };
}

test("portfolio allocations preserve fractional weights and expose cash", () => {
  const p = {
    mode: "weights",
    holdings: [
      { symbol: "VTI", weight: 60.25 },
      { symbol: "BND", weight: 30.5 },
    ],
  };
  const actual = portfolioAllocation(p);
  assert.equal(actual.rows[0].value, 60250);
  assert.equal(actual.rows[1].allocation, 30.5);
  assert.equal(actual.cashWeight, 9.25);
  assert.equal(
    actual.rows.reduce((sum, row) => sum + row.value, 0) +
      actual.cashWeight * 1000,
    actual.total,
  );
});

test("share quantities are never valued without market prices", () => {
  const allocation = portfolioAllocation({
    mode: "shares",
    holdings: [{ symbol: "AAPL", shares: 25 }],
  });
  assert.equal(allocation.valued, false);
  assert.equal(allocation.total, null);
  assert.equal(allocation.rows[0].value, null);
  assert.equal(allocation.rows[0].allocation, null);
});

test("holding validation rejects duplicates, invalid symbols, nonfinite numbers, and excess allocation", () => {
  assert.throws(
    () =>
      validateHoldings([
        { symbol: "spy", weight: 50 },
        { symbol: "SPY", weight: 50 },
      ]),
    /Duplicate ticker/,
  );
  assert.throws(
    () => validateHoldings([{ symbol: "../spy", weight: 10 }]),
    /valid ticker/,
  );
  assert.throws(
    () => validateHoldings([{ symbol: "SPY", weight: Infinity }]),
    /finite number/,
  );
  assert.throws(
    () => validateHoldings([{ symbol: "SPY", weight: "" }]),
    /finite number/,
  );
  assert.throws(
    () =>
      validateHoldings([
        { symbol: "SPY", weight: 70 },
        { symbol: "QQQ", weight: 31 },
      ]),
    /exceed 100/,
  );
  assert.throws(
    () => validateHoldings([{ symbol: "SPY", shares: -10 }], "shares"),
    /greater than zero/,
  );
  assert.throws(
    () => validatePortfolio({ name: "  ", mode: "weights", holdings: [] }),
    /portfolio name/,
  );
  assert.deepEqual(
    validateHoldings([{ symbol: " vti ", weight: "60.25", name: "" }])[0],
    { symbol: "VTI", weight: 60.25, name: "VTI", assetClass: "Unclassified" },
  );
});

test("CSV imports support quoted names, quoted multiline fields, percent weights, and TSV", () => {
  const imported = parseHoldings(
    'Symbol,Name,Weight (%),Asset class\r\nVTI,"Vanguard, Total Market",60%,US equity\r\nBND,"Bond\nfund",40,Fixed income',
  );
  assert.equal(imported[0].name, "Vanguard, Total Market");
  assert.equal(imported[1].name, "Bond\nfund");
  assert.equal(imported[0].weight, 60);
  assert.equal(
    parseHoldings("Symbol\tShares\nAAPL\t25", "shares")[0].shares,
    25,
  );
  assert.equal(parseHoldings("SPY,60\nBND,40")[0].weight, 60);
  assert.throws(() => parseHoldings("Symbol,Shares\nSPY,25"), /Weight/);
  assert.throws(() => parseCsv('Symbol,Name\nAAPL,"unclosed'), /unclosed/);
});

test("CSV formula-like client input is made inert while numeric negative values stay numeric", () => {
  assert.equal(csvCell('=HYPERLINK("bad")'), '"\'=HYPERLINK(""bad"")"');
  assert.equal(csvCell("  +cmd"), '"\'  +cmd"');
  assert.equal(csvCell("@SUM(A1)"), '"\'@SUM(A1)"');
  assert.equal(csvCell(-25), '"-25"');
  const csv = clientsCsv([{ name: "=1+1", notes: 'a,"b"\nline' }]);
  const parsed = parseCsv(csv);
  assert.equal(parsed[1][0], "'=1+1");
  assert.equal(parsed[1][8], 'a,"b"\nline');
});

test("local saves reload, reject stale revisions, and do not silently overwrite newer edits", () => {
  const storage = memoryStorage();
  const seed = createDemoWorkspace();
  const original = seed.clients[0];
  const first = saveWorkspaceRecord(
    storage,
    "clients",
    { ...original, notes: "First saved edit" },
    original.revision,
    seed,
  );
  assert.equal(first.record.revision, 2);
  assert.equal(readWorkspace(storage).clients[0].notes, "First saved edit");
  assert.throws(
    () =>
      saveWorkspaceRecord(
        storage,
        "clients",
        { ...original, notes: "Stale edit" },
        original.revision,
        seed,
      ),
    /changed in another tab/,
  );
  assert.equal(readWorkspace(storage).clients[0].notes, "First saved edit");
});

test("portfolio client associations update both sides in one storage write", () => {
  const storage = memoryStorage();
  const seed = createDemoWorkspace();
  const original = seed.portfolios[0];
  const result = saveWorkspaceRecord(
    storage,
    "portfolios",
    { ...original, clientId: "client-2" },
    original.revision,
    seed,
  );
  const stored = result.workspace;
  assert.equal(stored.clients[0].portfolioIds.includes(original.id), false);
  assert.equal(stored.clients[1].portfolioIds.includes(original.id), true);
  assert.equal(stored.portfolios[0].clientId, "client-2");
  assert.equal(stored.clients[0].revision, seed.clients[0].revision + 1);
  assert.equal(stored.clients[1].revision, seed.clients[1].revision + 1);
});

test("client portfolio assignment removes the prior relationship", () => {
  const storage = memoryStorage();
  const seed = createDemoWorkspace();
  const second = seed.clients[1];
  const { workspace } = saveWorkspaceRecord(
    storage,
    "clients",
    { ...second, portfolioIds: ["portfolio-1", "portfolio-2"] },
    second.revision,
    seed,
  );
  assert.equal(workspace.portfolios[0].clientId, second.id);
  assert.equal(
    workspace.clients[0].portfolioIds.includes("portfolio-1"),
    false,
  );
});

test("unavailable or malformed browser storage never reports a successful save", () => {
  const denied = {
    getItem: () => null,
    setItem: () => {
      throw new Error("Quota exceeded");
    },
  };
  assert.throws(
    () =>
      saveWorkspaceRecord(
        denied,
        "clients",
        createDemoWorkspace().clients[0],
        1,
      ),
    /Quota exceeded/,
  );
  const corrupt = memoryStorage();
  corrupt.setItem(ADVISOR_STORAGE_KEY, "{invalid");
  assert.throws(() => readWorkspace(corrupt), /unreadable/);
  assert.throws(
    () =>
      saveWorkspaceRecord(
        corrupt,
        "clients",
        createDemoWorkspace().clients[0],
        1,
      ),
    /unreadable/,
  );
  assert.equal(corrupt.getItem(ADVISOR_STORAGE_KEY), "{invalid");
  assert.throws(
    () =>
      validateClient({ ...createDemoWorkspace().clients[0], email: "invalid" }),
    /valid email/,
  );
});

test("report type limits and blank headings are validated", () => {
  assert.throws(
    () => createReport({ type: "Standard", portfolioIds: ["a", "b", "c"] }),
    /between 1 and 2/,
  );
  assert.throws(
    () => createReport({ type: "Comparison", portfolioIds: [] }),
    /between 1 and 5/,
  );
  const valid = createReport({
    type: "Comparison",
    portfolioIds: ["a", "b", "c", "d", "e"],
  });
  assert.equal(validateReport(valid).portfolioIds.length, 5);
  assert.throws(
    () => validateReport({ ...valid, pages: [{ title: "", text: "" }] }),
    /heading/,
  );
  assert.throws(
    () => validateReport({ ...valid, portfolioIds: ["a", "a"] }),
    /different portfolios/,
  );
});

test("report layout preserves all notes and selected holdings across continuation pages", () => {
  const portfolio = {
    id: "many",
    name: "Large demo allocation",
    mode: "weights",
    holdings: Array.from({ length: 30 }, (_, i) => ({
      symbol: `T${i}`,
      name: `Test security ${i}`,
      weight: 3,
      assetClass: "US equity",
    })),
  };
  const report = createReport({ portfolioIds: ["many"], template: "Blank" });
  report.topHoldings = 200;
  report.pages = [
    {
      id: "holdings",
      kind: "holdings",
      visible: true,
      title: "All holdings",
      text: "Detailed allocation notes. ".repeat(120),
    },
    {
      id: "hidden",
      kind: "notes",
      visible: false,
      title: "Hidden",
      text: "This section must not export.",
    },
  ];
  const sections = layoutReport(report, [portfolio]);
  assert.equal(
    sections.reduce((sum, page) => sum + page.rows.length, 0),
    31,
  );
  assert.equal(
    sections.some((page) => page.sourceId === "hidden"),
    false,
  );
  assert.ok(sections.length > 4);
  assert.ok(
    sections.every(
      (page) => page.rows.length <= 8 && page.textLines.length <= 3,
    ),
  );
  assert.equal(
    sections
      .flatMap((page) => page.textLines)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim(),
    report.pages[0].text.trim(),
  );
  assert.equal(reportRows(report, [portfolio]).at(-1).symbol, "CASH");
  assert.equal(reportRows(report, [portfolio]).at(-1).value, 10000);
  assert.equal(parseCsv(reportCsv(report, [portfolio])).length, 32);
});

test("PDF exports every visible planned page with landscape dimensions and useful metadata", async () => {
  const seed = createDemoWorkspace();
  const report = createReport({
    portfolioIds: [seed.portfolios[0].id],
    title: "Bennett Allocation Review",
    client: seed.clients[0].name,
    preparedBy: "Jordan Ellis",
  });
  report.pages.push({
    id: "extra",
    kind: "notes",
    title: "Extended commentary",
    visible: true,
    text: "Long-form portfolio research and review notes. ".repeat(160),
  });
  const planned = layoutReport(report, seed.portfolios);
  const bytes = await buildReportPdf(report, seed.portfolios);
  assert.ok(bytes.length > 3000);
  const loaded = await PDFDocument.load(bytes);
  assert.equal(loaded.getPageCount(), planned.length);
  assert.equal(loaded.getTitle(), report.title);
  assert.equal(loaded.getAuthor(), "Jordan Ellis");
  assert.deepEqual(loaded.getPage(0).getSize(), { width: 842, height: 595 });
  assert.ok(
    loaded
      .getPages()
      .every((page) => page.node.Resources().has(PDFName.of("Font"))),
  );
});

test("all-hidden reports fail export instead of generating an empty successful PDF", async () => {
  const seed = createDemoWorkspace();
  const report = createReport({ portfolioIds: ["portfolio-1"] });
  report.pages.forEach((page) => {
    page.visible = false;
  });
  assert.throws(() => layoutReport(report, seed.portfolios), /at least one/);
  await assert.rejects(
    () => buildReportPdf(report, seed.portfolios),
    /at least one/,
  );
});
