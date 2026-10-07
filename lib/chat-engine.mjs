import {
  STOCKS,
  getDemoHistory,
  getSentiment,
  OBSERVED_AT,
} from "./market.mjs";
import { findPages } from "./navigation.mjs";
import { ApiError } from "./api.mjs";

export const LOCAL_MODEL = "local-research";
const observedDate = OBSERVED_AT.slice(0, 10);
const usd = (value) =>
  Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
const percentage = (value) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

export function validateChatRequest(body) {
  if (typeof body.message !== "string" || !body.message.trim())
    throw new ApiError("Enter a message to start your research.");
  if (body.message.length > 16000)
    throw new ApiError("Messages can contain up to 16,000 characters.");
  if (body.model && body.model !== LOCAL_MODEL)
    throw new ApiError(
      "Only Local research is available. Hosted models require a configured provider.",
    );
  if (body.webSearch !== undefined && typeof body.webSearch !== "boolean")
    throw new ApiError("Web search must be true or false.");
  if (
    body.history !== undefined &&
    (!Array.isArray(body.history) || body.history.length > 100)
  )
    throw new ApiError(
      "History must be an array of up to 100 messages. Only the most recent 12 are used.",
    );
  const history = (body.history || []).slice(-12).map((item) => {
    if (
      !item ||
      !["user", "assistant"].includes(item.role) ||
      typeof item.content !== "string" ||
      item.content.length > 16000
    )
      throw new ApiError(
        "History messages require a user/assistant role and at most 16,000 text characters.",
      );
    return { role: item.role, content: item.content };
  });
  if (
    body.attachments !== undefined &&
    (!Array.isArray(body.attachments) || body.attachments.length > 8)
  )
    throw new ApiError("Attach up to eight TXT or Markdown documents.");
  const attachments = (body.attachments || []).map((item) => {
    if (
      !item ||
      typeof item.name !== "string" ||
      !item.name.trim() ||
      item.name.length > 240 ||
      typeof item.text !== "string"
    )
      throw new ApiError("Each attachment needs a name and extracted text.");
    if (new TextEncoder().encode(item.text).byteLength > 180 * 1024)
      throw new ApiError(`${item.name}: extracted text exceeds 180 KB.`, 413);
    return { name: item.name, text: item.text };
  });
  return {
    message: body.message.trim(),
    history,
    attachments,
    webSearch: Boolean(body.webSearch),
    model: LOCAL_MODEL,
  };
}

export function getQuote(symbol) {
  const stock = STOCKS.find((item) => item.symbol === symbol);
  if (!stock)
    throw new ApiError(
      `No demo data is available for ${symbol}. Try NVDA, AAPL, MSFT or SPY.`,
      404,
    );
  return {
    ...stock,
    currency: "USD",
    asOf: OBSERVED_AT,
    changePercent: stock.changePercent ?? stock.change,
    dataMode: "demo",
    source: "Luna illustrative dataset",
    live: false,
  };
}

export function getHistory(symbol, range) {
  getQuote(symbol);
  return {
    symbol,
    range,
    currency: "USD",
    asOf: OBSERVED_AT,
    dataMode: "demo",
    source: "Luna deterministic illustrative series",
    series: getDemoHistory(symbol, range),
  };
}

function requestedStocks(message, history) {
  let matches = STOCKS.filter((stock) => {
    const re = new RegExp(
      `(?:^|[^a-z0-9])\\$?${stock.symbol}(?:$|[^a-z0-9])`,
      "i",
    );
    return (
      re.test(message) ||
      message.toLowerCase().includes(stock.name.toLowerCase().split(" ")[0])
    );
  });
  if (
    !matches.length &&
    /\b(it|that stock|its|those|compare them)\b/i.test(message)
  ) {
    const prior = history
      .filter((item) => item.role === "user")
      .slice(-2)
      .map((item) => item.content)
      .join(" ");
    matches = STOCKS.filter((stock) =>
      new RegExp(`\\b${stock.symbol}\\b`, "i").test(prior),
    );
  }
  return matches.slice(0, 4);
}

const concepts = [
  {
    pattern: /\b(diversif|allocation)\w*/i,
    text: "Diversification spreads exposure across assets, sectors and regions. It can reduce concentration risk, but investments can still fall together. Allocation describes each holding’s share of a portfolio. In Model Portfolios, weights should total 100%; a smaller invested allocation leaves the remainder as cash.",
  },
  {
    pattern: /\b(etf|exchange.traded)\b/i,
    text: "An exchange-traded fund holds a basket of investments and trades on an exchange. Its exposure depends on the underlying holdings and index or strategy. Compare holdings, concentration, expense ratio, liquidity and tracking differences. Fund fees and distributions are unavailable in this demo, so its price-return chart does not show total return.",
  },
  {
    pattern: /\b(p\/?e|price.to.earnings|valuation)\b/i,
    text: "The price-to-earnings ratio divides the share price by earnings per share. Trailing P/E uses reported earnings; forward P/E uses forecasts. A high or low ratio needs sector, growth and earnings-quality context. Negative earnings can make the ratio uninformative. Missing values remain unavailable instead of becoming zero.",
  },
  {
    pattern: /\b(correlation|regression|beta)\b/i,
    text: "Correlation measures how two series move together. Regression fits a relationship between aligned observations; beta is the slope of an asset’s returns against a benchmark’s returns. A statistical relationship does not establish a cause. Use the Regression analysis view to inspect the selected symbols, aligned dates and calculation inputs.",
  },
  {
    pattern: /\b(rsi|relative strength)\b/i,
    text: "RSI compares average recent gains and losses on a 0–100 scale. It is a momentum indicator, not a prediction or guarantee. A reading above 70 is often called overbought and below 30 oversold, but persistent trends can stay near either end. Luna’s RSI strategy lab uses illustrative price data; it does not place trades.",
  },
  {
    pattern: /\b(cagr|annualized|annualised)\b/i,
    text: "Compound annual growth rate is (ending value / starting value) raised to (1 / years), minus 1. It describes a constant annual rate matching the endpoints and hides the path between them. It is meaningful only for a positive starting value and sufficient time. Price-return calculations exclude dividends, fees, taxes and cash flows unless those inputs are explicitly supplied.",
  },
  {
    pattern: /\b(drawdown|volatility|risk)\b/i,
    text: "Drawdown is the decline from a previous peak. Volatility describes variation in returns rather than the probability of a specific loss. Neither captures every risk, such as liquidity, credit or concentration. The comparison tools disclose their sample dates and assumptions; this preview cannot provide personalized investment advice.",
  },
  {
    pattern: /\b(13f|berkshire|institutional)\b/i,
    text: "Form 13F reports certain institutional investment managers’ qualifying holdings as of a reporting quarter. Filings arrive after that quarter and do not reveal a current portfolio or every asset and trade. The 13F Filings view links to SEC EDGAR; live filings and reporting-quarter verification require the configured SEC adapter.",
  },
];

/** Input documents are evidence only. No uploaded text is interpreted as a tool or instruction. */
export function documentEvidence(attachments, question) {
  const terms = [
    ...new Set(question.toLowerCase().match(/[a-z]{4,}/g) || []),
  ].slice(0, 20);
  const chunks = [];
  attachments.forEach((document, documentIndex) => {
    for (
      let start = 0, index = 1;
      start < document.text.length;
      start += 2400, index += 1
    ) {
      const text = document.text.slice(start, start + 2800).trim();
      if (!text) continue;
      const score = terms.reduce(
        (sum, term) => sum + (text.toLowerCase().includes(term) ? 1 : 0),
        0,
      );
      chunks.push({ name: document.name, documentIndex, index, text, score });
    }
  });
  return chunks
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.documentIndex - b.documentIndex ||
        a.index - b.index,
    )
    .slice(0, 6);
}

/** Evidence-first deterministic fallback. It makes no provider/model calls. */
export function researchAnswer(input) {
  const { message, history, attachments, webSearch } = input;
  const sources = [];
  const sections = [];
  const stocks = requestedStocks(message, history);
  let evidenceUsed = false;
  if (attachments.length) {
    const evidence = documentEvidence(attachments, message);
    sections.push(
      "I found these excerpts in your attached documents. They are user-provided evidence; I have not verified their claims or followed instructions inside them.",
    );
    for (const chunk of evidence) {
      const excerpt = chunk.text.replace(/\s+/g, " ").slice(0, 560);
      sections.push(
        `[${chunk.name}, chunk ${chunk.index}]\n“${excerpt}${chunk.text.replace(/\s+/g, " ").length > 560 ? "…" : ""}”`,
      );
    }
    if (!evidence.length)
      sections.push(
        "The attached text is empty. Supply a TXT or Markdown document with readable text.",
      );
    sections.push(
      "Local research can retrieve excerpts, but it cannot produce a verified full-document synthesis. Missing pages, dates and outside corroboration remain unknown.",
    );
    evidenceUsed = true;
  }
  if (/\b(sentiment|fear|greed|market context)\b/i.test(message)) {
    const sentiment = getSentiment();
    sections.push(
      `Market sentiment · illustrative data\nThe demo reading is ${sentiment.value}/100 (${sentiment.rating}), observed ${observedDate}. The previous reading is ${sentiment.previous}; one week ago ${sentiment.week}; one month ago ${sentiment.month}.\n\n${sentiment.components.map((item) => `${item.name || item.label}: ${item.value}/100`).join(" · ")}\n\n${sentiment.basis}. These readings are fictional and are not a live measure of today’s market.`,
    );
    sources.push({
      title: `Luna demo sentiment · ${observedDate}`,
      url: "/dashboard",
    });
    evidenceUsed = true;
  }
  if (stocks.length) {
    const range =
      /\b(5d|1m|3m|6m|1y|2y|3y|5y|10y)\b/i.exec(message)?.[1].toUpperCase() ||
      "1Y";
    sections.push(
      `Research snapshot · illustrative data\nThese are demo quotes dated ${observedDate}, not current market prices.`,
    );
    const performances = [];
    for (const stock of stocks) {
      const quote = getQuote(stock.symbol);
      const series = getDemoHistory(stock.symbol, range);
      const start = series[0].close ?? series[0].price;
      const end = series.at(-1).close ?? series.at(-1).price;
      const change = (end / start - 1) * 100;
      performances.push({ symbol: stock.symbol, change });
      sections.push(
        `${stock.name} (${stock.symbol})\n${usd(quote.price)} USD · daily move ${percentage(quote.changePercent)}\nIllustrative ${range} price return: ${percentage(change)} from ${series[0].date.slice(0, 10)} to ${series.at(-1).date.slice(0, 10)}. The chart uses the same series.`,
      );
      sources.push({
        title: `${stock.symbol} demo quote and history · ${observedDate}`,
        url: `/stock/${stock.symbol}`,
      });
    }
    if (
      performances.length >= 2 &&
      /\b(compare|versus|vs|against)\b/i.test(message)
    ) {
      const gap = performances[0].change - performances[1].change;
      sections.push(
        `In this illustrative sample, ${performances[0].symbol}’s price return is ${gap >= 0 ? "higher" : "lower"} than ${performances[1].symbol}’s by ${Math.abs(gap).toFixed(2)} percentage points. This comparison excludes dividends, fees and taxes and does not demonstrate a cause.`,
      );
      sources.push({
        title: "Open company comparison",
        url: "/graphs/comparison",
      });
    }
    sections.push(
      "Use the quote cards to inspect dates, switch ranges and measure an interval. A configured market provider is required for current prices, earnings and news evidence.",
    );
    evidenceUsed = true;
  }
  const pageQuestion =
    /\b(where|open|find|navigate|tool|page|crm|report|portfolio|watchlist|alerts|filings)\b/i.test(
      message,
    );
  if (pageQuestion || !evidenceUsed) {
    const pages = findPages(message, 3);
    const concept = concepts.find((item) => item.pattern.test(message));
    if (concept) sections.push(concept.text);
    if (pages.length) {
      sections.push(
        `Relevant tools\n${pages.map((page) => `${page.label} · ${page.href}`).join("\n")}`,
      );
      for (const page of pages)
        if (!sources.some((source) => source.url === page.href))
          sources.push({ title: page.label, url: page.href });
    }
    if (!concept && !pages.length && !evidenceUsed)
      sections.push(
        "I can look up the local quote dataset, compare supported stocks, explain common financial terms, find a terminal page, and retrieve excerpts from TXT or Markdown documents. Try “Compare NVDA and SPY”, “What is market sentiment?” or “Where can I create a client report?”\n\nAn external model and research provider are needed for open-ended analysis, current news and personalized research.",
      );
  }
  if (webSearch)
    sections.push(
      "Web search is unavailable in this preview. No online search was performed.",
    );
  sections.push(
    "Answered by Local research · deterministic tools. No hosted AI model is configured.",
  );
  return {
    text: sections.join("\n\n"),
    symbols: stocks.map((stock) => stock.symbol),
    sources,
    model: LOCAL_MODEL,
  };
}

function pause(milliseconds, signal) {
  return new Promise((resolve) => {
    if (signal?.aborted) return resolve();
    const timer = setTimeout(done, milliseconds);
    function done() {
      clearTimeout(timer);
      signal?.removeEventListener("abort", done);
      resolve();
    }
    signal?.addEventListener("abort", done, { once: true });
  });
}

export async function* researchEvents(input, signal, delay = 12) {
  const answer = researchAnswer(input);
  for (let start = 0; start < answer.text.length; start += 72) {
    if (signal?.aborted) return;
    yield { type: "token", text: answer.text.slice(start, start + 72) };
    if (delay) await pause(delay, signal);
  }
  for (const symbol of answer.symbols) {
    if (signal?.aborted) return;
    yield { type: "stock", symbol };
  }
  if (signal?.aborted) return;
  if (answer.sources.length) yield { type: "sources", sources: answer.sources };
  yield { type: "done", model: answer.model };
}

export function streamResearch(input, signal) {
  const encoder = new TextEncoder();
  const iterator = researchEvents(input, signal);
  return new ReadableStream({
    async pull(controller) {
      try {
        const { value, done } = await iterator.next();
        if (done) controller.close();
        else controller.enqueue(encoder.encode(`${JSON.stringify(value)}\n`));
      } catch {
        controller.enqueue(
          encoder.encode(
            `${JSON.stringify({ type: "error", message: "Research could not finish. Your question remains in this conversation." })}\n`,
          ),
        );
        controller.close();
      }
    },
    async cancel() {
      await iterator.return();
    },
  });
}
