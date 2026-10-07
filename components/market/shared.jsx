"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  alignedReturns,
  currency,
  getDemoHistory,
  intervalStats,
  movingAverage,
  percent,
} from "../../lib/market.mjs";
import "./market.css";

export function useSaved(key, initial) {
  const [value, setValue] = useState(initial);
  const initialRef = useRef(initial);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          Array.isArray(initialRef.current)
            ? Array.isArray(parsed)
            : parsed !== null && typeof parsed === typeof initialRef.current
        )
          setValue(parsed);
      }
    } catch {
      setError(
        "Browser storage is unavailable. Changes will last for this visit.",
      );
    }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(
        new CustomEvent("luna-storage-updated", { detail: { key } }),
      );
    } catch {
      setError(
        "Browser storage is unavailable. Changes will last for this visit.",
      );
    }
  }, [key, value, ready]);
  return [value, setValue, error, ready];
}
export function CompanyMark({ stock, size = 28 }) {
  return (
    <span
      className="company-mark"
      style={{ "--company": stock.color, width: size, height: size }}
      aria-hidden="true"
    >
      {stock.symbol === "AAPL"
        ? "a"
        : stock.symbol === "MSFT"
          ? "⊞"
          : stock.symbol === "NVDA"
            ? "n"
            : stock.symbol.slice(0, 1)}
    </span>
  );
}
export function Change({ value }) {
  return (
    <span className={value >= 0 ? "is-positive" : "is-negative"}>
      {percent(value)}
    </span>
  );
}
export function DemoNote({ children }) {
  return (
    <span className="demo-note">
      <span />
      {children || "Illustrative snapshot · Oct 6, 2026"}
    </span>
  );
}
export function Sparkline({ symbol, color, height = 36 }) {
  const rows = getDemoHistory(symbol, "1M");
  const values = rows.map((p) => p.price),
    min = Math.min(...values),
    max = Math.max(...values);
  const path = rows
    .map(
      (p, i) =>
        `${i ? "L" : "M"}${(i / (rows.length - 1)) * 104},${height - 4 - ((p.price - min) / (max - min || 1)) * (height - 8)}`,
    )
    .join(" ");
  return (
    <svg
      className="sparkline"
      viewBox={`0 0 104 ${height}`}
      aria-label={`${symbol} illustrative one-month history`}
      role="img"
    >
      <path
        d={path}
        fill="none"
        stroke={color || "var(--accent)"}
        strokeWidth="1.7"
      />
    </svg>
  );
}
const shortDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
const fullDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
const intervalDate = (date, range) =>
  fullDate(date) +
  (["1D", "5D"].includes(range)
    ? ` ${new Date(date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" })} ET`
    : "");

export function PriceChart({
  symbol = "NVDA",
  range = "1Y",
  compare = false,
  height = 330,
  volume = false,
  average = false,
  compact = false,
  measure = true,
}) {
  const uid = useId().replaceAll(":", "");
  const history = useMemo(() => getDemoHistory(symbol, range), [symbol, range]);
  const benchmark = useMemo(() => getDemoHistory("SPY", range), [range]);
  const returns = useMemo(
    () => alignedReturns(history, benchmark),
    [history, benchmark],
  );
  const [hover, setHover] = useState(null);
  const [selection, setSelection] = useState(null);
  const [drag, setDrag] = useState(null);
  const dragging = useRef(null);
  const [from, setFrom] = useState(0),
    [to, setTo] = useState(0);
  const plotRef = useRef(null);
  const [frameWidth, setFrameWidth] = useState(960);
  useEffect(() => {
    const node = plotRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const next = Math.round(entries[0].contentRect.width);
      if (next > 0) setFrameWidth(next);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    setHover(null);
    setSelection(null);
    setDrag(null);
    setFrom(0);
    setTo(history.length - 1);
    dragging.current = null;
  }, [symbol, range, history.length]);
  if (!history.length)
    return (
      <div className="market-empty">
        History is unavailable for this symbol.
      </div>
    );
  const width = Math.max(280, frameWidth),
    renderHeight = compact
      ? Math.min(
          height,
          Math.max(height <= 190 ? height : 180, frameWidth * 0.27),
        )
      : Math.min(height, Math.max(250, frameWidth * 0.43)),
    left = 8,
    right = 63,
    top = 28,
    bottom = volume ? 64 : 34,
    chartHeight = renderHeight - top - bottom,
    chartWidth = width - left - right;
  const values = compare
    ? returns.flatMap((p) => [p.a, p.b])
    : history.map((p) => p.price);
  const low = Math.min(...values),
    high = Math.max(...values),
    padding = (high - low) * 0.09 || 1,
    min = low - padding,
    max = high + padding;
  const x = (i) => left + (i / (history.length - 1)) * chartWidth;
  const y = (v) => top + ((max - v) / (max - min)) * chartHeight;
  const points = compare
    ? returns.map((p) => p.a)
    : history.map((p) => p.price);
  const path = points
    .map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(2)},${y(v).toFixed(2)}`)
    .join(" ");
  const basePath = compare
    ? returns
        .map(
          (p, i) => `${i ? "L" : "M"}${x(i).toFixed(2)},${y(p.b).toFixed(2)}`,
        )
        .join(" ")
    : "";
  const averagePath =
    average && !compare
      ? movingAverage(history)
          .filter((p) => p.price !== null)
          .map(
            (p, i) =>
              `${i ? "L" : "M"}${x(history.findIndex((row) => row.date === p.date))},${y(p.price)}`,
          )
          .join(" ")
      : "";
  const chosen = drag || selection;
  const stats = chosen ? intervalStats(history, chosen[0], chosen[1]) : null;
  const hoverPoint = hover === null ? null : history[hover];
  const getIndex = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const position =
      (((event.clientX - bounds.left) / bounds.width) * width - left) /
      chartWidth;
    return Math.min(
      history.length - 1,
      Math.max(0, Math.round(position * (history.length - 1))),
    );
  };
  const onDown = (event) => {
    if (!measure || event.button > 0) return;
    const index = getIndex(event);
    dragging.current = index;
    setDrag([index, index]);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onMove = (event) => {
    const index = getIndex(event);
    setHover(index);
    if (dragging.current !== null) setDrag([dragging.current, index]);
  };
  const onUp = (event) => {
    if (dragging.current === null) return;
    const index = getIndex(event);
    setSelection(index === dragging.current ? null : [dragging.current, index]);
    setDrag(null);
    dragging.current = null;
  };
  const maxVolume = Math.max(...history.map((p) => p.volume));
  return (
    <div
      className={`price-chart ${compact ? "chart-compact" : ""}`}
      ref={plotRef}
    >
      <div className="chart-readout">
        {hoverPoint ? (
          <>
            <strong>
              {compare
                ? percent(returns[hover]?.a)
                : currency(hoverPoint.price)}
            </strong>
            <span>
              {fullDate(hoverPoint.date)}{" "}
              {range === "1D"
                ? new Date(hoverPoint.date).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "America/New_York",
                  }) + " ET"
                : ""}
            </span>
            <span
              className={
                history.at(-1).price >= hoverPoint.price
                  ? "is-positive"
                  : "is-negative"
              }
            >
              {percent((history.at(-1).price / hoverPoint.price - 1) * 100)} to
              snapshot
            </span>
          </>
        ) : (
          <>
            <span className="chart-series-dot" /> <strong>{symbol}</strong>
            {compare && (
              <>
                <span className="chart-series-dot benchmark" />
                <strong>SPY</strong>
                <span>Return rebased to 0% · aligned dates</span>
              </>
            )}
            {!compare && <span>USD · drag to measure an interval</span>}
          </>
        )}
      </div>
      <svg
        className="main-price-svg"
        viewBox={`0 0 ${width} ${renderHeight}`}
        role="img"
        aria-label={`${symbol} ${range} illustrative ${compare ? "percentage-return comparison with SPY" : "price history"}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => {
          setDrag(null);
          dragging.current = null;
        }}
        onPointerLeave={() => {
          if (dragging.current === null) setHover(null);
        }}
      >
        <defs>
          <linearGradient id={`fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity=".16" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity=".005" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => {
          const v = min + ((max - min) * i) / 4;
          return (
            <g key={i}>
              <line
                x1={left}
                x2={width - right}
                y1={y(v)}
                y2={y(v)}
                className="chart-grid"
              />
              <text x={width - right + 10} y={y(v) + 4} className="chart-axis">
                {compare ? `${v.toFixed(1)}%` : v.toFixed(2)}
              </text>
            </g>
          );
        })}
        {!compare && (
          <path
            d={`${path} L${x(history.length - 1)},${top + chartHeight} L${left},${top + chartHeight} Z`}
            fill={`url(#fill-${uid})`}
          />
        )}
        {compare && (
          <path
            d={basePath}
            stroke="#94a8c7"
            strokeWidth="1.7"
            fill="none"
            strokeDasharray="5 4"
          />
        )}
        <path
          d={path}
          stroke="var(--accent)"
          strokeWidth="2.25"
          fill="none"
          strokeLinejoin="round"
        />
        {averagePath && (
          <path
            d={averagePath}
            stroke="#d99949"
            strokeWidth="1.5"
            fill="none"
          />
        )}
        {volume &&
          history.map((p, i) => (
            <rect
              key={i}
              x={x(i) - (chartWidth / history.length) * 0.3}
              y={renderHeight - 31 - (p.volume / maxVolume) * 25}
              width={(chartWidth / history.length) * 0.6}
              height={(p.volume / maxVolume) * 25}
              fill="var(--accent)"
              opacity=".18"
            />
          ))}
        {[0, 0.25, 0.5, 0.75, 1].map((n) => {
          const i = Math.round(n * (history.length - 1));
          return (
            <text
              key={n}
              x={x(i)}
              y={renderHeight - 8}
              textAnchor={n === 0 ? "start" : n === 1 ? "end" : "middle"}
              className="chart-axis"
            >
              {range === "1D"
                ? new Date(history[i].date).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: "America/New_York",
                  })
                : ["2Y", "3Y", "5Y", "10Y"].includes(range)
                  ? new Date(history[i].date).toLocaleDateString("en-US", {
                      month: "short",
                      year: "2-digit",
                      timeZone: "UTC",
                    })
                  : shortDate(history[i].date)}
            </text>
          );
        })}
        {!compact &&
          !compare &&
          [
            [high, "H"],
            [low, "L"],
          ].map(([value, label]) => {
            const i = points.indexOf(value);
            return (
              <g key={label}>
                <circle cx={x(i)} cy={y(value)} r="2.5" fill="var(--accent)" />
                <text
                  x={x(i)}
                  y={y(value) + (label === "H" ? -9 : 16)}
                  textAnchor={i > history.length * 0.7 ? "end" : "start"}
                  className="chart-axis"
                >
                  {label} {currency(value)}
                </text>
              </g>
            );
          })}
        {stats && (
          <g>
            <rect
              x={x(stats.start)}
              y={top}
              width={Math.max(1, x(stats.end) - x(stats.start))}
              height={chartHeight}
              fill="var(--accent)"
              opacity=".10"
            />
            <line
              x1={x(stats.start)}
              x2={x(stats.start)}
              y1={top}
              y2={top + chartHeight}
              stroke="var(--accent)"
              strokeDasharray="4 3"
            />
            <line
              x1={x(stats.end)}
              x2={x(stats.end)}
              y1={top}
              y2={top + chartHeight}
              stroke="var(--accent)"
              strokeDasharray="4 3"
            />
          </g>
        )}
        {hover !== null && (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={top}
              y2={top + chartHeight}
              stroke="var(--muted)"
              strokeDasharray="2 4"
            />
            <circle
              cx={x(hover)}
              cy={y(points[hover])}
              r="4"
              fill="var(--accent)"
              stroke="var(--panel)"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>
      {stats && (
        <div className="measurement-result" aria-live="polite">
          <span>
            {intervalDate(stats.from, range)} → {intervalDate(stats.to, range)}
          </span>
          <strong className={stats.change >= 0 ? "is-positive" : "is-negative"}>
            {currency(stats.change)} ({percent(stats.return)})
          </strong>
          <button onClick={() => setSelection(null)}>Clear measurement</button>
        </div>
      )}
      {measure && (
        <details className="accessible-measure">
          <summary>Measure with keyboard</summary>
          <div>
            <label>
              From{" "}
              <select
                value={from}
                onChange={(e) => setFrom(Number(e.target.value))}
              >
                {history.map((p, i) => (
                  <option value={i} key={p.date}>
                    {intervalDate(p.date, range)} · {currency(p.price)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              To{" "}
              <select
                value={to}
                onChange={(e) => setTo(Number(e.target.value))}
              >
                {history.map((p, i) => (
                  <option value={i} key={p.date}>
                    {intervalDate(p.date, range)} · {currency(p.price)}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="market-button"
              onClick={() => setSelection([from, to])}
            >
              Measure interval
            </button>
          </div>
        </details>
      )}
    </div>
  );
}
