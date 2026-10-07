"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Star,
  ArrowUpRight,
  ChartLine,
  CaretDown,
  Check,
} from "@phosphor-icons/react";
import {
  STOCKS,
  RANGES,
  findStock,
  currency,
  compact,
  getDemoHistory,
  calculateRSI,
  normalizeWatchlist,
  DEFAULT_WATCHLIST,
  WATCHLIST_KEY,
} from "../../lib/market.mjs";
import { CompanyMark, DemoNote, Change, PriceChart, useSaved } from "./shared";
import "./market.css";

export function QuoteCard({ symbol = "NVDA" }) {
  const stock = findStock(symbol),
    [range, setRange] = useState("1M");
  if (!stock) return null;
  const stats = [
    ["Open", currency(stock.price / (1 + stock.change / 100))],
    [
      "Day range",
      `${currency(stock.price * 0.986)} – ${currency(stock.price * 1.012)}`,
    ],
    ["Volume", compact(stock.volume)],
    ["Market cap", `$${compact(stock.marketCap)}`],
    ["Trailing P/E", stock.pe ? `${stock.pe.toFixed(1)}×` : "—"],
    ["Forward P/E", "—"],
    ["Profit margin", "—"],
  ];
  return (
    <div className="market-view inline-quote-card">
      <div className="inline-quote-heading">
        <div className="company-cell">
          <CompanyMark stock={stock} />
          <div>
            <strong>{stock.name}</strong>
            <span>{stock.symbol} · USD</span>
          </div>
        </div>
        <Link href={`/stock/${symbol}`} aria-label={`Open ${symbol} research`}>
          <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="inline-quote-price">
        <strong>{currency(stock.price)}</strong>
        <Change value={stock.change} />
        <DemoNote />
      </div>
      <div className="range-tabs">
        {["1D", "5D", "1M", "6M", "1Y", "5Y"].map((r) => (
          <button
            key={r}
            className={range === r ? "active" : ""}
            onClick={() => setRange(r)}
          >
            {r}
          </button>
        ))}
      </div>
      <PriceChart symbol={symbol} range={range} height={132} compact />
      <div className="inline-stat-row">
        {stats.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StockView({ symbol = "NVDA" }) {
  const stock = findStock(symbol),
    [range, setRange] = useState("1Y"),
    [compare, setCompare] = useState(false),
    [volume, setVolume] = useState(true),
    [average, setAverage] = useState(false);
  const [watchlist, setWatchlist, error] = useSaved(
    WATCHLIST_KEY,
    DEFAULT_WATCHLIST,
  );
  if (!stock)
    return (
      <main className="market-view">
        <div className="market-page-heading">
          <div>
            <h1>Symbol unavailable</h1>
            <p>The illustrative research universe does not include {symbol}.</p>
          </div>
        </div>
        <Link href="/screener" className="market-button primary">
          Explore supported companies
        </Link>
      </main>
    );
  const history = getDemoHistory(symbol, range),
    performance = (stock.price / history[0].price - 1) * 100;
  const normalizedWatchlist = normalizeWatchlist(watchlist);
  const saved = normalizedWatchlist.some((w) => w.symbol === stock.symbol);
  const stats = [
    ["Open", currency(stock.price / (1 + stock.change / 100))],
    [
      "Day range",
      `${currency(stock.price * 0.986)} – ${currency(stock.price * 1.012)}`,
    ],
    ["Volume", compact(stock.volume)],
    ["Market cap", currency(stock.marketCap).split(".")[0]],
    ["Trailing P/E", stock.pe ? `${stock.pe.toFixed(1)}×` : "—"],
    ["Forward P/E", "—"],
    ["Profit margin", "—"],
  ];
  return (
    <main className="market-view stock-view">
      <div className="stock-breadcrumb">
        <Link href="/dashboard">Markets</Link>
        <span>/</span>
        <span>Stock research</span>
        <span>/</span>
        <strong>{stock.symbol}</strong>
      </div>
      <div className="stock-identity">
        <div className="company-cell">
          <CompanyMark stock={stock} size={44} />
          <div>
            <h1>{stock.name}</h1>
            <span>
              {stock.symbol} ·{" "}
              {stock.sector.includes("ETF")
                ? "NYSE Arca"
                : "NASDAQ / NYSE illustrative listing"}{" "}
              · {stock.sector} · United States
            </span>
          </div>
        </div>
        <button
          className={`market-button ${saved ? "saved" : ""}`}
          onClick={() =>
            setWatchlist(
              saved
                ? normalizedWatchlist.filter((w) => w.symbol !== stock.symbol)
                : [
                    ...normalizedWatchlist,
                    { symbol: stock.symbol, shares: null },
                  ],
            )
          }
        >
          {saved ? <Check size={15} /> : <Star size={15} />}{" "}
          {saved ? "In your watchlist" : "Add to watchlist"}
        </button>
      </div>
      <div className="stock-price-heading">
        <strong>{currency(stock.price)}</strong>
        <div>
          <Change value={stock.change} />
          <span>Illustrative daily change</span>
        </div>
        <DemoNote>Illustrative close · Oct 6, 2026, 4:00 PM ET · USD</DemoNote>
      </div>
      {error && <p className="market-notice">{error}</p>}
      <div className="stock-columns">
        <div className="stock-main">
          <section className="market-panel stock-chart-panel">
            <div className="stock-chart-heading">
              <div className="stock-view-tabs">
                <span className="active">
                  <ChartLine size={14} /> Price chart
                </span>
                <a href="#company-overview">Overview</a>
                <a href="#company-statistics">Statistics</a>
              </div>
              <span className="range-return">
                <Change value={performance} />
                <small>{range} price return</small>
              </span>
            </div>
            <div className="stock-chart-tools">
              <div className="range-tabs">
                {RANGES.map((r) => (
                  <button
                    className={r === range ? "active" : ""}
                    onClick={() => setRange(r)}
                    key={r}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="chart-toggle-options">
                <label>
                  <input
                    type="checkbox"
                    checked={compare}
                    onChange={(e) => setCompare(e.target.checked)}
                  />{" "}
                  Compare SPY
                </label>
                <details>
                  <summary>
                    Indicators <CaretDown size={11} />
                  </summary>
                  <div>
                    <label>
                      <input
                        type="checkbox"
                        checked={average}
                        onChange={(e) => setAverage(e.target.checked)}
                      />{" "}
                      SMA 20
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={volume}
                        onChange={(e) => setVolume(e.target.checked)}
                      />{" "}
                      Volume
                    </label>
                  </div>
                </details>
              </div>
            </div>
            <PriceChart
              symbol={stock.symbol}
              range={range}
              compare={compare}
              volume={volume}
              average={average}
              height={375}
            />
            <div className="stock-chart-disclosure">
              {compare
                ? "Each series is rebased to 0% on its first shared date."
                : "USD price history."}{" "}
              Deterministic illustrative observations.{" "}
              {average && !compare
                ? "SMA uses the latest 20 displayed observations."
                : ""}
            </div>
          </section>
          <section
            className="market-panel stock-stat-strip"
            id="company-statistics"
          >
            {stats.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </section>
          <section className="market-panel profile-panel" id="company-overview">
            <div className="widget-heading">
              <h2>Company overview</h2>
              <span className="market-chip">Research context</span>
            </div>
            <div className="profile-content">
              <p>
                {stock.name} is included in this illustrative{" "}
                {stock.sector.toLowerCase()} research universe. Explore its
                sample price history, compare returns with SPY, or add it to
                your personal watchlist.
              </p>
              <div className="profile-grid">
                <div>
                  <span>Sector</span>
                  <strong>{stock.sector}</strong>
                </div>
                <div>
                  <span>Headquarters context</span>
                  <strong>{stock.city}</strong>
                </div>
                <div>
                  <span>Market capitalization</span>
                  <strong>${compact(stock.marketCap)}</strong>
                </div>
                <div>
                  <span>Instrument</span>
                  <strong>
                    {stock.sector.includes("ETF")
                      ? "Exchange-traded fund"
                      : "Common stock"}
                  </strong>
                </div>
              </div>
              <p className="profile-disclosure">
                Company context is curated. Quote, valuation and history values
                are illustrative. Analyst estimates, revenue growth, EPS,
                dividends, and fund holdings need a configured provider and are
                unavailable.
              </p>
            </div>
          </section>
        </div>
        <aside className="stock-context">
          <section className="market-panel">
            <div className="widget-heading">
              <h2>At a glance</h2>
              <span className="market-chip">{stock.symbol}</span>
            </div>
            <div className="stock-stat-list">
              {[
                ["Selected range", range],
                [
                  "Range high",
                  currency(Math.max(...history.map((p) => p.price))),
                ],
                [
                  "Range low",
                  currency(Math.min(...history.map((p) => p.price))),
                ],
                [
                  "RSI (14 observations)",
                  calculateRSI(history)?.toFixed(1) || "—",
                ],
                [
                  "52-week range",
                  `${currency(Math.min(...getDemoHistory(symbol).map((p) => p.price)))} – ${currency(Math.max(...getDemoHistory(symbol).map((p) => p.price)))}`,
                ],
                ["Currency", "USD"],
                ["Analyst consensus", "Unavailable"],
                ["Next earnings", "Unavailable"],
              ].map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </section>
          <section className="research-callout">
            <div className="context-orbit">✦</div>
            <h3>Go beyond the chart.</h3>
            <p>
              Explore {stock.symbol} with a question. Luna can show the evidence
              available in your workspace.
            </p>
            <Link
              className="market-button"
              href={`/dashboard/chat?prompt=${encodeURIComponent(`Compare ${stock.symbol} and SPY over the last year. Explain the available data and its limitations.`)}`}
            >
              Research with Luna <ArrowUpRight size={15} />
            </Link>
          </section>
          <section className="market-panel">
            <div className="widget-heading">
              <h2>Continue exploring</h2>
            </div>
            {STOCKS.filter(
              (s) => s.symbol !== stock.symbol && s.sector === stock.sector,
            )
              .slice(0, 4)
              .map((s) => (
                <Link
                  className="related-stock"
                  key={s.symbol}
                  href={`/stock/${s.symbol}`}
                >
                  <CompanyMark stock={s} size={24} />
                  <div>
                    <strong>{s.symbol}</strong>
                    <span>{s.name}</span>
                  </div>
                  <Change value={s.change} />
                </Link>
              ))}
            <Link className="stock-context-more" href="/graphs/comparison">
              Company comparison <ArrowUpRight size={13} />
            </Link>
          </section>
        </aside>
      </div>
      <div className="market-page-foot">
        Research demo · Connect a market data provider for current quotes and
        verified fundamentals.
      </div>
    </main>
  );
}
