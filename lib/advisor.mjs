export const ADVISOR_STORAGE_KEY = "luna:advisor:demo:v1";
export const STAGES = ["Active", "Prospect", "Onboarding", "Archived"];
export const RISKS = ["Conservative", "Moderate", "Growth", "Aggressive"];
export const REPORT_TYPES = ["Standard", "One Pager", "Comparison"];
export const REPORT_TEMPLATES = [
  "Overview Summary Report",
  "Client Proposal",
  "Blank",
];
export const DEMO_NOTIONAL = 100000;

const holding = (symbol, name, weight, assetClass) => ({
  symbol,
  name,
  weight,
  assetClass,
});
export function createDemoWorkspace() {
  return {
    version: 1,
    clients: [
      {
        id: "client-1",
        revision: 1,
        name: "Alex & Morgan Bennett",
        email: "alex.bennett@example.com",
        phone: "(415) 555-0124",
        advisor: "Jordan Ellis",
        stage: "Active",
        risk: "Moderate",
        nextReview: "2026-10-14",
        lastContact: "2026-09-28",
        notes:
          "Annual planning review. Discuss retirement timeline and maintain a diversified allocation.",
        portfolioIds: ["portfolio-1"],
      },
      {
        id: "client-2",
        revision: 1,
        name: "Sophia Chen",
        email: "sophia.chen@example.com",
        phone: "(415) 555-0178",
        advisor: "Jordan Ellis",
        stage: "Active",
        risk: "Growth",
        nextReview: "2026-10-21",
        lastContact: "2026-10-02",
        notes:
          "Long-term growth objective. Review concentrated equity exposure before adding new positions.",
        portfolioIds: ["portfolio-2"],
      },
      {
        id: "client-3",
        revision: 1,
        name: "James Williams",
        email: "james.williams@example.com",
        phone: "(212) 555-0139",
        advisor: "Avery Lee",
        stage: "Onboarding",
        risk: "Conservative",
        nextReview: "2026-10-12",
        lastContact: "2026-10-05",
        notes: "Complete risk questionnaire and document liquidity needs.",
        portfolioIds: ["portfolio-3"],
      },
      {
        id: "client-4",
        revision: 1,
        name: "Isabella Rivera",
        email: "isabella.rivera@example.com",
        phone: "(619) 555-0128",
        advisor: "Avery Lee",
        stage: "Prospect",
        risk: "Moderate",
        nextReview: "2026-10-19",
        lastContact: "2026-09-30",
        notes: "Introductory call booked. No investment recommendation made.",
        portfolioIds: [],
      },
      {
        id: "client-5",
        revision: 1,
        name: "Noah Thompson",
        email: "noah.thompson@example.com",
        phone: "(312) 555-0182",
        advisor: "Jordan Ellis",
        stage: "Active",
        risk: "Aggressive",
        nextReview: "2026-11-03",
        lastContact: "2026-09-26",
        notes: "Review annual contribution plan and tax considerations.",
        portfolioIds: [],
      },
      {
        id: "client-6",
        revision: 1,
        name: "Emma Patel",
        email: "emma.patel@example.com",
        phone: "(646) 555-0152",
        advisor: "Avery Lee",
        stage: "Archived",
        risk: "Moderate",
        nextReview: "",
        lastContact: "2026-07-11",
        notes: "Archived fictional demonstration record.",
        portfolioIds: [],
      },
    ],
    portfolios: [
      {
        id: "portfolio-1",
        revision: 1,
        name: "Bennett • Balanced",
        kind: "client",
        clientId: "client-1",
        mode: "weights",
        lastOpened: "2026-10-06",
        holdings: [
          holding("VTI", "Vanguard Total Stock Market ETF", 40, "US equity"),
          holding(
            "VXUS",
            "Vanguard Total International Stock ETF",
            20,
            "International equity",
          ),
          holding("BND", "Vanguard Total Bond Market ETF", 30, "Fixed income"),
          holding(
            "SGOV",
            "iShares 0–3 Month Treasury Bond ETF",
            10,
            "Cash equivalents",
          ),
        ],
      },
      {
        id: "portfolio-2",
        revision: 1,
        name: "Chen • Long-term Growth",
        kind: "client",
        clientId: "client-2",
        mode: "weights",
        lastOpened: "2026-10-05",
        holdings: [
          holding("VTI", "Vanguard Total Stock Market ETF", 60, "US equity"),
          holding(
            "VXUS",
            "Vanguard Total International Stock ETF",
            20,
            "International equity",
          ),
          holding("BND", "Vanguard Total Bond Market ETF", 20, "Fixed income"),
        ],
      },
      {
        id: "portfolio-3",
        revision: 1,
        name: "Williams • Capital Preservation",
        kind: "client",
        clientId: "client-3",
        mode: "weights",
        lastOpened: "2026-10-03",
        holdings: [
          holding("VTI", "Vanguard Total Stock Market ETF", 20, "US equity"),
          holding(
            "VXUS",
            "Vanguard Total International Stock ETF",
            10,
            "International equity",
          ),
          holding("BND", "Vanguard Total Bond Market ETF", 60, "Fixed income"),
          holding(
            "SGOV",
            "iShares 0–3 Month Treasury Bond ETF",
            10,
            "Cash equivalents",
          ),
        ],
      },
      {
        id: "model-1",
        revision: 1,
        name: "Balanced Global",
        kind: "model",
        mode: "weights",
        lastOpened: "2026-10-04",
        holdings: [
          holding("VTI", "Vanguard Total Stock Market ETF", 40, "US equity"),
          holding(
            "VXUS",
            "Vanguard Total International Stock ETF",
            20,
            "International equity",
          ),
          holding("BND", "Vanguard Total Bond Market ETF", 40, "Fixed income"),
        ],
      },
      {
        id: "model-2",
        revision: 1,
        name: "Growth 80 / 20",
        kind: "model",
        mode: "weights",
        lastOpened: "2026-10-02",
        holdings: [
          holding("VTI", "Vanguard Total Stock Market ETF", 60, "US equity"),
          holding(
            "VXUS",
            "Vanguard Total International Stock ETF",
            20,
            "International equity",
          ),
          holding("BND", "Vanguard Total Bond Market ETF", 20, "Fixed income"),
        ],
      },
      {
        id: "model-3",
        revision: 1,
        name: "Conservative 30 / 70",
        kind: "model",
        mode: "weights",
        lastOpened: "2026-09-30",
        holdings: [
          holding("VTI", "Vanguard Total Stock Market ETF", 20, "US equity"),
          holding(
            "VXUS",
            "Vanguard Total International Stock ETF",
            10,
            "International equity",
          ),
          holding("BND", "Vanguard Total Bond Market ETF", 70, "Fixed income"),
        ],
      },
      {
        id: "model-4",
        revision: 1,
        name: "All Weather",
        kind: "model",
        mode: "weights",
        lastOpened: "2026-09-25",
        holdings: [
          holding("VTI", "Vanguard Total Stock Market ETF", 30, "US equity"),
          holding(
            "TLT",
            "iShares 20+ Year Treasury Bond ETF",
            40,
            "Fixed income",
          ),
          holding(
            "IEF",
            "iShares 7–10 Year Treasury Bond ETF",
            15,
            "Fixed income",
          ),
          holding("GLD", "SPDR Gold Shares", 7.5, "Alternatives"),
          holding(
            "DBC",
            "Invesco DB Commodity Index Tracking Fund",
            7.5,
            "Alternatives",
          ),
        ],
      },
    ],
    reports: [],
    templates: [],
  };
}

export function newId(prefix = "item") {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}

export function readWorkspace(storage) {
  const saved = storage.getItem(ADVISOR_STORAGE_KEY);
  if (!saved) return createDemoWorkspace();
  let parsed;
  try {
    parsed = JSON.parse(saved);
  } catch {
    throw new Error(
      "The saved local workspace is unreadable. Export or reset it before continuing.",
    );
  }
  if (
    parsed.version !== 1 ||
    !["clients", "portfolios", "reports", "templates"].every((key) =>
      Array.isArray(parsed[key]),
    )
  ) {
    throw new Error(
      "This browser workspace format is not supported. Your data has not been overwritten.",
    );
  }
  return parsed;
}

export function validateClient(client) {
  if (!client.name?.trim()) throw new Error("Enter a client name.");
  if (client.name.length > 120)
    throw new Error("Client names must be 120 characters or fewer.");
  if (client.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email))
    throw new Error("Enter a valid email address.");
  if (!STAGES.includes(client.stage) || !RISKS.includes(client.risk))
    throw new Error("Select a valid stage and risk profile.");
  if (client.notes?.length > 12000)
    throw new Error("Notes must be 12,000 characters or fewer.");
  return {
    ...client,
    name: client.name.trim(),
    email: client.email?.trim() ?? "",
    portfolioIds: client.portfolioIds ?? [],
  };
}

export function validateHoldings(holdings, mode = "weights") {
  if (!Array.isArray(holdings) || !holdings.length)
    throw new Error("Add at least one holding.");
  if (holdings.length > 200)
    throw new Error("A portfolio can contain up to 200 holdings.");
  const symbols = new Set();
  const result = holdings.map((item, index) => {
    const symbol = String(item.symbol ?? "")
      .trim()
      .toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9.\-^=]{0,14}$/.test(symbol))
      throw new Error(`Row ${index + 1}: enter a valid ticker symbol.`);
    if (symbols.has(symbol))
      throw new Error(
        `Duplicate ticker ${symbol}. Combine its allocation into one row.`,
      );
    symbols.add(symbol);
    const field = mode === "shares" ? "shares" : "weight";
    const value = Number(item[field]);
    if (item[field] === "" || !Number.isFinite(value) || value <= 0)
      throw new Error(
        `${symbol}: ${field} must be a finite number greater than zero.`,
      );
    if (mode === "weights" && value > 100)
      throw new Error(`${symbol}: allocation cannot exceed 100%.`);
    return {
      ...item,
      symbol,
      name: String(item.name || symbol).trim(),
      assetClass: String(item.assetClass || "Unclassified"),
      [field]: value,
    };
  });
  if (
    mode === "weights" &&
    result.reduce((sum, item) => sum + item.weight, 0) > 100 + 1e-6
  )
    throw new Error("Allocations exceed 100%. Reduce a holding before saving.");
  return result;
}

export function validatePortfolio(portfolio) {
  if (!portfolio.name?.trim()) throw new Error("Enter a portfolio name.");
  if (portfolio.name.length > 120)
    throw new Error("Portfolio names must be 120 characters or fewer.");
  if (!["weights", "shares"].includes(portfolio.mode))
    throw new Error("Choose shares or weights.");
  return {
    ...portfolio,
    name: portfolio.name.trim(),
    holdings: validateHoldings(portfolio.holdings, portfolio.mode),
  };
}

export function portfolioAllocation(portfolio, notional = DEMO_NOTIONAL) {
  if (portfolio.mode === "shares")
    return {
      rows: portfolio.holdings.map((item) => ({
        ...item,
        value: null,
        allocation: null,
      })),
      total: null,
      cashWeight: null,
      valued: false,
    };
  const rows = portfolio.holdings.map((item) => ({
    ...item,
    value: (Number(item.weight) * notional) / 100,
    allocation: Number(item.weight),
  }));
  const cashWeight = Math.max(
    0,
    100 - rows.reduce((sum, item) => sum + item.allocation, 0),
  );
  return { rows, total: notional, cashWeight, valued: true };
}

export function saveWorkspaceRecord(
  storage,
  collection,
  record,
  baseRevision,
  fallback,
) {
  if (!["clients", "portfolios", "reports", "templates"].includes(collection))
    throw new Error("Unknown workspace collection.");
  const current = storage.getItem(ADVISOR_STORAGE_KEY)
    ? readWorkspace(storage)
    : structuredClone(fallback ?? createDemoWorkspace());
  const existing = current[collection].find((item) => item.id === record.id);
  if (existing && existing.revision !== baseRevision)
    throw new Error(
      "This record changed in another tab. Close the editor and reopen it to review the latest version.",
    );
  if (!existing && baseRevision != null && baseRevision !== 0)
    throw new Error(
      "This record no longer exists. Close the editor and refresh the workspace.",
    );
  const validated =
    collection === "clients"
      ? validateClient(record)
      : collection === "portfolios"
        ? validatePortfolio(record)
        : collection === "reports"
          ? validateReport(record)
          : record;
  if (
    collection === "templates" &&
    (!record.name?.trim() ||
      !REPORT_TYPES.includes(record.type) ||
      !Array.isArray(record.pages))
  )
    throw new Error("Enter a template name and a valid report type.");
  if (
    collection === "portfolios" &&
    validated.kind === "client" &&
    validated.clientId &&
    !current.clients.some((item) => item.id === validated.clientId)
  )
    throw new Error(
      "The associated client is unavailable. Choose a current client.",
    );
  if (
    collection === "clients" &&
    validated.portfolioIds.some(
      (id) =>
        !current.portfolios.some(
          (item) => item.id === id && item.kind === "client",
        ),
    )
  )
    throw new Error(
      "A linked portfolio is unavailable. Reopen the client and choose a current portfolio.",
    );
  const saved = { ...validated, revision: (existing?.revision ?? 0) + 1 };
  current[collection] = existing
    ? current[collection].map((item) => (item.id === record.id ? saved : item))
    : [...current[collection], saved];
  // Both sides of a local relationship are written together, or not at all.
  if (collection === "portfolios" && saved.kind === "client") {
    current.clients = current.clients.map((client) => {
      const previousIds = client.portfolioIds ?? [];
      const linkedIds = previousIds.filter((id) => id !== saved.id);
      if (client.id === saved.clientId) linkedIds.push(saved.id);
      if (
        previousIds.length === linkedIds.length &&
        previousIds.every((id) => linkedIds.includes(id))
      )
        return client;
      return {
        ...client,
        portfolioIds: linkedIds,
        revision: client.revision + 1,
      };
    });
  } else if (collection === "clients") {
    current.portfolios = current.portfolios.map((portfolio) => {
      if (portfolio.kind !== "client") return portfolio;
      const assigned = saved.portfolioIds.includes(portfolio.id);
      if (assigned && portfolio.clientId !== saved.id)
        return {
          ...portfolio,
          clientId: saved.id,
          revision: portfolio.revision + 1,
        };
      if (!assigned && portfolio.clientId === saved.id)
        return { ...portfolio, clientId: "", revision: portfolio.revision + 1 };
      return portfolio;
    });
    current.clients = current.clients.map((client) => {
      if (client.id === saved.id) return client;
      const linkedIds = client.portfolioIds.filter(
        (id) => !saved.portfolioIds.includes(id),
      );
      return linkedIds.length === client.portfolioIds.length
        ? client
        : { ...client, portfolioIds: linkedIds, revision: client.revision + 1 };
    });
  }
  storage.setItem(ADVISOR_STORAGE_KEY, JSON.stringify(current));
  return { workspace: current, record: saved };
}

export function csvCell(value) {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text) && typeof value !== "number") text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function toCsv(headers, rows) {
  return [headers, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
}
export function clientsCsv(clients) {
  return toCsv(
    [
      "Name",
      "Email",
      "Phone",
      "Advisor",
      "Stage",
      "Risk",
      "Next review",
      "Last contact",
      "Notes",
    ],
    clients.map((item) => [
      item.name,
      item.email,
      item.phone,
      item.advisor,
      item.stage,
      item.risk,
      item.nextReview,
      item.lastContact,
      item.notes,
    ]),
  );
}
export function portfolioCsv(portfolio) {
  const field = portfolio.mode === "shares" ? "shares" : "weight";
  return toCsv(
    [
      "Symbol",
      "Name",
      field === "weight" ? "Weight (%)" : "Shares",
      "Asset class",
    ],
    portfolio.holdings.map((item) => [
      item.symbol,
      item.name,
      item[field],
      item.assetClass,
    ]),
  );
}

export function parseCsv(text) {
  if (typeof text !== "string" || text.length > 1000000)
    throw new Error("Import a text file smaller than 1 MB.");
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (!quoted && cell.trim() === "") quoted = true;
      else if (quoted) quoted = false;
      else cell += char;
    } else if (!quoted && (char === "," || char === "\t")) {
      row.push(cell.trim());
      cell = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell.trim());
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (quoted) throw new Error("The CSV contains an unclosed quoted field.");
  row.push(cell.trim());
  if (row.some((value) => value !== "")) rows.push(row);
  return rows;
}

export function parseHoldings(text, mode = "weights") {
  const rows = parseCsv(text);
  if (!rows.length)
    throw new Error("No holdings found. Use Symbol, Weight (%) rows.");
  const hasHeader = /symbol|ticker/i.test(rows[0][0]);
  const headers = hasHeader
    ? rows.shift().map((value) => value.toLowerCase())
    : [];
  const symbolIndex = Math.max(
    0,
    headers.findIndex((value) => /symbol|ticker/.test(value)),
  );
  const valueIndex = hasHeader
    ? headers.findIndex((value) =>
        mode === "shares"
          ? /shares|quantity/.test(value)
          : /weight|allocation/.test(value),
      )
    : 1;
  if (valueIndex < 0)
    throw new Error(
      `The CSV must contain a ${mode === "shares" ? "Shares" : "Weight (%)"} column.`,
    );
  const nameIndex = headers.findIndex((value) => value === "name");
  const assetIndex = headers.findIndex((value) => /asset/.test(value));
  return validateHoldings(
    rows.map((row) => ({
      symbol: row[symbolIndex],
      name: nameIndex >= 0 ? row[nameIndex] : row[symbolIndex],
      [mode === "shares" ? "shares" : "weight"]: row[valueIndex]?.replace(
        "%",
        "",
      ),
      assetClass: assetIndex >= 0 ? row[assetIndex] : "Unclassified",
    })),
    mode,
  );
}

export function createReport({
  type = "Standard",
  template = "Overview Summary Report",
  portfolioIds = [],
  title = "Portfolio Overview",
  client = "",
  preparedBy = "Luna Terminal",
  dateRange = "Current allocation",
}) {
  if (!REPORT_TYPES.includes(type)) throw new Error("Select a report type.");
  if (!title.trim()) throw new Error("Enter a report title.");
  const limit = type === "Comparison" ? 5 : 2;
  if (!portfolioIds.length || portfolioIds.length > limit)
    throw new Error(`Select between 1 and ${limit} portfolios.`);
  const pages =
    template === "Blank"
      ? [
          {
            id: newId("page"),
            kind: "notes",
            title: "Your research",
            text: "Add your research notes and conclusions here.",
            visible: true,
          },
        ]
      : type === "One Pager"
        ? [
            {
              id: newId("page"),
              kind: "summary",
              title: "Portfolio at a glance",
              text: "A concise view of the selected allocation and holdings.",
              visible: true,
            },
          ]
        : [
            {
              id: newId("page"),
              kind: "overview",
              title:
                template === "Client Proposal"
                  ? "Your investment proposal"
                  : "Portfolio overview",
              text: "An illustrative allocation review prepared for discussion. Review your objectives, investment horizon, and liquidity requirements with a qualified advisor.",
              visible: true,
            },
            {
              id: newId("page"),
              kind: "allocation",
              title: "Asset allocation",
              text: "Allocation is based on the entered holdings. Any unallocated weight is shown as cash.",
              visible: true,
            },
            {
              id: newId("page"),
              kind: "holdings",
              title: "Portfolio holdings",
              text: "Illustrative holdings and allocations. Market performance is unavailable without compatible historical prices.",
              visible: true,
            },
            {
              id: newId("page"),
              kind: "notes",
              title: "Research & next steps",
              text: "Document objectives, key observations, and topics for your next review.",
              visible: true,
            },
          ];
  return {
    id: newId("report"),
    revision: 0,
    type,
    template,
    portfolioIds,
    title: title.trim(),
    client,
    preparedBy,
    dateRange,
    createdAt: new Date().toISOString(),
    accent: "#1b5faa",
    topHoldings: 20,
    pages,
  };
}

export const REPORT_DISCLOSURE =
  "Local demonstration report. Client records and allocations are fictional or entered by the user. Weight-based values use a $100,000 illustrative notional per portfolio and are not account assets. Quotes, historical returns, fees, taxes, cash flows, and suitability analysis are not included. This document is not investment advice.";

export function validateReport(report) {
  if (!report.title?.trim() || report.title.length > 120)
    throw new Error("Enter a report title of 120 characters or fewer.");
  if (!REPORT_TYPES.includes(report.type))
    throw new Error("Choose a valid report type.");
  const maximum = report.type === "Comparison" ? 5 : 2;
  if (
    !Array.isArray(report.portfolioIds) ||
    !report.portfolioIds.length ||
    report.portfolioIds.length > maximum ||
    new Set(report.portfolioIds).size !== report.portfolioIds.length
  )
    throw new Error(`Choose between 1 and ${maximum} different portfolios.`);
  if (
    !Array.isArray(report.pages) ||
    !report.pages.length ||
    report.pages.length > 50
  )
    throw new Error("A report must have between 1 and 50 pages.");
  if (
    report.pages.some(
      (page) =>
        !page.title?.trim() ||
        page.title.length > 120 ||
        String(page.text ?? "").length > 16000,
    )
  )
    throw new Error(
      "Every page needs a heading. Page text must be 16,000 characters or fewer.",
    );
  return { ...report, title: report.title.trim() };
}

export function reportRows(report, portfolios) {
  return report.portfolioIds.flatMap((id) => {
    const portfolio = portfolios.find((item) => item.id === id);
    if (!portfolio)
      return [
        {
          portfolio: "Unavailable portfolio",
          symbol: "—",
          name: "Portfolio removed from the local workspace",
          allocation: null,
          value: null,
        },
      ];
    const allocation = portfolioAllocation(portfolio);
    const rows = allocation.rows.map((item) => ({
      ...item,
      portfolio: portfolio.name,
    }));
    if (allocation.cashWeight > 0.000001)
      rows.push({
        portfolio: portfolio.name,
        symbol: "CASH",
        name: "Unallocated cash",
        assetClass: "Cash equivalents",
        allocation: allocation.cashWeight,
        value: (allocation.cashWeight * DEMO_NOTIONAL) / 100,
      });
    return rows;
  });
}
export function reportCsv(report, portfolios) {
  return toCsv(
    [
      "Report",
      "Portfolio",
      "Symbol",
      "Name",
      "Allocation (%)",
      "Shares",
      "Illustrative value (USD)",
      "Asset class",
    ],
    reportRows(report, portfolios).map((row) => [
      report.title,
      row.portfolio,
      row.symbol,
      row.name,
      row.allocation ?? "Unavailable",
      row.shares ?? "",
      row.value ?? "Unavailable",
      row.assetClass ?? "Unavailable",
    ]),
  );
}

function wrapText(text, maxChars = 88) {
  const words = String(text ?? "")
    .replace(/[^\x20-\x7E\n]/g, " ")
    .split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    if (!word) continue;
    if (line && line.length + word.length + 1 > maxChars) {
      lines.push(line);
      line = "";
    }
    if (word.length > maxChars) {
      if (line) {
        lines.push(line);
        line = "";
      }
      for (let i = 0; i < word.length; i += maxChars)
        lines.push(word.slice(i, i + maxChars));
    } else line += `${line ? " " : ""}${word}`;
  }
  if (line) lines.push(line);
  return lines;
}

export function layoutReport(report, portfolios) {
  const allRows = reportRows(report, portfolios);
  const sections = [];
  for (const page of report.pages.filter((item) => item.visible)) {
    const lines = wrapText(page.text);
    const tables = ["holdings", "summary"].includes(page.kind)
      ? allRows.slice(0, Math.max(1, Number(report.topHoldings) || 20))
      : [];
    const lineLimit = tables.length ? 3 : 13;
    const rowLimit = 8;
    const chunks = Math.max(
      1,
      Math.ceil(lines.length / lineLimit),
      Math.ceil(tables.length / rowLimit),
    );
    for (let i = 0; i < chunks; i++)
      sections.push({
        sourceId: page.id,
        kind: page.kind,
        title: `${page.title}${i ? " (continued)" : ""}`,
        textLines: lines.slice(i * lineLimit, (i + 1) * lineLimit),
        rows: tables.slice(i * rowLimit, (i + 1) * rowLimit),
        allRows,
        continuation: i,
      });
  }
  if (!sections.length)
    throw new Error("Show at least one report page before exporting.");
  return sections;
}

export async function buildReportPdf(report, portfolios) {
  validateReport(report);
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  pdf.setTitle(report.title);
  pdf.setAuthor(report.preparedBy);
  pdf.setSubject("Local demo portfolio report");
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const clean = (value) => String(value ?? "").replace(/[^\x20-\x7E]/g, " ");
  const color = rgb(0.03, 0.11, 0.3);
  const muted = rgb(0.36, 0.42, 0.53);
  const hex = /^#[0-9a-f]{6}$/i.test(report.accent) ? report.accent : "#1b5faa";
  const accent = rgb(
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  );
  const sections = layoutReport(report, portfolios);
  sections.forEach((section, pageIndex) => {
    const page = pdf.addPage([842, 595]);
    const draw = (text, x, y, size = 10, strong = false, fill = color) =>
      page.drawText(clean(text), {
        x,
        y,
        size,
        font: strong ? bold : regular,
        color: fill,
      });
    const fitted = (text, x, y, size, width, strong = false, fill = color) => {
      const font = strong ? bold : regular;
      let fittedSize = size;
      while (
        font.widthOfTextAtSize(clean(text), fittedSize) > width &&
        fittedSize > 5
      )
        fittedSize -= 0.2;
      draw(text, x, y, fittedSize, strong, fill);
    };
    page.drawRectangle({ x: 0, y: 589, width: 842, height: 6, color: accent });
    draw("LUNA TERMINAL", 42, 552, 11, true, accent);
    draw("LOCAL DEMO", 724, 552, 8, true, muted);
    fitted(report.title, 42, 517, 22, 758, true);
    fitted(
      `${report.client || "Portfolio research"}  |  Prepared by ${report.preparedBy}  |  ${report.dateRange}`,
      42,
      493,
      10,
      758,
      false,
      muted,
    );
    page.drawLine({
      start: { x: 42, y: 479 },
      end: { x: 800, y: 479 },
      thickness: 0.6,
      color: rgb(0.86, 0.88, 0.91),
    });
    fitted(section.title, 42, 454, 16, 758, true);
    let y = 429;
    section.textLines.forEach((line) => {
      draw(line, 42, y, 10);
      y -= 15;
    });
    if (section.rows.length) {
      y -= 12;
      page.drawRectangle({
        x: 42,
        y: y - 6,
        width: 758,
        height: 24,
        color: rgb(0.94, 0.96, 0.98),
      });
      draw("Holding / portfolio", 50, y + 2, 9, true);
      draw("Allocation", 582, y + 2, 9, true);
      draw("Illustrative value", 681, y + 2, 9, true);
      y -= 25;
      section.rows.forEach((row) => {
        fitted(`${row.symbol}  ${row.name}`, 50, y, 9, 515, true);
        fitted(row.portfolio, 50, y - 12, 8, 515, false, muted);
        draw(
          row.allocation == null
            ? "Unavailable"
            : `${row.allocation.toFixed(2)}%`,
          584,
          y,
          9,
        );
        draw(
          row.value == null
            ? "Unavailable"
            : `$${Math.round(row.value).toLocaleString("en-US")}`,
          686,
          y,
          9,
        );
        page.drawLine({
          start: { x: 42, y: y - 18 },
          end: { x: 800, y: y - 18 },
          thickness: 0.3,
          color: rgb(0.9, 0.91, 0.94),
        });
        y -= 32;
      });
    } else if (section.kind === "allocation" || section.kind === "overview") {
      const groups = new Map();
      section.allRows.forEach((row) => {
        if (row.allocation != null)
          groups.set(
            row.assetClass,
            (groups.get(row.assetClass) ?? 0) +
              row.allocation / report.portfolioIds.length,
          );
      });
      y -= 14;
      Array.from(groups)
        .slice(0, 7)
        .forEach(([label, weight]) => {
          draw(label, 42, y, 10);
          page.drawRectangle({
            x: 215,
            y: y - 3,
            width: (420 * weight) / 100,
            height: 13,
            color: accent,
          });
          draw(`${weight.toFixed(1)}%`, 680, y, 10);
          y -= 29;
        });
      if (!groups.size)
        draw(
          "Allocation unavailable for share-based holdings without market prices.",
          42,
          y,
          10,
          false,
          muted,
        );
    }
    const disclosureLines = wrapText(REPORT_DISCLOSURE, 148);
    disclosureLines.forEach((line, i) =>
      draw(line, 42, 56 - i * 10, 7, false, muted),
    );
    draw(`${pageIndex + 1} / ${sections.length}`, 760, 20, 8, false, muted);
  });
  return pdf.save();
}

export const DEMO_MANAGERS = [
  {
    cik: "0001067983",
    name: "Berkshire Hathaway",
    initials: "BH",
    manager: "Warren Buffett",
    color: "#184b80",
    holdings: 41,
    value: 240.2,
    largest: "AAPL",
    change: -2.8,
  },
  {
    cik: "0001336528",
    name: "Pershing Square",
    initials: "PS",
    manager: "Bill Ackman",
    color: "#617653",
    holdings: 11,
    value: 14.1,
    largest: "BN",
    change: 3.2,
  },
  {
    cik: "0001350694",
    name: "Bridgewater Associates",
    initials: "BW",
    manager: "Institutional manager",
    color: "#726188",
    holdings: 645,
    value: 21.5,
    largest: "SPY",
    change: 1.4,
  },
  {
    cik: "0001649339",
    name: "Scion Asset Management",
    initials: "SA",
    manager: "Michael Burry",
    color: "#977042",
    holdings: 14,
    value: 1.4,
    largest: "BABA",
    change: -1.6,
  },
];
export const DEMO_FILING_HOLDINGS = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    weight: 24.8,
    value: 59.57,
    action: "Reduced",
  },
  {
    symbol: "AXP",
    name: "American Express Company",
    sector: "Financials",
    weight: 18.3,
    value: 43.95,
    action: "Unchanged",
  },
  {
    symbol: "BAC",
    name: "Bank of America Corporation",
    sector: "Financials",
    weight: 11.1,
    value: 26.66,
    action: "Reduced",
  },
  {
    symbol: "KO",
    name: "The Coca-Cola Company",
    sector: "Consumer staples",
    weight: 10.4,
    value: 24.98,
    action: "Unchanged",
  },
  {
    symbol: "CVX",
    name: "Chevron Corporation",
    sector: "Energy",
    weight: 7.2,
    value: 17.29,
    action: "Added",
  },
  {
    symbol: "OXY",
    name: "Occidental Petroleum",
    sector: "Energy",
    weight: 5.4,
    value: 12.97,
    action: "Added",
  },
];
