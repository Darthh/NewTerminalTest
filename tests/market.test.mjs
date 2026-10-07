import test from "node:test";
import assert from "node:assert/strict";
import {
  getDemoHistory,
  findStock,
  intervalStats,
  alignedReturns,
  movingAverage,
  calculateRSI,
  getSentiment,
  screenStocks,
  normalizeWatchlist,
  evaluateCrossing,
  treemap,
  regression,
} from "../lib/market.mjs";
test("deterministic histories have increasing timestamps and end at the displayed snapshot quote", () => {
  const a = getDemoHistory("NVDA");
  assert.deepEqual(a, getDemoHistory("NVDA"));
  assert.equal(a.at(-1).price, findStock("NVDA").price);
  assert.ok(a.every((p, i) => p.price > 0 && (!i || p.date > a[i - 1].date)));
  assert.deepEqual(getDemoHistory("UNKNOWN"), []);
});
test("backward measurements normalize chronological order and preserve absolute and percentage units", () => {
  const history = [
    { date: "2026-01-01", price: 100 },
    { date: "2026-01-02", price: 120 },
  ];
  assert.deepEqual(intervalStats(history, 1, 0), {
    start: 0,
    end: 1,
    from: "2026-01-01",
    to: "2026-01-02",
    change: 20,
    return: 19.999999999999996,
  });
});
test("comparisons align only common dates and rebase each instrument independently", () => {
  const a = [
      { date: "a", price: 100 },
      { date: "b", price: 120 },
      { date: "c", price: 200 },
    ],
    b = [
      { date: "b", price: 20 },
      { date: "c", price: 22 },
    ];
  const rows = alignedReturns(a, b);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].a, 0);
  assert.equal(rows[0].b, 0);
  assert.ok(Math.abs(rows[1].b - 10) < 1e-10);
});
test("technicals honor unavailable periods and known RSI extremes", () => {
  const rising = Array.from({ length: 25 }, (_, i) => ({
    date: String(i),
    price: i + 1,
  }));
  assert.equal(calculateRSI(rising), 100);
  assert.equal(calculateRSI(rising.slice(0, 5)), null);
  assert.equal(movingAverage(rising, 3)[1].price, null);
  assert.equal(movingAverage(rising, 3)[2].price, 2);
});
test("screener applies numeric filters and sentiment comes from actual component inputs", () => {
  const rows = screenStocks({
    minCap: 1000e9,
    maxPE: 30,
    direction: "asc",
    key: "symbol",
  });
  assert.deepEqual(
    rows.map((x) => x.symbol),
    ["GOOGL", "META"],
  );
  const s = getSentiment();
  assert.equal(
    s.value,
    Math.round(
      s.components.reduce((sum, c) => sum + c.value, 0) / s.components.length,
    ),
  );
});
test("watchlist rejects duplicates and invalid quantities while alert crossings fire once", () => {
  assert.deepEqual(
    normalizeWatchlist([
      { symbol: "NVDA", shares: 4 },
      { symbol: "NVDA", shares: 2 },
      { symbol: "BAD", shares: 1 },
      { symbol: "AAPL", shares: -4 },
    ]),
    [
      { symbol: "NVDA", shares: 4 },
      { symbol: "AAPL", shares: null },
    ],
  );
  const rule = { direction: "above", threshold: 100 };
  assert.equal(evaluateCrossing(rule, 110, 95), true);
  assert.equal(evaluateCrossing(rule, 112, 110), false);
});
test("treemap preserves relative capitalization areas without overlaps or out-of-bounds cells", () => {
  const rows = treemap(
    [
      { symbol: "A", marketCap: 60 },
      { symbol: "B", marketCap: 30 },
      { symbol: "C", marketCap: 10 },
    ],
    100,
    50,
  );
  assert.equal(
    rows.reduce((sum, s) => sum + s.width * s.height, 0),
    5000,
  );
  for (const s of rows) {
    assert.ok(
      Math.abs((s.width * s.height) / 5000 - s.marketCap / 100) < 1e-10,
    );
    assert.ok(
      s.x >= 0 && s.y >= 0 && s.x + s.width <= 100 && s.y + s.height <= 50,
    );
  }
});
test("regression handles identity benchmark and unavailable constant returns", () => {
  const history = getDemoHistory("SPY");
  const reg = regression(history, history);
  assert.ok(Math.abs(reg.beta - 1) < 1e-10);
  assert.ok(Math.abs(reg.rSquared - 1) < 1e-10);
  assert.equal(
    regression(
      [
        { date: "a", price: 1 },
        { date: "b", price: 1 },
        { date: "c", price: 1 },
      ],
      [
        { date: "a", price: 1 },
        { date: "b", price: 1 },
        { date: "c", price: 1 },
      ],
    ),
    null,
  );
});
