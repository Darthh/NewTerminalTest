/** The navigation rail and research assistant share this route catalog. */
export const GROUPS = [
  {
    label: "Advisor Tools",
    icon: "Briefcase",
    entries: [
      {
        label: "Finance CRM",
        href: "/finance-crm",
        keywords: "client advisor contact relationship reviews",
      },
      {
        label: "Client Portfolios",
        href: "/client-portfolios",
        keywords: "client holdings allocations assets",
      },
      {
        label: "Model Portfolios",
        href: "/model-portfolios",
        keywords: "strategy allocation model balanced portfolio",
      },
      {
        label: "Reports",
        href: "/reports",
        keywords:
          "create build client report builder pdf csv export template proposal",
      },
      {
        label: "13F Filings",
        href: "/13Filings",
        keywords: "berkshire hathaway institutional holdings sec edgar manager",
      },
    ],
  },
  {
    label: "Graphs",
    icon: "ChartLine",
    entries: [
      {
        label: "Stock quote",
        href: "/stock/NVDA",
        keywords: "price quote stock company security ticker",
      },
      {
        label: "Charted metrics",
        href: "/chart-metrics",
        keywords: "metrics chart fundamentals analytics",
      },
      {
        label: "Portfolio comparison",
        href: "/portfolio-comparison",
        keywords: "portfolio compare benchmark return",
      },
      {
        label: "Regression analysis",
        href: "/regression-analysis",
        keywords: "regression correlation beta r squared",
      },
      {
        label: "Historical metrics",
        href: "/graphs/historical",
        keywords: "historical valuation pe price earnings history",
      },
      {
        label: "Company comparison",
        href: "/graphs/comparison",
        keywords: "company compare nvda spy performance",
      },
      {
        label: "Live chart",
        href: "/rsi-le",
        keywords: "rsi technical strategy indicator live chart",
      },
    ],
  },
  {
    label: "Research tools",
    icon: "MagnifyingGlass",
    entries: [
      {
        label: "Stock maps",
        href: "/maps",
        keywords: "treemap heatmap sector stocks map",
      },
      {
        label: "Supply chain",
        href: "/supply-chain",
        keywords: "supply chain suppliers customers semiconductor network",
      },
      {
        label: "Stock screener",
        href: "/screener",
        keywords: "screener filters search valuation market cap",
      },
      {
        label: "Market movers",
        href: "/market-movers",
        keywords: "gainers losers movers changes",
      },
      {
        label: "Earnings calendar",
        href: "/earnings-calendar",
        keywords: "earnings calendar results quarter eps estimates",
      },
      {
        label: "Companies by market cap",
        href: "/market-cap",
        keywords: "largest companies market capitalization ranking",
      },
      {
        label: "Company world map",
        href: "/company-world-map",
        keywords: "geography headquarters location world map",
      },
      {
        label: "Market sentiment",
        href: "/dashboard",
        keywords: "fear greed sentiment market context indicators",
      },
      {
        label: "Upcoming events",
        href: "/earnings-calendar",
        keywords: "upcoming events economic calendar",
      },
      {
        label: "Most popular stocks",
        href: "/market-cap",
        keywords: "popular stocks most researched",
      },
    ],
  },
  {
    label: "Interactive",
    icon: "Globe",
    entries: [
      {
        label: "Global markets",
        href: "/global-markets",
        keywords: "global world indices markets",
      },
      {
        label: "Lots of Charts",
        href: "/lots-of-charts",
        keywords: "multiple charts grid",
      },
      {
        label: "Country ETFs",
        href: "/country-etfs",
        keywords: "country etf international funds",
      },
      {
        label: "US Sectors",
        href: "/us-sectors",
        keywords: "us sectors technology financial energy",
      },
      {
        label: "Major Currencies",
        href: "/currencies",
        keywords: "currency currencies forex exchange rates",
      },
      {
        label: "Global Yields",
        href: "/global-yields",
        keywords: "yields bonds treasury interest fixed income",
      },
      {
        label: "What if",
        href: "/what-if",
        keywords: "what if hypothetical investment scenario",
      },
    ],
  },
  {
    label: "Personal workspace",
    icon: "User",
    entries: [
      {
        label: "New Chat",
        href: "/dashboard/chat",
        keywords: "ai luna assistant new conversation chatbot",
      },
      {
        label: "Saved conversations",
        href: "/dashboard/chat?history=1",
        keywords: "saved conversations chat history archive",
      },
      {
        label: "Watchlist",
        href: "/watchlist",
        keywords: "watchlist favorites saved stocks",
      },
      {
        label: "Alerts",
        href: "/alerts",
        keywords: "alerts notifications price crossing threshold",
      },
    ],
  },
];

export const PAGES = GROUPS.flatMap((group) =>
  group.entries.map((entry) => ({ ...entry, group: group.label })),
);

/** Bounded lexical discovery. It returns actual routes rather than generated URLs. */
export function findPages(query, limit = 5) {
  if (typeof query !== "string" || !query.trim()) return [];
  const words = query.toLowerCase().match(/[a-z0-9]+/g) || [];
  const stop = new Set([
    "a",
    "an",
    "the",
    "to",
    "of",
    "for",
    "and",
    "is",
    "in",
    "can",
    "i",
    "where",
    "with",
    "review",
    "my",
  ]);
  const terms = [...new Set(words.filter((word) => !stop.has(word)))].slice(
    0,
    30,
  );
  return PAGES.map((page) => {
    const label = page.label.toLowerCase();
    const text = `${label} ${page.keywords}`;
    const score = terms.reduce(
      (total, term) =>
        total + (label.includes(term) ? 3 : text.includes(term) ? 1 : 0),
      0,
    );
    return { page, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(10, Math.max(1, Number(limit) || 5)))
    .map(({ page }) => ({
      label: page.label,
      href: page.href,
      group: page.group,
    }));
}
