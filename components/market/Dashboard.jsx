"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  Plus,
  X,
  DotsSixVertical,
  ArrowsOutSimple,
  CalendarBlank,
  ArrowRight,
} from "@phosphor-icons/react";
import {
  STOCKS,
  currency,
  compact,
  getSentiment,
  normalizeWatchlist,
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
import "./market.css";

export const EVENTS = [
  {
    day: "07",
    month: "OCT",
    time: "8:30 AM ET",
    title: "Consumer credit",
    subtitle: "US economic release",
    tag: "Economy",
    date: "2026-10-07",
  },
  {
    day: "09",
    month: "OCT",
    time: "8:30 AM ET",
    title: "Employment situation",
    subtitle: "Illustrative release calendar",
    tag: "High impact",
    date: "2026-10-09",
  },
  {
    day: "14",
    month: "OCT",
    time: "Before market",
    title: "JPMorgan Chase earnings",
    subtitle: "Q3 2026 · illustrative estimate",
    tag: "Earnings",
    date: "2026-10-14",
  },
  {
    day: "15",
    month: "OCT",
    time: "8:30 AM ET",
    title: "Consumer price index",
    subtitle: "Illustrative release calendar",
    tag: "High impact",
    date: "2026-10-15",
  },
];
const WIDGETS = {
  sentiment: "Market sentiment",
  comparison: "Market performance",
  watchlist: "Watchlist",
  events: "Upcoming events",
  movers: "Market movers",
};
const INITIAL = [
  { id: "sentiment", span: 4 },
  { id: "comparison", span: 8 },
  { id: "watchlist", span: 7 },
  { id: "events", span: 5 },
];
export function SentimentPanel() {
  const reading = getSentiment();
  const angle = Math.PI * (1 - reading.value / 100);
  const colors = ["#d46568", "#dfa265", "#d3bd74", "#92ba8d", "#4b998c"];
  const polar = (value) => {
    const a = Math.PI * (1 - value / 100);
    return [150 + 110 * Math.cos(a), 136 - 110 * Math.sin(a)];
  };
  return (
    <div className="sentiment-widget">
      <div className="sentiment-top">
        <span className="micro-label">FEAR & GREED INDEX</span>
        <span className="market-chip green">Risk appetite</span>
      </div>
      <svg
        className="sentiment-gauge"
        viewBox="0 0 300 192"
        role="img"
        aria-label={`Illustrative sentiment ${reading.value} out of 100, ${reading.rating}`}
      >
        {colors.map((color, i) => {
          const a = polar(i * 20 + 0.7),
            b = polar((i + 1) * 20 - 0.7);
          return (
            <path
              key={color}
              d={`M${a[0]},${a[1]} A110,110 0 0,1 ${b[0]},${b[1]}`}
              fill="none"
              stroke={color}
              strokeWidth="13"
            />
          );
        })}
        <line
          x1="150"
          y1="136"
          x2={150 + 83 * Math.cos(angle)}
          y2={136 - 83 * Math.sin(angle)}
          stroke="var(--text)"
          strokeWidth="2"
        />
        <circle cx="150" cy="136" r="5" fill="var(--text)" />
        <text x="150" y="113" textAnchor="middle" className="gauge-number">
          {reading.value}
        </text>
        <text x="150" y="166" textAnchor="middle" className="gauge-rating">
          {reading.rating}
        </text>
        <text x="28" y="158" className="gauge-boundary">
          0
        </text>
        <text x="262" y="158" className="gauge-boundary">
          100
        </text>
        <text x="20" y="178" className="gauge-boundary">
          Extreme fear
        </text>
        <text x="280" y="178" textAnchor="end" className="gauge-boundary">
          Extreme greed
        </text>
      </svg>
      <div className="sentiment-previous">
        {[
          ["Previous close", reading.previous],
          ["1 week ago", reading.week],
          ["1 month ago", reading.month],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <details className="sentiment-details">
        <summary>
          Explore the seven indicators <ArrowRight size={12} />
        </summary>
        <div>
          {reading.components.map((c) => (
            <div key={c.name}>
              <span>{c.name}</span>
              <meter min="0" max="100" value={c.value} />
              <strong>{c.value}</strong>
            </div>
          ))}
          <p>{reading.basis}. All inputs are illustrative.</p>
        </div>
      </details>
    </div>
  );
}
function ComparisonPanel() {
  const [range, setRange] = useState("1Y");
  return (
    <div className="comparison-widget">
      <div className="widget-subhead">
        <div>
          <span className="micro-label">BENCHMARK COMPARISON</span>
          <h3>A wider view of the market.</h3>
        </div>
        <div className="range-tabs">
          {["1M", "3M", "6M", "1Y", "5Y"].map((r) => (
            <button
              key={r}
              className={r === range ? "active" : ""}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <PriceChart symbol="QQQ" compare range={range} height={265} compact />
      <div className="chart-footer">
        <span>
          <i className="legend-dot" />
          QQQ · Nasdaq 100
        </span>
        <span>
          <i className="legend-dot muted" />
          SPY · S&P 500
        </span>
        <Link href="/stock/QQQ">
          Explore chart <ArrowUpRight size={13} />
        </Link>
      </div>
    </div>
  );
}
export function MiniWatchlist() {
  const [items] = useSaved(WATCHLIST_KEY, DEFAULT_WATCHLIST);
  const selected = normalizeWatchlist(items)
    .map((item) => STOCKS.find((s) => s.symbol === item.symbol))
    .filter(Boolean)
    .slice(0, 5);
  return (
    <div className="mini-watchlist">
      <div className="table-head-mini">
        <span>Company</span>
        <span>Price</span>
        <span>Change</span>
        <span>1M trend</span>
      </div>
      {selected.map((s) => (
        <Link
          href={`/stock/${s.symbol}`}
          key={s.symbol}
          className="watchlist-row"
        >
          <div className="company-cell">
            <CompanyMark stock={s} />
            <div>
              <strong>{s.symbol}</strong>
              <span>{s.name}</span>
            </div>
          </div>
          <strong>{currency(s.price)}</strong>
          <Change value={s.change} />
          <Sparkline
            symbol={s.symbol}
            color={s.change >= 0 ? "var(--positive)" : "var(--negative)"}
          />
        </Link>
      ))}
      {!selected.length && (
        <div className="market-empty">
          Your watchlist is empty. Add a company to follow its research.
        </div>
      )}
      <div className="widget-bottom">
        <span>Saved in this browser</span>
        <Link href="/watchlist">
          Manage watchlist <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
export function MiniEvents() {
  return (
    <div className="mini-events">
      {EVENTS.slice(0, 3).map((event) => (
        <div className="event-row" key={event.title}>
          <div className="event-date">
            <strong>{event.day}</strong>
            <span>{event.month}</span>
          </div>
          <div className="event-info">
            <div>
              <strong>{event.title}</strong>
              <span className="market-chip">{event.tag}</span>
            </div>
            <span>{event.subtitle}</span>
            <small>{event.time}</small>
          </div>
        </div>
      ))}
      <div className="widget-bottom">
        <span>Illustrative calendar</span>
        <Link href="/upcoming-events">
          View calendar <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
export function MiniMovers() {
  return (
    <div className="mini-movers">
      {[...STOCKS]
        .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
        .slice(0, 5)
        .map((s) => (
          <Link
            className="mover-row"
            href={`/stock/${s.symbol}`}
            key={s.symbol}
          >
            <CompanyMark stock={s} />
            <strong>{s.symbol}</strong>
            <span>{s.name}</span>
            <Change value={s.change} />
          </Link>
        ))}
    </div>
  );
}

export default function Dashboard() {
  const [stored, setLayout, error, ready] = useSaved(
    "luna-dashboard-layout-v1",
    INITIAL,
  );
  const layout = Array.isArray(stored)
    ? stored
        .filter(
          (w) => w && WIDGETS[w.id] && [4, 5, 6, 7, 8, 12].includes(w.span),
        )
        .filter((w, i, arr) => arr.findIndex((x) => x.id === w.id) === i)
        .slice(0, 4)
    : INITIAL;
  const [addOpen, setAddOpen] = useState(false),
    [dragged, setDragged] = useState(null);
  const addWidget = (id) => {
    if (layout.length >= 4) return;
    setLayout([...layout, { id, span: 6 }]);
    setAddOpen(false);
  };
  const reorder = (id) => {
    if (!dragged || dragged === id) return;
    const next = [...layout],
      from = next.findIndex((w) => w.id === dragged),
      to = next.findIndex((w) => w.id === id);
    next.splice(to, 0, next.splice(from, 1)[0]);
    setLayout(next);
    setDragged(null);
  };
  return (
    <main className="market-view dashboard-view">
      <div className="market-page-heading">
        <div>
          <span className="page-eyebrow">YOUR RESEARCH WORKSPACE</span>
          <h1>
            Market overview<span className="heading-dot">.</span>
          </h1>
          <p>The big picture, before your next question.</p>
        </div>
        <div className="heading-actions">
          <DemoNote />
          <div className="widget-add">
            <button
              className="market-button primary"
              onClick={() => setAddOpen(!addOpen)}
              aria-expanded={addOpen}
            >
              <Plus size={14} /> Add widget
            </button>
            {addOpen && (
              <div className="widget-add-menu">
                <strong>Your workspace · {layout.length}/4</strong>
                {Object.entries(WIDGETS).map(([id, label]) => (
                  <button
                    key={id}
                    disabled={
                      layout.some((w) => w.id === id) || layout.length >= 4
                    }
                    onClick={() => addWidget(id)}
                  >
                    {label}
                    <Plus size={13} />
                  </button>
                ))}
                <button onClick={() => setAddOpen(false)}>Close</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="index-strip">
        {[
          ["SPY", "S&P 500"],
          ["QQQ", "Nasdaq 100"],
          ["DIA", "Dow Jones"],
          ["IWM", "Russell 2000"],
        ].map(([symbol, name]) => {
          const s = STOCKS.find((s) => s.symbol === symbol);
          return (
            <Link key={symbol} href={`/stock/${symbol}`} className="index-tile">
              <span>
                {name}
                <span className="index-symbol">{symbol}</span>
              </span>
              <div>
                <strong>{currency(s.price)}</strong>
                <Change value={s.change} />
              </div>
              <Sparkline symbol={symbol} />
            </Link>
          );
        })}
      </div>
      {error && (
        <p className="market-notice" role="status">
          {error}
        </p>
      )}
      {!ready && (
        <span className="market-storage-status">Restoring your workspace…</span>
      )}
      <div className="dashboard-grid">
        {layout.map((widget, index) => (
          <section
            className="market-panel dashboard-widget"
            key={widget.id}
            style={{ "--widget-span": widget.span }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => reorder(widget.id)}
          >
            <div className="widget-heading">
              <div>
                <button
                  className="widget-drag"
                  draggable
                  onDragStart={() => setDragged(widget.id)}
                  onDragEnd={() => setDragged(null)}
                  aria-label={`Drag ${WIDGETS[widget.id]} to reorder`}
                >
                  <DotsSixVertical size={15} />
                </button>
                <h2>{WIDGETS[widget.id]}</h2>
              </div>
              <div className="widget-controls">
                <button
                  disabled={index === 0}
                  onClick={() => {
                    const next = [...layout];
                    [next[index - 1], next[index]] = [
                      next[index],
                      next[index - 1],
                    ];
                    setLayout(next);
                  }}
                  aria-label={`Move ${WIDGETS[widget.id]} earlier`}
                >
                  ↑
                </button>
                <button
                  disabled={index === layout.length - 1}
                  onClick={() => {
                    const next = [...layout];
                    [next[index + 1], next[index]] = [
                      next[index],
                      next[index + 1],
                    ];
                    setLayout(next);
                  }}
                  aria-label={`Move ${WIDGETS[widget.id]} later`}
                >
                  ↓
                </button>
                <button
                  title="Resize widget"
                  aria-label={`Resize ${WIDGETS[widget.id]}`}
                  onClick={() =>
                    setLayout(
                      layout.map((w) =>
                        w.id === widget.id
                          ? {
                              ...w,
                              span: w.span === 12 ? 6 : w.span === 6 ? 4 : 12,
                            }
                          : w,
                      ),
                    )
                  }
                >
                  <ArrowsOutSimple size={13} />
                </button>
                <button
                  aria-label={`Remove ${WIDGETS[widget.id]}`}
                  onClick={() =>
                    setLayout(layout.filter((w) => w.id !== widget.id))
                  }
                >
                  <X size={13} />
                </button>
              </div>
            </div>
            {widget.id === "sentiment" ? (
              <SentimentPanel />
            ) : widget.id === "comparison" ? (
              <ComparisonPanel />
            ) : widget.id === "watchlist" ? (
              <MiniWatchlist />
            ) : widget.id === "events" ? (
              <MiniEvents />
            ) : (
              <MiniMovers />
            )}
          </section>
        ))}
      </div>
      {!layout.length && (
        <div className="workspace-empty">
          <span>✦</span>
          <h2>A little room to think.</h2>
          <p>Add your first research widget to make this workspace yours.</p>
          <button
            className="market-button primary"
            onClick={() => setAddOpen(true)}
          >
            <Plus size={14} /> Add a widget
          </button>
          <button className="text-button" onClick={() => setLayout(INITIAL)}>
            Restore the starting layout
          </button>
        </div>
      )}
      <div className="dashboard-context">
        <div className="context-orbit">✦</div>
        <div>
          <strong>Make sense of the market with Luna.</strong>
          <span>
            Move from a ticker to a better question, and from a question to your
            next piece of research.
          </span>
        </div>
        <Link href="/dashboard/chat">
          Start a conversation <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="market-page-foot">
        <span>
          All market values shown are illustrative. A live data provider is not
          configured.
        </span>
        <button onClick={() => setLayout(INITIAL)} className="text-button">
          Restore default layout
        </button>
      </div>
    </main>
  );
}
