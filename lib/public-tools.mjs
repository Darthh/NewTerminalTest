import { ApiError, normalizeRange, normalizeSymbol } from "./api.mjs";
import { getHistory, getQuote } from "./chat-engine.mjs";
import { getSentiment } from "./market.mjs";
import { findPages } from "./navigation.mjs";

const symbolProperty = {
  type: "string",
  minLength: 1,
  maxLength: 10,
  description: "A supported illustrative ticker, e.g. NVDA or SPY.",
};
export const PUBLIC_TOOLS = [
  {
    name: "get_quote",
    description:
      "Read a dated illustrative quote. This is demo data, not a live market feed.",
    inputSchema: {
      type: "object",
      properties: { symbol: symbolProperty },
      required: ["symbol"],
      additionalProperties: false,
    },
  },
  {
    name: "get_history",
    description:
      "Read a deterministic illustrative price series. It excludes dividends, fees and taxes.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: symbolProperty,
        range: {
          type: "string",
          enum: ["1D", "5D", "1M", "3M", "6M", "1Y", "2Y", "3Y", "5Y", "10Y"],
          default: "1Y",
        },
      },
      required: ["symbol"],
      additionalProperties: false,
    },
  },
  {
    name: "get_market_sentiment",
    description:
      "Read the fictional preview sentiment reading with observation date and seven inputs.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "find_page",
    description:
      "Find public Luna Terminal routes using the shared navigation catalog.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", minLength: 1, maxLength: 240 } },
      required: ["query"],
      additionalProperties: false,
    },
  },
].map((tool) => ({
  ...tool,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
}));

export function callPublicTool(name, args = {}) {
  if (!args || typeof args !== "object" || Array.isArray(args))
    throw new ApiError("Tool arguments must be an object.");
  const tool = PUBLIC_TOOLS.find((item) => item.name === name);
  if (!tool)
    throw new ApiError(
      "Only get_quote, get_history, get_market_sentiment and find_page are public tools.",
      404,
    );
  if (
    Object.keys(args).some(
      (key) => !Object.hasOwn(tool.inputSchema.properties, key),
    )
  )
    throw new ApiError(
      "Unsupported tool argument. Private account and owner arguments are not accepted.",
    );
  if (name === "get_quote") return getQuote(normalizeSymbol(args.symbol));
  if (name === "get_history")
    return getHistory(normalizeSymbol(args.symbol), normalizeRange(args.range));
  if (name === "get_market_sentiment")
    return { ...getSentiment(), dataMode: "demo", live: false };
  if (
    typeof args.query !== "string" ||
    !args.query.trim() ||
    args.query.length > 240
  )
    throw new ApiError("Page query must contain 1–240 characters.");
  return { pages: findPages(args.query, 5) };
}

/** A deliberately stateless public JSON-RPC surface, with no credentials, account data or file tools. */
export function publicRpc(message) {
  const id = message.id ?? null;
  if (
    message.jsonrpc !== "2.0" ||
    typeof message.method !== "string" ||
    (message.id !== undefined &&
      typeof message.id !== "string" &&
      typeof message.id !== "number")
  )
    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32600, message: "Invalid JSON-RPC request." },
    };
  if (
    message.method === "notifications/initialized" &&
    message.id === undefined
  )
    return null;
  try {
    let result;
    if (message.method === "initialize") {
      const requested = message.params?.protocolVersion;
      const protocolVersion = [
        "2024-11-05",
        "2025-03-26",
        "2025-06-18",
      ].includes(requested)
        ? requested
        : "2025-03-26";
      result = {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "luna-public-research", version: "1.0.0" },
        instructions:
          "Read-only public demo market data and route discovery. No private account, attachment, saved-report or mutation tools are available.",
      };
    } else if (message.method === "tools/list")
      result = { tools: PUBLIC_TOOLS };
    else if (message.method === "ping") result = {};
    else if (message.method === "tools/call") {
      const value = callPublicTool(
        message.params?.name,
        message.params?.arguments,
      );
      result = {
        content: [{ type: "text", text: JSON.stringify(value) }],
        structuredContent: value,
        isError: false,
      };
    } else
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: "Method not found." },
      };
    return { jsonrpc: "2.0", id, result };
  } catch (error) {
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: -32602,
        message:
          error instanceof ApiError ? error.message : "Invalid tool request.",
      },
    };
  }
}
