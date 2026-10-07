"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
  Plus,
  X,
  MagnifyingGlass,
  FunnelSimple,
  DownloadSimple,
  Bell,
  Star,
  Check,
  MapTrifold,
  ChartLine,
} from "@phosphor-icons/react";
import {
  STOCKS,
  RANGES,
  findStock,
  currency,
  compact,
  percent,
  getDemoHistory,
  screenStocks,
  normalizeWatchlist,
  evaluateCrossing,
  treemap,
  regression,
  calculateRSI,
  OBSERVED_AT,
  DEFAULT_WATCHLIST,
  WATCHLIST_KEY,
} from "../../lib/market.mjs";
import {
  Change,
  CompanyMark,
  DemoNote,
  PriceChart,
  Sparkline,
  useSaved,
} from "./shared";
import { EVENTS, SentimentPanel, MiniEvents } from "./Dashboard";
import "./market.css";

const TITLES = {
  screener: ["Stock screener", "Find the companies that fit your research."],
  "market-movers": [
    "Market movers",
    "A clear view of the strongest moves in the sample market.",
  ],
  "market-cap": [
    "Companies by market cap",
    "The research universe, ranked by market capitalization.",
  ],
  maps: ["Stock map", "See the market from a different perspective."],
  "company-world-map": [
    "Company world map",
    "Explore curated headquarters context.",
  ],
  "supply-chain": [
    "Supply chain",
    "Explore an illustrative network of company relationships.",
  ],
  "earnings-calendar": [
    "Earnings calendar",
    "Keep the next reporting cycle in view.",
  ],
  "upcoming-events": [
    "Upcoming events",
    "A calendar for your market research.",
  ],
  "most-popular": [
    "Popular stocks",
    "Explore the companies in this sample research universe.",
  ],
  "most-popular-stocks": [
    "Popular stocks",
    "Explore the companies in this sample research universe.",
  ],
  "market-sentiment": [
    "Market sentiment",
    "Seven indicators. One view of risk appetite.",
  ],
  "global-markets": [
    "Global markets",
    "Broad-market ETF proxies in the sample universe.",
  ],
  "country-etfs": ["Country ETFs", "Compare illustrative country exposure."],
  "us-sectors": [
    "US sectors",
    "Explore performance across the sample equity universe.",
  ],
  currencies: ["Major currencies", "A currency reference workspace."],
  "global-yields": ["Global yields", "Keep rates and units in context."],
  "lots-of-charts": [
    "Lots of Charts",
    "Multiple perspectives, in one workspace.",
  ],
  "chart-metrics": [
    "Charted metrics",
    "Explore price, returns, volume and technical context.",
  ],
  "graphs/historical": [
    "Historical metrics",
    "A longer view of the sample price history.",
  ],
  "graphs/comparison": [
    "Company comparison",
    "Compare aligned price returns with a shared benchmark.",
  ],
  "portfolio-comparison": [
    "Portfolio comparison",
    "Explore a hypothetical single-security allocation.",
  ],
  "regression-analysis": [
    "Regression analysis",
    "Compare observed returns against SPY.",
  ],
  "rsi-le": [
    "RSI strategy lab",
    "Explore real RSI calculations on illustrative observations.",
  ],
  "what-if": [
    "What-if analysis",
    "Explore a hypothetical price-return scenario.",
  ],
};
function Heading({ title, description, children }) {
  return (
    <div className="market-page-heading">
      <div>
        <span className="page-eyebrow">LUNA RESEARCH</span>
        <h1>
          {title}
          <span className="heading-dot">.</span>
        </h1>
        <p>{description}</p>
      </div>
      <div className="heading-actions">
        <DemoNote />
        {children}
      </div>
    </div>
  );
}
function Search({ value, onChange, placeholder = "Search company or ticker" }) {
  return (
    <label className="market-search">
      <MagnifyingGlass size={15} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button aria-label="Clear search" onClick={() => onChange("")}>
          <X size={13} />
        </button>
      )}
    </label>
  );
}
function SymbolSelect({ value, onChange, label = "Security" }) {
  return (
    <label className="market-field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {STOCKS.map((s) => (
          <option key={s.symbol} value={s.symbol}>
            {s.symbol} · {s.name}
          </option>
        ))}
      </select>
    </label>
  );
}
function downloadCSV(filename, rows) {
  const blob = new Blob(
    [
      rows
        .map((row) =>
          row
            .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
            .join(","),
        )
        .join("\n"),
    ],
    { type: "text/csv;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function StockTable({ rows, sort, onSort }) {
  const headings = [
    ["symbol", "Company"],
    ["price", "Price"],
    ["change", "Change"],
    ["marketCap", "Market cap"],
    ["pe", "P/E"],
    ["volume", "Volume"],
  ];
  return (
    <div className="market-table-wrap">
      <table className="market-table">
        <thead>
          <tr>
            {headings.map(([key, label]) => (
              <th
                key={key}
                aria-sort={
                  sort?.key === key
                    ? sort.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                {onSort ? (
                  <button onClick={() => onSort(key)}>
                    {label}
                    {sort?.key === key ? (
                      sort.direction === "asc" ? (
                        <ArrowUp size={10} />
                      ) : (
                        <ArrowDown size={10} />
                      )
                    ) : (
                      <span className="sort-faint">↕</span>
                    )}
                  </button>
                ) : (
                  label
                )}
              </th>
            ))}
            <th>1M trend</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.symbol}>
              <td>
                <Link href={`/stock/${s.symbol}`} className="company-cell">
                  <CompanyMark stock={s} />
                  <div>
                    <strong>{s.symbol}</strong>
                    <span>{s.name}</span>
                  </div>
                </Link>
              </td>
              <td>{currency(s.price)}</td>
              <td>
                <Change value={s.change} />
              </td>
              <td>${compact(s.marketCap)}</td>
              <td>{s.pe ? `${s.pe.toFixed(1)}×` : "—"}</td>
              <td>{compact(s.volume)}</td>
              <td>
                <Sparkline
                  symbol={s.symbol}
                  color={s.change >= 0 ? "var(--positive)" : "var(--negative)"}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <div className="market-empty">
          <h3>No companies match these filters.</h3>
          <p>Try a different symbol, sector or numeric limit.</p>
        </div>
      )}
    </div>
  );
}
function Screener({ slug }) {
  const [query, setQuery] = useState(""),
    [sector, setSector] = useState(""),
    [minCap, setMinCap] = useState(""),
    [maxPE, setMaxPE] = useState(""),
    [minChange, setMinChange] = useState(""),
    [sort, setSort] = useState({
      key: slug === "market-movers" ? "change" : "marketCap",
      direction: "desc",
    }),
    [side, setSide] = useState("gainers");
  const rows = screenStocks({
    query,
    sector,
    minCap: minCap ? Number(minCap) * 1e9 : 0,
    maxPE: maxPE ? Number(maxPE) : Infinity,
    minChange: minChange ? Number(minChange) : -Infinity,
    ...sort,
  }).filter(
    (s) =>
      slug !== "market-movers" ||
      (side === "gainers" ? s.change >= 0 : s.change < 0),
  );
  const onSort = (key) =>
    setSort({
      key,
      direction: sort.key === key && sort.direction === "desc" ? "asc" : "desc",
    });
  return (
    <>
      <div className="research-summary-strip">
        <div>
          <span>Research universe</span>
          <strong>
            {STOCKS.length} <small>securities</small>
          </strong>
        </div>
        <div>
          <span>Advancing</span>
          <strong className="is-positive">
            {STOCKS.filter((s) => s.change >= 0).length}
          </strong>
        </div>
        <div>
          <span>Declining</span>
          <strong className="is-negative">
            {STOCKS.filter((s) => s.change < 0).length}
          </strong>
        </div>
        <div>
          <span>Snapshot</span>
          <strong>
            Oct 06 <small>2026</small>
          </strong>
        </div>
      </div>
      <section className="market-panel">
        <div className="research-toolbar">
          <Search value={query} onChange={setQuery} />
          <select
            aria-label="Filter by sector"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
          >
            <option value="">All sectors</option>
            {[...new Set(STOCKS.map((s) => s.sector))].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          {slug === "market-movers" && (
            <div className="range-tabs">
              {["gainers", "losers"].map((s) => (
                <button
                  key={s}
                  className={side === s ? "active" : ""}
                  onClick={() => {
                    setSide(s);
                    setSort({
                      key: "change",
                      direction: s === "gainers" ? "desc" : "asc",
                    });
                  }}
                >
                  {s === "gainers" ? "Gainers" : "Losers"}
                </button>
              ))}
            </div>
          )}
          <button
            className="market-button"
            onClick={() =>
              downloadCSV("luna-screener-illustrative.csv", [
                [
                  "Symbol",
                  "Company",
                  "Price USD",
                  "Change %",
                  "Market cap USD",
                  "P/E",
                  "Observed at",
                  "Data status",
                ],
                ...rows.map((s) => [
                  s.symbol,
                  s.name,
                  s.price,
                  s.change,
                  s.marketCap,
                  s.pe,
                  OBSERVED_AT,
                  "Illustrative",
                ]),
              ])
            }
          >
            <DownloadSimple size={14} /> Export
          </button>
        </div>
        {slug === "screener" && (
          <div className="screener-filters">
            <FunnelSimple size={14} />
            <label>
              Min. market cap{" "}
              <div>
                <input
                  type="number"
                  min="0"
                  value={minCap}
                  onChange={(e) => setMinCap(e.target.value)}
                  placeholder="Any"
                />
                <span>$B</span>
              </div>
            </label>
            <label>
              Max. P/E{" "}
              <div>
                <input
                  type="number"
                  min="0"
                  value={maxPE}
                  onChange={(e) => setMaxPE(e.target.value)}
                  placeholder="Any"
                />
                <span>×</span>
              </div>
            </label>
            <label>
              Min. daily change{" "}
              <div>
                <input
                  type="number"
                  step=".1"
                  value={minChange}
                  onChange={(e) => setMinChange(e.target.value)}
                  placeholder="Any"
                />
                <span>%</span>
              </div>
            </label>
            <button
              className="text-button"
              onClick={() => {
                setQuery("");
                setSector("");
                setMinCap("");
                setMaxPE("");
                setMinChange("");
              }}
            >
              Reset filters
            </button>
          </div>
        )}
        <StockTable rows={rows} sort={sort} onSort={onSort} />
        <div className="table-footer">
          <span>
            {rows.length} of {STOCKS.length} securities
          </span>
          <span>Illustrative snapshot · All prices in USD</span>
        </div>
      </section>
      {["most-popular", "most-popular-stocks"].includes(slug) && (
        <p className="market-notice">
          Popularity rankings are unavailable without usage data. This list is
          sorted by illustrative market cap.
        </p>
      )}
    </>
  );
}
function StockMap({ world = false }) {
  const [sector, setSector] = useState(""),
    [metric, setMetric] = useState("change"),
    [view, setView] = useState("treemap");
  const rows = STOCKS.filter(
    (s) => s.sector !== "Index ETF" && (!sector || s.sector === sector),
  );
  const blocks = treemap(rows),
    caps = rows.reduce((sum, s) => sum + s.marketCap, 0);
  return (
    <section className="market-panel">
      <div className="research-toolbar">
        <select
          aria-label="Universe"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
        >
          <option value="">All sample equities</option>
          {[
            ...new Set(
              STOCKS.filter((s) => s.sector !== "Index ETF").map(
                (s) => s.sector,
              ),
            ),
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          aria-label="Color metric"
        >
          <option value="change">Color: daily change</option>
          <option value="marketCap">Color: market cap</option>
        </select>
        {!world && (
          <div className="range-tabs">
            <button
              className={view === "treemap" ? "active" : ""}
              onClick={() => setView("treemap")}
            >
              Treemap
            </button>
            <button
              className={view === "cluster" ? "active" : ""}
              onClick={() => setView("cluster")}
            >
              Sector clusters
            </button>
          </div>
        )}
        <span className="toolbar-caption">
          {rows.length} companies · Area = market cap
        </span>
      </div>
      {world ? (
        <>
          <div className="location-map">
            <div className="map-grid-text">
              UNITED STATES · CURATED HEADQUARTERS
            </div>
            <svg
              viewBox="0 0 1000 480"
              role="img"
              aria-label="Illustrative US headquarters positions"
            >
              <path
                d="M110 100 L260 85 380 120 540 115 650 145 840 120 900 170 850 205 830 290 770 325 705 375 630 325 570 350 495 330 420 365 390 310 305 295 280 250 200 245 180 200 145 170Z"
                className="map-land"
              />
              {rows.map((s, i) => {
                const west =
                    !s.city.includes("NY") &&
                    !s.city.includes("TX") &&
                    !s.city.includes("IN"),
                  x = west
                    ? 220 + (i % 3) * 28
                    : s.city.includes("NY")
                      ? 810
                      : s.city.includes("TX")
                        ? 490
                        : 655,
                  y = west
                    ? 130 + (i % 5) * 35
                    : s.city.includes("TX")
                      ? 305
                      : 180;
                return (
                  <g key={s.symbol}>
                    <circle
                      cx={x}
                      cy={y}
                      r="7"
                      fill="var(--accent)"
                      opacity=".8"
                    />
                    <text x={x + 12} y={y + 4} className="map-label">
                      {s.symbol}
                    </text>
                  </g>
                );
              })}
            </svg>
            <p>
              Schematic location grouping. Positions are approximate; city names
              below are the curated context.
            </p>
          </div>
          <div className="headquarters-list">
            {rows.map((s) => (
              <Link key={s.symbol} href={`/stock/${s.symbol}`}>
                <CompanyMark stock={s} />
                <strong>{s.symbol}</strong>
                <span>{s.city}</span>
                <ArrowUpRight size={13} />
              </Link>
            ))}
          </div>
        </>
      ) : view === "treemap" ? (
        <svg
          className="stock-treemap"
          viewBox="0 0 1000 450"
          role="img"
          aria-label="Market capitalization treemap with navigable companies"
        >
          {blocks.map((s) => (
            <a href={`/stock/${s.symbol}`} key={s.symbol}>
              <rect
                x={s.x + 2}
                y={s.y + 2}
                width={Math.max(0, s.width - 4)}
                height={Math.max(0, s.height - 4)}
                rx="3"
                fill={
                  metric === "change"
                    ? s.change >= 0
                      ? "#1c776b"
                      : "#b65560"
                    : `hsl(217 42% ${30 + (s.marketCap / caps) * 90}%)`
                }
                opacity={
                  metric === "change"
                    ? Math.min(1, 0.55 + Math.abs(s.change) * 0.14)
                    : 1
                }
              />
              <text
                x={s.x + s.width / 2}
                y={s.y + s.height / 2 - 3}
                textAnchor="middle"
                className="treemap-symbol"
                style={{
                  fontSize: Math.max(
                    12,
                    Math.min(30, s.width / 7, s.height / 3),
                  ),
                }}
              >
                {s.symbol}
              </text>
              <text
                x={s.x + s.width / 2}
                y={s.y + s.height / 2 + 18}
                textAnchor="middle"
                className="treemap-value"
              >
                {metric === "change"
                  ? percent(s.change)
                  : `$${compact(s.marketCap)}`}
              </text>
              <title>{`${s.name} · $${compact(s.marketCap)} · ${percent(s.change)}`}</title>
            </a>
          ))}
        </svg>
      ) : (
        <div className="sector-clusters">
          {[...new Set(rows.map((s) => s.sector))].map((sector) => (
            <div key={sector}>
              <h3>{sector}</h3>
              <div>
                {rows
                  .filter((s) => s.sector === sector)
                  .map((s) => (
                    <Link
                      key={s.symbol}
                      href={`/stock/${s.symbol}`}
                      style={{
                        width: Math.max(65, Math.sqrt(s.marketCap / 1e9) * 3),
                        height: Math.max(65, Math.sqrt(s.marketCap / 1e9) * 3),
                      }}
                    >
                      <strong>{s.symbol}</strong>
                      <Change value={s.change} />
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="table-footer">
        <span>
          {world
            ? "Curated city context; illustrative layout."
            : "Stable geometry from illustrative market-cap inputs."}
        </span>
        <span>{!world && "Click a company to open its research."}</span>
      </div>
    </section>
  );
}
function EventCalendar({ earnings = false }) {
  const [query, setQuery] = useState(""),
    [after, setAfter] = useState("2026-10-07");
  const earningsRows = [
    { ...EVENTS[2], symbol: "JPM" },
    {
      day: "22",
      month: "OCT",
      time: "After market",
      title: "Tesla earnings",
      subtitle: "Q3 2026 · illustrative date",
      date: "2026-10-22",
      symbol: "TSLA",
      tag: "Earnings",
    },
    {
      day: "28",
      month: "OCT",
      time: "After market",
      title: "Microsoft earnings",
      subtitle: "Q1 FY27 · illustrative date",
      date: "2026-10-28",
      symbol: "MSFT",
      tag: "Earnings",
    },
    {
      day: "29",
      month: "OCT",
      time: "After market",
      title: "Apple earnings",
      subtitle: "Q4 FY26 · illustrative date",
      date: "2026-10-29",
      symbol: "AAPL",
      tag: "Earnings",
    },
  ];
  const rows = (earnings ? earningsRows : EVENTS).filter(
    (e) =>
      `${e.title} ${e.symbol || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()) && e.date >= after,
  );
  return (
    <section className="market-panel">
      <div className="research-toolbar">
        <Search
          value={query}
          onChange={setQuery}
          placeholder="Search companies or events"
        />
        <label className="inline-date-label">
          From{" "}
          <input
            type="date"
            value={after}
            onChange={(e) => setAfter(e.target.value)}
          />
        </label>
        <span className="toolbar-caption">
          {rows.length} upcoming sample events
        </span>
      </div>
      <div className="full-calendar">
        {rows.map((e) => (
          <div className="calendar-row" key={e.title}>
            <div className="event-date">
              <strong>{e.day}</strong>
              <span>{e.month}</span>
            </div>
            <div>
              <strong>{e.title}</strong>
              <span>{e.subtitle}</span>
            </div>
            <span>{e.time}</span>
            {earnings ? (
              <div className="calendar-estimates">
                <span>
                  EPS estimate <strong>Unavailable</strong>
                </span>
                <span>
                  Options-implied move <strong>Unavailable</strong>
                </span>
              </div>
            ) : (
              <span className="market-chip">{e.tag}</span>
            )}
            {e.symbol && (
              <Link className="text-button" href={`/stock/${e.symbol}`}>
                Research <ArrowUpRight size={14} />
              </Link>
            )}
          </div>
        ))}
        {!rows.length && (
          <div className="market-empty">
            No events match your search and date.
          </div>
        )}
      </div>
      <div className="table-footer">
        Illustrative dates, not a verified release schedule. Connect a provider
        for confirmed dates and estimates.
      </div>
    </section>
  );
}
function SectorView() {
  const sectors = [
    ...new Set(
      STOCKS.filter((s) => s.sector !== "Index ETF").map((s) => s.sector),
    ),
  ]
    .map((name) => {
      const stocks = STOCKS.filter((s) => s.sector === name),
        cap = stocks.reduce((sum, s) => sum + s.marketCap, 0);
      return {
        name,
        stocks,
        cap,
        change:
          stocks.reduce((sum, s) => sum + s.change * s.marketCap, 0) / cap,
      };
    })
    .sort((a, b) => b.change - a.change);
  return (
    <section className="market-panel">
      <div className="widget-heading">
        <h2>Market-cap weighted daily change</h2>
        <span className="market-chip">Sample universe</span>
      </div>
      <div className="sector-performance">
        {sectors.map((s) => (
          <div key={s.name}>
            <div>
              <strong>{s.name}</strong>
              <span>
                {s.stocks.length} companies · ${compact(s.cap)}
              </span>
            </div>
            <div className="sector-bar-track">
              <div
                style={{
                  width: `${(Math.abs(s.change) / 3.2) * 100}%`,
                  background:
                    s.change >= 0 ? "var(--positive)" : "var(--negative)",
                }}
              />
            </div>
            <Change value={s.change} />
            <Link href={`/screener`}>
              Explore <ArrowUpRight size={13} />
            </Link>
          </div>
        ))}
      </div>
      <div className="table-footer">
        Weighted by each sample company’s illustrative market cap. This is not
        the performance of a complete sector index.
      </div>
    </section>
  );
}
function InstrumentView({ slug }) {
  const currencyRows = [
    ["EUR / USD", "Euro / US dollar", "1.1642", 0.18, "USD per EUR"],
    ["GBP / USD", "British pound / US dollar", "1.3426", -0.12, "USD per GBP"],
    ["USD / JPY", "US dollar / Japanese yen", "148.72", 0.32, "JPY per USD"],
    [
      "USD / CAD",
      "US dollar / Canadian dollar",
      "1.3814",
      -0.09,
      "CAD per USD",
    ],
    ["USD / CHF", "US dollar / Swiss franc", "0.8072", 0.11, "CHF per USD"],
  ];
  const yields = [
    ["US 2Y", "US Treasury", "3.82%", 0.04, "Percentage points"],
    ["US 10Y", "US Treasury", "4.12%", -0.02, "Percentage points"],
    ["US 30Y", "US Treasury", "4.64%", -0.01, "Percentage points"],
    ["DE 10Y", "Germany sovereign", "2.76%", 0.02, "Percentage points"],
    ["JP 10Y", "Japan sovereign", "1.53%", 0.03, "Percentage points"],
  ];
  const etfs = [
    ["EWJ", "Japan equities", "$78.42", 0.62, "USD"],
    ["EWG", "Germany equities", "$42.18", 0.88, "USD"],
    ["EWU", "United Kingdom equities", "$42.76", 0.26, "USD"],
    ["EWC", "Canada equities", "$48.19", -0.14, "USD"],
    ["INDA", "India equities", "$53.41", 0.44, "USD"],
  ];
  const [query, setQuery] = useState("");
  if (slug === "global-markets")
    return (
      <>
        <div className="market-notice">
          SPY, QQQ, DIA and IWM are US-listed ETF proxies. International session
          quotes are unavailable.
        </div>
        <StockTable rows={STOCKS.filter((s) => s.sector === "Index ETF")} />
      </>
    );
  const rows = (
    slug === "currencies"
      ? currencyRows
      : slug === "global-yields"
        ? yields
        : etfs
  ).filter((row) => row.join(" ").toLowerCase().includes(query.toLowerCase()));
  return (
    <section className="market-panel">
      <div className="research-toolbar">
        <Search
          value={query}
          onChange={setQuery}
          placeholder="Search instruments"
        />
        <span className="toolbar-caption">Illustrative reference values</span>
      </div>
      <div className="market-table-wrap">
        <table className="market-table instrument-table">
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Market / description</th>
              <th>Illustrative level</th>
              <th>Sample change</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([symbol, name, value, change, unit]) => (
              <tr key={symbol}>
                <td>
                  <strong>{symbol}</strong>
                </td>
                <td>{name}</td>
                <td>{value}</td>
                <td className={change >= 0 ? "is-positive" : "is-negative"}>
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(2)}
                  {slug === "global-yields" ? " pp" : "%"}
                </td>
                <td>{unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        Snapshot: Oct 6, 2026. These values are illustrative and carry no
        provider or live-session claim.
      </div>
    </section>
  );
}
function MultiChart() {
  const [range, setRange] = useState("1Y");
  const [symbols, setSymbols] = useState(["SPY", "QQQ", "NVDA", "AAPL"]);
  return (
    <>
      <div className="research-toolbar no-panel">
        <div className="range-tabs">
          {["1M", "3M", "6M", "1Y", "5Y"].map((r) => (
            <button
              key={r}
              className={range === r ? "active" : ""}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <span className="toolbar-caption">
          Aligned illustrative observation dates
        </span>
      </div>
      <div className="multi-chart-grid">
        {symbols.map((symbol, i) => (
          <section className="market-panel" key={i}>
            <div className="multi-chart-heading">
              <select
                value={symbol}
                onChange={(e) =>
                  setSymbols(
                    symbols.map((s, j) => (i === j ? e.target.value : s)),
                  )
                }
                aria-label={`Chart ${i + 1} symbol`}
              >
                {STOCKS.map((s) => (
                  <option key={s.symbol}>{s.symbol}</option>
                ))}
              </select>
              <strong>{currency(findStock(symbol).price)}</strong>
              <Link href={`/stock/${symbol}`} aria-label={`Open ${symbol}`}>
                <ArrowUpRight size={15} />
              </Link>
            </div>
            <PriceChart symbol={symbol} range={range} height={235} compact />
          </section>
        ))}
      </div>
    </>
  );
}
function AnalysisView({ slug }) {
  const [symbol, setSymbol] = useState("NVDA"),
    [range, setRange] = useState("1Y"),
    [notional, setNotional] = useState("10000"),
    [fee, setFee] = useState("0.25"),
    [compare, setCompare] = useState(
      slug.includes("comparison") || slug === "regression-analysis",
    );
  const history = getDemoHistory(symbol, range),
    ret = history.at(-1).price / history[0].price - 1,
    reg = regression(history, getDemoHistory("SPY", range)),
    rsi = calculateRSI(history);
  const hypothetical = ["what-if", "portfolio-comparison"].includes(slug),
    strategy = slug === "rsi-le";
  return (
    <>
      <div className="research-toolbar no-panel">
        <SymbolSelect value={symbol} onChange={setSymbol} />
        <label className="market-field">
          <span>History range</span>
          <select value={range} onChange={(e) => setRange(e.target.value)}>
            {RANGES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="analysis-toggle">
          <input
            type="checkbox"
            checked={compare}
            onChange={(e) => setCompare(e.target.checked)}
          />{" "}
          Compare SPY
        </label>
        {hypothetical && (
          <>
            <label className="market-field">
              <span>Hypothetical starting amount · USD</span>
              <input
                type="number"
                min="0"
                max="1000000000"
                value={notional}
                onChange={(e) => setNotional(e.target.value)}
              />
            </label>
            <label className="market-field">
              <span>Fee assumption · % of starting amount</span>
              <input
                type="number"
                min="0"
                max="100"
                step=".05"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
            </label>
          </>
        )}
      </div>
      <div className="analysis-summary">
        <div>
          <span>{symbol} range return</span>
          <strong>
            <Change value={ret * 100} />
          </strong>
        </div>
        <div>
          <span>
            {hypothetical
              ? "Hypothetical ending amount"
              : strategy
                ? "RSI (14 observations)"
                : "Regression beta vs. SPY"}
          </span>
          <strong>
            {hypothetical
              ? currency(
                  Number(notional) * (1 + ret) -
                    (Number(notional) * Number(fee)) / 100,
                )
              : strategy
                ? rsi.toFixed(1)
                : reg.beta.toFixed(3)}
          </strong>
        </div>
        <div>
          <span>
            {hypothetical
              ? "Assumed fees"
              : strategy
                ? "RSI interpretation"
                : "Regression R²"}
          </span>
          <strong>
            {hypothetical
              ? currency((Number(notional) * Number(fee)) / 100)
              : strategy
                ? rsi < 30
                  ? "Below 30"
                  : rsi > 70
                    ? "Above 70"
                    : "Between 30 and 70"
                : reg.rSquared.toFixed(3)}
          </strong>
        </div>
      </div>
      <section className="market-panel">
        <div className="widget-heading">
          <h2>
            {slug === "regression-analysis"
              ? "Price-return comparison"
              : hypothetical
                ? "Hypothetical price-return history"
                : strategy
                  ? "Price history · RSI context"
                  : "Price and return history"}
          </h2>
          <DemoNote />
        </div>
        <PriceChart
          symbol={symbol}
          range={range}
          compare={compare}
          average={slug === "chart-metrics" || strategy}
          volume={slug === "chart-metrics"}
          height={360}
        />
      </section>
      {slug === "regression-analysis" && reg && (
        <section className="market-panel regression-panel">
          <div>
            <h2>Regression of displayed observation returns</h2>
            <p>
              Dependent variable: {symbol} period return. Independent variable:
              SPY period return. {reg.count} aligned periods. Beta = covariance
              / SPY variance. Alpha = {reg.alpha.toFixed(4)} percentage points
              per observation.
            </p>
          </div>
          <svg
            viewBox="0 0 520 230"
            role="img"
            aria-label="Illustrative return scatter plot"
          >
            {(() => {
              const min =
                  Math.min(...reg.points.flatMap((p) => [p.x, p.y])) - 0.15,
                max = Math.max(...reg.points.flatMap((p) => [p.x, p.y])) + 0.15,
                x = (v) => 30 + ((v - min) / (max - min)) * 460,
                y = (v) => 200 - ((v - min) / (max - min)) * 170;
              return (
                <>
                  <line
                    x1="30"
                    x2="490"
                    y1={y(0)}
                    y2={y(0)}
                    className="chart-grid"
                  />
                  <line
                    x1={x(0)}
                    x2={x(0)}
                    y1="30"
                    y2="200"
                    className="chart-grid"
                  />
                  {reg.points.map((p, i) => (
                    <circle
                      key={i}
                      cx={x(p.x)}
                      cy={y(p.y)}
                      r="3"
                      fill="var(--accent)"
                      opacity=".65"
                    />
                  ))}
                  <line
                    x1={x(min)}
                    x2={x(max)}
                    y1={y(reg.alpha + reg.beta * min)}
                    y2={y(reg.alpha + reg.beta * max)}
                    stroke="#d59b54"
                    strokeWidth="1.5"
                  />
                  <text x="250" y="222" className="chart-axis">
                    SPY return (%)
                  </text>
                  <text x="35" y="18" className="chart-axis">
                    {symbol} return (%)
                  </text>
                </>
              );
            })()}
          </svg>
        </section>
      )}
      <div className="market-notice">
        {hypothetical
          ? "Hypothetical buy-and-hold price return, using illustrative prices. Assumes fractional shares and one fee deduction from starting value; excludes dividends, tax, cash flows and trading costs. This is not an account balance."
          : strategy
            ? "RSI uses Wilder smoothing over 14 displayed observations, which are illustrative and are not always daily sessions. This is an indicator explorer; a trading strategy and backtest are not configured."
            : "All history is illustrative. Only aligned dates are compared. Price returns exclude dividends and transaction costs. Valuation-history feeds are unavailable."}
      </div>
    </>
  );
}
function SupplyChain() {
  const [symbol, setSymbol] = useState("NVDA");
  const alternatives = STOCKS.filter(
    (s) =>
      ["NVDA", "MSFT", "AMZN", "AAPL", "AVGO"].includes(s.symbol) &&
      s.symbol !== symbol,
  );
  return (
    <section className="market-panel">
      <div className="research-toolbar">
        <SymbolSelect value={symbol} onChange={setSymbol} />
        <span className="market-chip">Illustrative relationship exercise</span>
      </div>
      <div className="supply-network">
        <div className="network-center">
          <CompanyMark stock={findStock(symbol)} size={46} />
          <strong>{symbol}</strong>
          <span>Selected company</span>
        </div>
        <div className="network-branches">
          {alternatives.map((s) => (
            <div key={s.symbol}>
              <span className="network-arrow">→</span>
              <Link href={`/stock/${s.symbol}`}>
                <CompanyMark stock={s} />
                <div>
                  <strong>{s.name}</strong>
                  <span>Example research connection · unverified</span>
                </div>
                <ArrowUpRight size={15} />
              </Link>
            </div>
          ))}
        </div>
      </div>
      <div className="market-notice">
        These edges are an illustrative research exercise. No supplier, customer
        or commercial relationship is claimed. A verified relationship evidence
        provider is not configured.
      </div>
    </section>
  );
}

export function WatchlistView() {
  const [stored, setStored, error, ready] = useSaved(
      WATCHLIST_KEY,
      DEFAULT_WATCHLIST,
    ),
    [query, setQuery] = useState("");
  const items = normalizeWatchlist(stored),
    available = STOCKS.filter(
      (s) =>
        !items.some((w) => w.symbol === s.symbol) &&
        `${s.symbol} ${s.name}`.toLowerCase().includes(query.toLowerCase()),
    );
  const update = (symbol, shares) =>
    setStored(
      items.map((w) =>
        w.symbol === symbol
          ? { ...w, shares: shares === "" ? null : Number(shares) }
          : w,
      ),
    );
  const move = (index, offset) => {
    const next = [...items];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    setStored(next);
  };
  const total = items.reduce(
    (sum, w) => sum + (w.shares ?? 0) * findStock(w.symbol).price,
    0,
  );
  return (
    <main className="market-view">
      <Heading
        title="Your watchlist"
        description="The companies you want to keep close."
      >
        <button
          className="market-button"
          onClick={() =>
            downloadCSV("luna-watchlist-illustrative.csv", [
              [
                "Symbol",
                "Shares",
                "Illustrative price USD",
                "Illustrative value USD",
                "Data status",
              ],
              ...items.map((w) => [
                w.symbol,
                w.shares,
                findStock(w.symbol).price,
                w.shares === null ? "" : w.shares * findStock(w.symbol).price,
                "Illustrative",
              ]),
            ])
          }
        >
          <DownloadSimple size={14} /> Export
        </button>
      </Heading>
      <div className="research-summary-strip">
        <div>
          <span>Watching</span>
          <strong>
            {items.length}
            <small>securities</small>
          </strong>
        </div>
        <div>
          <span>Illustrative holding value</span>
          <strong>{currency(total)}</strong>
        </div>
        <div>
          <span>Workspace storage</span>
          <strong className="storage-browser">This browser</strong>
        </div>
      </div>
      <section className="market-panel">
        <div className="research-toolbar">
          <Search
            value={query}
            onChange={setQuery}
            placeholder="Find a company to add"
          />
          <span className="toolbar-caption">
            {ready ? "Restored from this browser" : "Restoring watchlist…"}
          </span>
        </div>
        {query && (
          <div className="watchlist-search-results">
            {available.slice(0, 6).map((s) => (
              <button
                key={s.symbol}
                onClick={() => {
                  setStored([...items, { symbol: s.symbol, shares: null }]);
                  setQuery("");
                }}
              >
                <CompanyMark stock={s} />
                <strong>{s.symbol}</strong>
                <span>{s.name}</span>
                <Plus size={14} />
              </button>
            ))}
            {!available.length && (
              <span>No new symbols match your search.</span>
            )}
          </div>
        )}
        <div className="market-table-wrap">
          <table className="market-table watchlist-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Price</th>
                <th>Change</th>
                <th>Shares (optional)</th>
                <th>Illustrative value</th>
                <th>Order / remove</th>
              </tr>
            </thead>
            <tbody>
              {items.map((w, i) => {
                const s = findStock(w.symbol);
                return (
                  <tr key={w.symbol}>
                    <td>
                      <Link
                        href={`/stock/${w.symbol}`}
                        className="company-cell"
                      >
                        <CompanyMark stock={s} />
                        <div>
                          <strong>{s.symbol}</strong>
                          <span>{s.name}</span>
                        </div>
                      </Link>
                    </td>
                    <td>{currency(s.price)}</td>
                    <td>
                      <Change value={s.change} />
                    </td>
                    <td>
                      <input
                        aria-label={`${s.symbol} shares`}
                        type="number"
                        min="0"
                        step="any"
                        value={w.shares ?? ""}
                        placeholder="—"
                        onChange={(e) => update(s.symbol, e.target.value)}
                      />
                    </td>
                    <td>
                      {w.shares === null ? "—" : currency(w.shares * s.price)}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          aria-label={`Move ${s.symbol} up`}
                          disabled={i === 0}
                          onClick={() => move(i, -1)}
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          aria-label={`Move ${s.symbol} down`}
                          disabled={i === items.length - 1}
                          onClick={() => move(i, 1)}
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          aria-label={`Remove ${s.symbol}`}
                          onClick={() =>
                            setStored(
                              items.filter((item) => item.symbol !== s.symbol),
                            )
                          }
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!items.length && (
            <div className="market-empty">
              <Star size={26} />
              <h3>Start with a company you’re curious about.</h3>
              <p>Use the search above to add your first symbol.</p>
            </div>
          )}
        </div>
        <div className="table-footer">
          Signed-out watchlist · Browser persistence · Duplicate symbols are
          prevented
        </div>
      </section>
      {error && <p className="market-notice">{error}</p>}
      <p className="market-notice">
        The watchlist is saved in this browser. Account synchronization and
        import into an account are unavailable until authentication and account
        storage are configured. Valuations use illustrative quotes.
      </p>
    </main>
  );
}
export function AlertsView() {
  const [stored, setStored, error] = useSaved("luna-alerts-v1", []),
    [symbol, setSymbol] = useState("NVDA"),
    [direction, setDirection] = useState("above"),
    [threshold, setThreshold] = useState("190"),
    [message, setMessage] = useState(""),
    [sample, setSample] = useState("195");
  const rules = Array.isArray(stored)
    ? stored.filter(
        (r) =>
          r &&
          r.id &&
          findStock(r.symbol) &&
          Number.isFinite(r.threshold) &&
          Number.isFinite(r.previous),
      )
    : [];
  const add = () => {
    const value = Number(threshold);
    if (!Number.isFinite(value) || value <= 0) {
      setMessage("Enter a finite price threshold greater than zero.");
      return;
    }
    if (
      rules.some(
        (r) =>
          r.symbol === symbol &&
          r.direction === direction &&
          r.threshold === value,
      )
    ) {
      setMessage("That alert rule already exists.");
      return;
    }
    setStored([
      ...rules,
      {
        id: crypto.randomUUID(),
        symbol,
        direction,
        threshold: value,
        enabled: true,
        previous: findStock(symbol).price,
        triggered: false,
      },
    ]);
    setMessage(
      "Rule saved in this browser. Automatic delivery is not configured.",
    );
  };
  const evaluate = () => {
    const value = Number(sample);
    if (!Number.isFinite(value) || value <= 0) {
      setMessage("Enter a positive simulated quote.");
      return;
    }
    let crossings = 0;
    setStored(
      rules.map((r) => {
        if (!r.enabled || r.symbol !== symbol) return r;
        const crossed = evaluateCrossing(r, value, r.previous);
        if (crossed) crossings++;
        return { ...r, previous: value, triggered: crossed || r.triggered };
      }),
    );
    setMessage(
      `${crossings} new threshold crossing${crossings === 1 ? "" : "s"} in this local simulation. No notification was sent.`,
    );
  };
  return (
    <main className="market-view">
      <Heading
        title="Price alerts"
        description="Define a threshold. Keep the signal in context."
      />
      <div className="alert-availability">
        <Bell size={21} />
        <div>
          <strong>Notification delivery is not configured.</strong>
          <span>
            Rules persist in this browser. Scheduled evaluation, email and push
            delivery are unavailable.
          </span>
        </div>
        <span className="market-chip">Local rules</span>
      </div>
      <section className="market-panel">
        <div className="widget-heading">
          <h2>Create a price alert</h2>
        </div>
        <div className="alert-create">
          <SymbolSelect
            value={symbol}
            onChange={(s) => {
              setSymbol(s);
              setThreshold(String(Math.round(findStock(s).price * 1.03)));
            }}
          />
          <label className="market-field">
            <span>Crossing direction</span>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
            >
              <option value="above">Crosses above</option>
              <option value="below">Crosses below</option>
            </select>
          </label>
          <label className="market-field">
            <span>Threshold · USD</span>
            <input
              type="number"
              min="0.01"
              step=".01"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </label>
          <button className="market-button primary" onClick={add}>
            <Plus size={14} /> Create rule
          </button>
        </div>
      </section>
      <section className="market-panel alert-rules">
        <div className="widget-heading">
          <h2>Your alert rules</h2>
          <span>{rules.length} rules</span>
        </div>
        {rules.map((r) => (
          <div className="alert-rule" key={r.id}>
            <CompanyMark stock={findStock(r.symbol)} />
            <div>
              <strong>
                {r.symbol} crosses {r.direction} {currency(r.threshold)}
              </strong>
              <span>
                Baseline {currency(r.previous)} ·{" "}
                {r.triggered
                  ? "A crossing was simulated"
                  : "No simulated crossing"}
              </span>
            </div>
            <label className="alert-enabled">
              <input
                type="checkbox"
                checked={r.enabled}
                onChange={(e) =>
                  setStored(
                    rules.map((x) =>
                      x.id === r.id ? { ...x, enabled: e.target.checked } : x,
                    ),
                  )
                }
              />
              {r.enabled ? "Enabled locally" : "Disabled"}
            </label>
            <button
              className="icon-button"
              aria-label={`Delete ${r.symbol} alert`}
              onClick={() => setStored(rules.filter((x) => x.id !== r.id))}
            >
              <X size={15} />
            </button>
          </div>
        ))}
        {!rules.length && (
          <div className="market-empty">
            <Bell size={26} />
            <h3>No alert rules yet.</h3>
            <p>Create a threshold above to start your local workspace.</p>
          </div>
        )}
      </section>
      <details className="market-panel alert-simulation">
        <summary>Test a crossing with a simulated quote</summary>
        <div>
          <label className="market-field">
            <span>Simulated {symbol} price · USD</span>
            <input
              type="number"
              min="0.01"
              step=".01"
              value={sample}
              onChange={(e) => setSample(e.target.value)}
            />
          </label>
          <button className="market-button" onClick={evaluate}>
            Evaluate locally
          </button>
          <p>
            The baseline updates after each evaluation. Remaining above or below
            a threshold does not create repeated crossings.
          </p>
        </div>
      </details>
      {(message || error) && (
        <p className="market-notice" role="status">
          {message || error}
        </p>
      )}
    </main>
  );
}

export default function ResearchView({ slug = "screener" }) {
  const key = (Array.isArray(slug) ? slug.join("/") : slug).replace(/^\//, "");
  const [title, description] = TITLES[key] || [
    "Research workspace",
    "Explore the illustrative financial research universe.",
  ];
  return (
    <main className="market-view research-view">
      <Heading title={title} description={description} />
      {[
        "screener",
        "market-movers",
        "market-cap",
        "most-popular",
        "most-popular-stocks",
      ].includes(key) ? (
        <Screener slug={key} />
      ) : ["maps", "company-world-map"].includes(key) ? (
        <StockMap world={key === "company-world-map"} />
      ) : ["earnings-calendar", "upcoming-events"].includes(key) ? (
        <EventCalendar earnings={key === "earnings-calendar"} />
      ) : key === "market-sentiment" ? (
        <div className="sentiment-research">
          <section className="market-panel">
            <div className="widget-heading">
              <h2>Fear & Greed index</h2>
              <DemoNote />
            </div>
            <SentimentPanel />
          </section>
          <section className="market-panel">
            <div className="widget-heading">
              <h2>Context and methodology</h2>
            </div>
            <div className="profile-content">
              <h3>What does a reading of 66 mean?</h3>
              <p>
                In this sample, sentiment is in the “Greed” range. Each of the
                seven illustrative component inputs contributes equally to the
                average. The gauge geometry derives from the result.
              </p>
              <p>
                The previous sample close was 62, the prior-week sample was 58,
                and the prior-month sample was 51. These values demonstrate the
                research workflow.
              </p>
              <p>
                A sentiment reading describes the included signals; it is not a
                return forecast or an investment instruction. A genuine
                sentiment feed and observation history are not configured.
              </p>
              <Link href="/dashboard/chat" className="market-button">
                Explore with Luna <ArrowUpRight size={13} />
              </Link>
            </div>
          </section>
        </div>
      ) : key === "us-sectors" ? (
        <SectorView />
      ) : [
          "global-markets",
          "country-etfs",
          "currencies",
          "global-yields",
        ].includes(key) ? (
        <InstrumentView slug={key} />
      ) : key === "lots-of-charts" ? (
        <MultiChart />
      ) : key === "supply-chain" ? (
        <SupplyChain />
      ) : (
        <AnalysisView slug={key} />
      )}
      <div className="market-page-foot">
        All financial values and event dates are illustrative. No live provider
        is configured.
      </div>
    </main>
  );
}
