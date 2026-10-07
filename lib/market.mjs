/** Deterministic illustrative market fixtures. These are not current provider quotes. */
export const OBSERVED_AT = "2026-10-06T20:00:00.000Z";
export const DEMO_LABEL = "Illustrative data · Oct 6, 2026 · USD";
export const WATCHLIST_KEY = "luna-watchlist-v1";
export const DEFAULT_WATCHLIST = [
  { symbol: "NVDA", shares: null },
  { symbol: "AAPL", shares: null },
  { symbol: "MSFT", shares: null },
  { symbol: "SPY", shares: null },
];
export const STOCKS = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 184.32,
    change: 2.48,
    sector: "Technology",
    marketCap: 4510e9,
    pe: 48.2,
    volume: 172.4e6,
    color: "#76b900",
    city: "Santa Clara, CA",
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 237.49,
    change: 0.86,
    sector: "Technology",
    marketCap: 3570e9,
    pe: 32.6,
    volume: 48.7e6,
    color: "#677386",
    city: "Cupertino, CA",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 512.18,
    change: 1.24,
    sector: "Technology",
    marketCap: 3800e9,
    pe: 36.8,
    volume: 21.2e6,
    color: "#426bd5",
    city: "Redmond, WA",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    price: 226.71,
    change: 1.62,
    sector: "Consumer discretionary",
    marketCap: 2430e9,
    pe: 34.2,
    volume: 32.5e6,
    color: "#dc9823",
    city: "Seattle, WA",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 203.54,
    change: -0.42,
    sector: "Communication services",
    marketCap: 2510e9,
    pe: 24.1,
    volume: 27.8e6,
    color: "#4984e2",
    city: "Mountain View, CA",
  },
  {
    symbol: "META",
    name: "Meta Platforms, Inc.",
    price: 724.61,
    change: 1.83,
    sector: "Communication services",
    marketCap: 1820e9,
    pe: 27.8,
    volume: 16.2e6,
    color: "#147ce5",
    city: "Menlo Park, CA",
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 346.28,
    change: -2.16,
    sector: "Consumer discretionary",
    marketCap: 1110e9,
    pe: 92.4,
    volume: 79.4e6,
    color: "#df4d56",
    city: "Austin, TX",
  },
  {
    symbol: "AVGO",
    name: "Broadcom Inc.",
    price: 297.42,
    change: 3.12,
    sector: "Technology",
    marketCap: 1410e9,
    pe: 58.1,
    volume: 19.2e6,
    color: "#c65566",
    city: "Palo Alto, CA",
  },
  {
    symbol: "AMD",
    name: "Advanced Micro Devices, Inc.",
    price: 176.42,
    change: 1.94,
    sector: "Technology",
    marketCap: 287e9,
    pe: 62.4,
    volume: 43.6e6,
    color: "#cf5564",
    city: "Santa Clara, CA",
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    price: 298.15,
    change: 0.54,
    sector: "Financials",
    marketCap: 822e9,
    pe: 15.4,
    volume: 8.4e6,
    color: "#487497",
    city: "New York, NY",
  },
  {
    symbol: "V",
    name: "Visa Inc.",
    price: 351.07,
    change: 0.72,
    sector: "Financials",
    marketCap: 675e9,
    pe: 31.2,
    volume: 5.2e6,
    color: "#334994",
    city: "San Francisco, CA",
  },
  {
    symbol: "XOM",
    name: "Exxon Mobil Corporation",
    price: 112.63,
    change: -0.78,
    sector: "Energy",
    marketCap: 481e9,
    pe: 14.1,
    volume: 15.2e6,
    color: "#cf4964",
    city: "Spring, TX",
  },
  {
    symbol: "LLY",
    name: "Eli Lilly and Company",
    price: 814.28,
    change: -1.08,
    sector: "Health care",
    marketCap: 773e9,
    pe: 53.6,
    volume: 3.5e6,
    color: "#b55252",
    city: "Indianapolis, IN",
  },
  {
    symbol: "COST",
    name: "Costco Wholesale Corporation",
    price: 968.42,
    change: 0.32,
    sector: "Consumer staples",
    marketCap: 429e9,
    pe: 52.3,
    volume: 1.9e6,
    color: "#ce575f",
    city: "Issaquah, WA",
  },
  {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    price: 652.84,
    change: 0.92,
    sector: "Index ETF",
    marketCap: 703e9,
    pe: null,
    volume: 57.8e6,
    color: "#7865c5",
    city: "New York, NY",
  },
  {
    symbol: "QQQ",
    name: "Invesco QQQ Trust",
    price: 587.26,
    change: 1.38,
    sector: "Index ETF",
    marketCap: 370e9,
    pe: null,
    volume: 39.5e6,
    color: "#765da8",
    city: "Atlanta, GA",
  },
  {
    symbol: "DIA",
    name: "SPDR Dow Jones Industrial Average ETF",
    price: 468.91,
    change: 0.47,
    sector: "Index ETF",
    marketCap: 42e9,
    pe: null,
    volume: 3.1e6,
    color: "#526b9d",
    city: "New York, NY",
  },
  {
    symbol: "IWM",
    name: "iShares Russell 2000 ETF",
    price: 242.17,
    change: -0.28,
    sector: "Index ETF",
    marketCap: 68e9,
    pe: null,
    volume: 22.6e6,
    color: "#4e94ab",
    city: "New York, NY",
  },
].map((stock) => ({
  ...stock,
  changePercent: stock.change,
  currency: "USD",
  asOf: OBSERVED_AT,
}));
export const RANGES = [
  "1D",
  "5D",
  "1M",
  "3M",
  "6M",
  "1Y",
  "2Y",
  "3Y",
  "5Y",
  "10Y",
];
const RANGE_DAYS = {
  "1D": 1,
  "5D": 5,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
  "2Y": 730,
  "3Y": 1095,
  "5Y": 1825,
  "10Y": 3650,
};
export function findStock(symbol) {
  return STOCKS.find((s) => s.symbol === String(symbol).toUpperCase());
}
export function currency(value) {
  return Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(value)
    : "—";
}
export function compact(value) {
  return Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(value)
    : "—";
}
export function percent(value, digits = 2) {
  return Number.isFinite(value)
    ? `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`
    : "—";
}
export function getDemoHistory(symbol, range = "1Y") {
  const stock = findStock(symbol);
  if (!stock) return [];
  const days = RANGE_DAYS[range] ?? 365;
  const length = range === "1D" ? 79 : range === "5D" ? 40 : 121;
  const seed = [...stock.symbol].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const growth = (0.1 + (seed % 13) / 50) * Math.min(days / 365, 4);
  const end = Date.parse(OBSERVED_AT);
  const step =
    range === "1D" ? 5 * 60 * 1000 : (days * 86400000) / (length - 1);
  const raw = Array.from({ length }, (_, i) => {
    const t = i / (length - 1);
    return (
      1 +
      growth * t +
      Math.sin(i * 0.32 + seed) * 0.018 +
      Math.cos(i * 0.83) * 0.009 +
      Math.sin(t * 12) * 0.033
    );
  });
  const last = raw.at(-1);
  return raw.map((v, i) => ({
    date: new Date(end - (length - 1 - i) * step).toISOString(),
    price: Number(((stock.price * v) / last).toFixed(4)),
    close: Number(((stock.price * v) / last).toFixed(4)),
    volume: Math.round(
      stock.volume * (0.5 + Math.abs(Math.sin(i * 2.41 + seed)) * 0.8),
    ),
  }));
}
export function intervalStats(history, first, last) {
  if (!history.length || !Number.isInteger(first) || !Number.isInteger(last))
    return null;
  const start = Math.max(0, Math.min(first, last, history.length - 1));
  const end = Math.max(0, Math.min(Math.max(first, last), history.length - 1));
  const a = history[start],
    b = history[end];
  return {
    start,
    end,
    from: a.date,
    to: b.date,
    change: b.price - a.price,
    return: a.price ? (b.price / a.price - 1) * 100 : null,
  };
}
export function alignedReturns(a, b) {
  const map = new Map(b.map((point) => [point.date, point]));
  const joined = a.filter((point) => map.has(point.date));
  if (!joined.length) return [];
  const firstA = joined[0].price,
    firstB = map.get(joined[0].date).price;
  return joined.map((point) => ({
    date: point.date,
    a: (point.price / firstA - 1) * 100,
    b: (map.get(point.date).price / firstB - 1) * 100,
  }));
}
export function movingAverage(history, window = 20) {
  return history.map((point, i) => ({
    date: point.date,
    price:
      i < window - 1
        ? null
        : history
            .slice(i - window + 1, i + 1)
            .reduce((sum, p) => sum + p.price, 0) / window,
  }));
}
export function calculateRSI(history, period = 14) {
  if (history.length <= period) return null;
  let gain = 0,
    loss = 0;
  for (let i = 1; i <= period; i++) {
    const change = history[i].price - history[i - 1].price;
    gain += Math.max(change, 0);
    loss += Math.max(-change, 0);
  }
  gain /= period;
  loss /= period;
  for (let i = period + 1; i < history.length; i++) {
    const delta = history[i].price - history[i - 1].price;
    gain = (gain * (period - 1) + Math.max(delta, 0)) / period;
    loss = (loss * (period - 1) + Math.max(-delta, 0)) / period;
  }
  return loss === 0 ? (gain === 0 ? 50 : 100) : 100 - 100 / (1 + gain / loss);
}
export const SENTIMENT_COMPONENTS = [
  { name: "Market momentum", value: 74 },
  { name: "Stock price strength", value: 66 },
  { name: "Market breadth", value: 71 },
  { name: "Put / call options", value: 58 },
  { name: "Market volatility", value: 64 },
  { name: "Safe haven demand", value: 62 },
  { name: "Junk bond demand", value: 67 },
];
export function getSentiment() {
  const value = Math.round(
    SENTIMENT_COMPONENTS.reduce((sum, c) => sum + c.value, 0) /
      SENTIMENT_COMPONENTS.length,
  );
  return {
    value,
    rating:
      value < 25
        ? "Extreme fear"
        : value < 45
          ? "Fear"
          : value <= 55
            ? "Neutral"
            : value < 75
              ? "Greed"
              : "Extreme greed",
    components: SENTIMENT_COMPONENTS,
    observedAt: OBSERVED_AT,
    previous: 62,
    week: 58,
    month: 51,
    basis: "Equal-weight mean of seven illustrative inputs",
  };
}
export const DEMO_SENTIMENT = {
  ...getSentiment(),
  asOf: OBSERVED_AT,
  components: SENTIMENT_COMPONENTS.map((component) => ({
    ...component,
    label: component.name,
  })),
};
export function screenStocks({
  query = "",
  sector = "",
  minCap = 0,
  maxPE = Infinity,
  minChange = -Infinity,
  key = "marketCap",
  direction = "desc",
} = {}) {
  return STOCKS.filter(
    (s) =>
      `${s.symbol} ${s.name}`.toLowerCase().includes(query.toLowerCase()) &&
      (!sector || s.sector === sector) &&
      s.marketCap >= minCap &&
      (maxPE === Infinity || (s.pe != null && s.pe <= maxPE)) &&
      s.change >= minChange,
  ).sort((a, b) => {
    const x = a[key],
      y = b[key];
    const order =
      typeof x === "string"
        ? x.localeCompare(y)
        : (x ?? -Infinity) - (y ?? -Infinity);
    return direction === "desc" ? -order : order;
  });
}
export function normalizeWatchlist(items) {
  const seen = new Set();
  return (Array.isArray(items) ? items : [])
    .filter(
      (item) =>
        item &&
        findStock(item.symbol) &&
        !seen.has(item.symbol) &&
        (seen.add(item.symbol) || true),
    )
    .map((item) => ({
      symbol: item.symbol,
      shares:
        item.shares === null ||
        item.shares === "" ||
        !Number.isFinite(Number(item.shares)) ||
        Number(item.shares) < 0
          ? null
          : Number(item.shares),
    }));
}
export function evaluateCrossing(rule, price, previous) {
  if (
    !Number.isFinite(price) ||
    !Number.isFinite(previous) ||
    !Number.isFinite(rule.threshold)
  )
    return false;
  return rule.direction === "above"
    ? previous <= rule.threshold && price > rule.threshold
    : previous >= rule.threshold && price < rule.threshold;
}
/** Stable slice-and-dice treemap; every area is proportional to its market-cap input. */
export function treemap(stocks, width = 1000, height = 450) {
  const rows = stocks
    .filter((s) => Number.isFinite(s.marketCap) && s.marketCap > 0)
    .sort((a, b) => b.marketCap - a.marketCap);
  function split(items, x, y, w, h) {
    if (!items.length) return [];
    if (items.length === 1) return [{ ...items[0], x, y, width: w, height: h }];
    const total = items.reduce((sum, s) => sum + s.marketCap, 0);
    let half = 0,
      index = 0;
    while (index < items.length - 1 && (index === 0 || half < total / 2)) {
      half += items[index].marketCap;
      index++;
    }
    const ratio = half / total;
    return w >= h
      ? [
          ...split(items.slice(0, index), x, y, w * ratio, h),
          ...split(items.slice(index), x + w * ratio, y, w * (1 - ratio), h),
        ]
      : [
          ...split(items.slice(0, index), x, y, w, h * ratio),
          ...split(items.slice(index), x, y + h * ratio, w, h * (1 - ratio)),
        ];
  }
  return split(rows, 0, 0, width, height);
}
export function regression(a, b) {
  const joined = alignedReturns(a, b);
  if (joined.length < 3) return null;
  const returns = joined
    .slice(1)
    .map((point, i) => ({
      x:
        (b.find((p) => p.date === point.date).price /
          b.find((p) => p.date === joined[i].date).price -
          1) *
        100,
      y:
        (a.find((p) => p.date === point.date).price /
          a.find((p) => p.date === joined[i].date).price -
          1) *
        100,
    }));
  const meanX = returns.reduce((sum, p) => sum + p.x, 0) / returns.length,
    meanY = returns.reduce((sum, p) => sum + p.y, 0) / returns.length;
  const varianceX = returns.reduce((sum, p) => sum + (p.x - meanX) ** 2, 0),
    varianceY = returns.reduce((sum, p) => sum + (p.y - meanY) ** 2, 0),
    covariance = returns.reduce(
      (sum, p) => sum + (p.x - meanX) * (p.y - meanY),
      0,
    );
  if (!varianceX || !varianceY) return null;
  const beta = covariance / varianceX,
    alpha = meanY - beta * meanX;
  return {
    points: returns,
    beta,
    alpha,
    rSquared: covariance ** 2 / (varianceX * varianceY),
    count: returns.length,
  };
}
