# Data and API contracts

## Shared financial evidence

`lib/market.mjs` contains 17 **fictional** USD quote fixtures, an observation timestamp (`2026-10-06T20:00:00.000Z`), deterministic chart series, seven sentiment inputs and financial calculation helpers. The chart, assistant and public APIs consume the same fixtures. Provider data is not fetched. The history generator produces illustrative series, not historical exchange observations.

Quotes distinguish `price` in USD from `changePercent` in percent. `change` in the original UI fixture is also a percentage; consumers must not treat it as a dollar move. Missing fields such as fund P/E are nullable. Quote timestamps describe the fixture observation, not the current request time.

History records include `{ date, price, close, volume }`; `close` is an alias of `price`. Date strings are ISO 8601, volume is an illustrative count, and comparisons align series by their actual dates. Supported ranges: `1D`, `5D`, `1M`, `3M`, `6M`, `1Y`, `2Y`, `3Y`, `5Y`, `10Y`. Price-return calculations exclude dividends, taxes, fees and account cash flows.

Sentiment is the rounded equal-weight mean of the seven visible illustrative inputs. `previous`, `week` and `month` are fictional dated context. The current preview reading is 66/100 (Greed), previous 62; the app must retain the seven input labels and values.

## Research HTTP routes

| Endpoint                             | Contract                                                           |
| ------------------------------------ | ------------------------------------------------------------------ |
| `GET /api/health`                    | Explicit preview, provider, model, auth and account-storage status |
| `GET /api/quotes/[symbol]`           | Dated demo quote; unknown symbols return 404                       |
| `GET /api/history/[symbol]?range=1Y` | Validated range plus dated demo price series                       |
| `GET /api/sentiment`                 | Demo reading, seven inputs and observation timestamp               |
| `POST /api/chat`                     | Incremental NDJSON research events                                 |
| `POST /api/mcp`                      | Stateless public JSON-RPC tool discovery and calls                 |

Responses use `Cache-Control: no-store`. Request handlers validate browser Origin against the current origin or configured `APP_ORIGIN`, where supplied. This is not an authentication mechanism. Public data remains available without a sign-in.

## Chat request and stream

```json
{
  "message": "Compare NVDA and SPY over 1Y",
  "history": [{ "role": "user", "content": "Tell me about NVDA" }],
  "attachments": [
    { "name": "notes.md", "text": "User-provided document evidence" }
  ],
  "webSearch": false,
  "model": "local-research"
}
```

Each line is one complete JSON event; the client must retain a partial line between chunks.

```json
{"type":"token","text":"Research snapshot"}
{"type":"stock","symbol":"NVDA"}
{"type":"sources","sources":[{"title":"NVDA demo quote and history · 2026-10-06","url":"/stock/NVDA"}]}
{"type":"done","model":"local-research"}
```

A stream failure uses `{ "type": "error", "message": "…" }`. Validation failures are ordinary JSON HTTP errors before the stream begins. Request abort/cancellation stops generation; a cancelled response does not emit a completion event. Stock and page sources point to the actual application views. They are demo provenance, not outside citations.

Limits: message 16,000 characters server-side (the composer uses its own 8,000-character limit); at most 100 supplied history messages with only the most recent 12 used; eight extracted-text attachments; 180 KB UTF-8 text per attachment; 4 MB total request body. Body size is checked while reading, even without Content-Length.

TXT/Markdown documents are submitted as extracted text with the request. They are not uploaded to S3, indexed in a vector store or retained by the backend. Retrieval chunks near 2,800 characters with 2,400-character stride, selects up to six chunks and shows at most 560 characters from each. Filenames and chunk indices are citations; this excerpt retrieval is not a model-generated full-document summary. Embedded document instructions are quoted as evidence and never executed.

Only `local-research` is accepted. Unknown hosted models return a validation error. Web search is explicitly unavailable: setting `webSearch: true` does not run a search and the answer says so. Recent user messages can resolve a ticker follow-up; assistant assertions are not used as quote evidence. Archived personal recall and account-scoped context require an authenticated storage implementation.

The process-local anonymous chat quota defaults to **15 requests per hour across the preview instance**, configurable between 1 and 100. It is intentionally a shared bucket rather than trusting caller-supplied IP headers or user IDs. The public RPC quota is 100 requests/hour across the instance. These counters reset when the process restarts and are not distributed account quotas; production requires a shared atomic store.

## Public MCP surface

The stateless JSON-RPC POST endpoint implements `initialize`, `ping`, `tools/list`, `tools/call` and the initialized notification. Four read-only tools are exposed:

| Tool                   | Required arguments         | Result                           |
| ---------------------- | -------------------------- | -------------------------------- |
| `get_quote`            | `symbol`                   | Dated demo quote                 |
| `get_history`          | `symbol`, optional `range` | Dated demo series                |
| `get_market_sentiment` | none                       | Fictional sentiment reading      |
| `find_page`            | `query` (1–240 characters) | Up to five shared catalog routes |

Unknown tool names, extra arguments (including owner/account fields), invalid symbols and unsupported ranges are rejected. No account, mutation, attachment, saved report, model credential or research-history tools exist on this endpoint. It is a minimal JSON-RPC transport; SSE sessions and external MCP-client interoperability have not been verified.

## Unavailable account/research routes

`/api/chats`, per-chat/message routes and `/api/chats/import` return HTTP 503 with `ACCOUNT_STORAGE_UNAVAILABLE`; no save is claimed. `/api/ai-documents` and `/api/ai-jobs` return 503 with `RESEARCH_SERVICE_UNAVAILABLE`; no cloud upload, extraction or job is queued. Browser editing and exports can remain usable independently of these absent services.
