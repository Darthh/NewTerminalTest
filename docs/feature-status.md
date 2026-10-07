# Feature status

This is a working local design preview of Luna Terminal. Its visual and browser workflows are broader than its external integrations; the absence of providers, sessions and account stores is visible in the app and APIs.

| Area                                                   | Current boundary                                                                                               |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Shared shell and route catalog                         | Implemented locally, including compact research navigation                                                     |
| Quotes, charts and market sentiment                    | Shared dated fictional fixtures; not a live or historical provider feed                                        |
| Research assistant                                     | Deterministic local tools, incremental response, quote cards, navigation, selected financial concepts          |
| Text-document research                                 | Bounded TXT/Markdown excerpts with filename/chunk citations; no cloud extraction or full-document AI synthesis |
| Chat and advisor storage                               | Browser preview; no signed-in cross-device persistence                                                         |
| Public MCP                                             | Four validated read-only tools via stateless JSON-RPC POST; external-client interoperability unverified        |
| Web search and hosted model choices                    | Unavailable; no model/provider is silently substituted                                                         |
| Authentication and account context                     | Not implemented; account persistence endpoints return 503                                                      |
| Research jobs, OCR/audio, embeddings, vector search    | Not implemented; endpoints return 503 without queuing work                                                     |
| SEC filings, external earnings and international feeds | Live provider access not configured; unavailable data must remain labeled                                      |
| Alerts and notifications                               | Local rules can be edited where supported; no configured automatic schedule or delivery provider               |
| AWS web hosting                                        | Optional SST/OpenNext configuration and lockfile; not deployed or adapter-build verified                       |
| AgentCore                                              | Locally tested HTTP scaffold; no AWS runtime, container build, IAM call or model entitlement verified          |
| DSQL/DynamoDB/research infrastructure                  | Architecture documented; no resources or runtime adapters implemented                                          |

## Verified backend behavior

The backend suite tests validation, bounded UTF-8 attachments and request bodies, Origin checks, expiring quotas, shared quote/return/sentiment facts, user-only context, source-chunk treatment, page discovery, public/private tool isolation, JSON-RPC calls, streamed NDJSON, cancellation and explicit unavailable account storage. The agent test exercises actual local HTTP `/ping` and `/invocations` requests.

The targeted backend/agent/conversation-storage suite passed **21 tests**. The real local HTTP smoke script passed **37 principal page routes**, the About redirect, public API responses, private-argument rejection, explicit account-storage unavailability and comparison chat with **13 incremental network chunks**. It sent the browser's `http://127.0.0.1:3000` Origin to verify the local server's loopback alias handling. Foreign hosts, different ports and protocol mismatches remain rejected.

The full application build, lint, all calculation tests and browser behavior are recorded separately after the integrated implementation is verified. A successful local check does not imply deployment, authenticated account persistence or provider entitlements.

## Delivery classifications

- **Implemented and verified locally:** the Luna shell/themes, dashboard layout, research charts/calculations, browser conversations, deterministic streamed research, TXT/Markdown evidence, local CRM/portfolios/reports/templates, PDF/CSV exports, and public API smoke checks. Integrated verification passed clean lint, all 42 tests, production build, 37 route/API checks, and the desktop/mobile browser workflows. See [verification evidence](verification.md).
- **Implemented but unverified externally:** compatibility with third-party MCP clients and the optional SST/OpenNext adapter build or AWS distribution. No production hosting claim is made.
- **Optional/configuration-gated:** the separate web deployment configuration and local agent HTTP scaffold. They have not been deployed to AWS.
- **Provisioned but unused:** none. This task did not attach to AWS or provision resources.
- **Planned:** real provider adapters, hosted-model reasoning, Auth.js accounts, DSQL/DynamoDB persistence, selective account/archive recall, S3 upload jobs, OCR/audio extraction, vector retrieval, AgentCore managed runtime, automatic alert delivery, and desktop packaging. These require implementation as well as provider/account setup.

## Dependency review

The current development tooling has a transitive `braces <=3.0.3` advisory through `eslint-config-next`. A compatible patched upstream release was unavailable at implementation time. This dependency is used by development lint tooling. Production-only dependencies are checked separately with `npm audit --omit=dev`; do not describe the full development tree as free of advisories.
