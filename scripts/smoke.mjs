import assert from "node:assert/strict";
import { PAGES } from "../lib/navigation.mjs";

const origin = process.env.LUNA_SMOKE_ORIGIN || "http://127.0.0.1:3000";
const request = (path, options = {}) =>
  fetch(`${origin}${path}`, { signal: AbortSignal.timeout(30000), ...options });
const post = (value) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(value),
});
const pages = [
  ...new Set([
    "/about",
    "/dashboard",
    "/dashboard/chat",
    "/dashboard/chat/smoke-missing-id",
    "/stock/NVDA",
    "/13Filings/0001067983",
    "/privacy",
    "/terms",
    "/contact",
    "/accessibility",
    ...PAGES.map((page) => page.href.split("?")[0]),
  ]),
];

// At most four requests in flight, including on a cold development server.
let nextPage = 0;
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (nextPage < pages.length) {
      const path = pages[nextPage++];
      const response = await request(path);
      assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
      assert.match(
        await response.text(),
        /Luna/,
        `${path}: missing application document`,
      );
    }
  }),
);
process.stdout.write(`PASS ${pages.length} principal page routes\n`);

const root = await request("/", { redirect: "manual" });
assert.ok([307, 308].includes(root.status), "Root must redirect to About.");
assert.equal(root.headers.get("Location"), "/about");
process.stdout.write("PASS root → About redirect\n");

for (const path of [
  "/api/health",
  "/api/quotes/NVDA",
  "/api/history/SPY?range=1Y",
  "/api/sentiment",
  "/api/mcp",
]) {
  const response = await request(path);
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  const data = await response.json();
  assert.ok(data && typeof data === "object", `${path}: missing JSON object`);
  assert.match(response.headers.get("Cache-Control"), /no-store/);
  if (path === "/api/health") {
    assert.equal(data.mode, "local-preview");
    assert.equal(data.authentication, false);
    assert.equal(data.accountPersistence, false);
  }
  if (path === "/api/quotes/NVDA") {
    assert.equal(data.dataMode, "demo");
    assert.equal(data.live, false);
  }
  process.stdout.write(`PASS ${path}\n`);
}

const mcp = await request(
  "/api/mcp",
  post({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
);
const rpc = await mcp.json();
assert.equal(mcp.status, 200);
assert.deepEqual(
  rpc.result.tools.map((tool) => tool.name),
  ["get_quote", "get_history", "get_market_sentiment", "find_page"],
);
const denied = await request(
  "/api/mcp",
  post({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "get_quote",
      arguments: { symbol: "NVDA", owner: "not-authorized" },
    },
  }),
);
assert.equal((await denied.json()).error.code, -32602);
process.stdout.write(
  "PASS public MCP discovery and private-argument rejection\n",
);

const unavailable = await request("/api/chats");
assert.equal(unavailable.status, 503);
assert.equal((await unavailable.json()).code, "ACCOUNT_STORAGE_UNAVAILABLE");
assert.equal((await request("/api/quotes/UNKNOWN")).status, 404);
const foreign = await request("/api/chat", {
  ...post({ message: "NVDA quote" }),
  headers: {
    "Content-Type": "application/json",
    Origin: "https://foreign.example",
  },
});
assert.equal(foreign.status, 403);
process.stdout.write(
  "PASS unavailable account storage, absent quotes and Origin validation\n",
);

const stream = await request("/api/chat", {
  ...post({
    message: "Compare NVDA and SPY over 1Y",
    model: "local-research",
    webSearch: false,
  }),
  headers: {
    "Content-Type": "application/json",
    Origin: new URL(origin).origin,
  },
});
assert.equal(stream.status, 200, `Chat stream: HTTP ${stream.status}`);
assert.match(stream.headers.get("Content-Type"), /application\/x-ndjson/);
const reader = stream.body.getReader();
const decoder = new TextDecoder();
let buffer = "",
  reads = 0;
const events = [];
while (true) {
  const { value, done } = await reader.read();
  if (value?.length) reads += 1;
  buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
  const lines = buffer.split("\n");
  buffer = lines.pop();
  for (const line of lines) if (line.trim()) events.push(JSON.parse(line));
  if (done) {
    if (buffer.trim()) events.push(JSON.parse(buffer));
    break;
  }
}
assert.ok(reads > 1, "Expected incremental network stream chunks.");
assert.deepEqual(events.at(-1), { type: "done", model: "local-research" });
assert.equal(events.filter((event) => event.type === "stock").length, 2);
assert.ok(events.some((event) => event.type === "sources"));
assert.match(
  events
    .filter((event) => event.type === "token")
    .map((event) => event.text)
    .join(""),
  /not current market prices/,
);
process.stdout.write(
  `PASS streamed chat (${reads} network chunks), quotes, source links and completion\n`,
);
process.stdout.write(
  "Local HTTP smoke checks passed. No deployment or account persistence is implied.\n",
);
