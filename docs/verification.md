# Local verification

The implementation is a local design preview. These checks do not establish AWS deployment, current market feeds, hosted-model access, or authenticated account isolation.

## Automated checks

- `npm run lint`: clean static analysis.
- `npm test`: 42 meaningful offline tests covering financial calculations, date alignment, chart interval normalization, portfolio validation, revision conflicts, client links, CSV safety, report continuation/PDF, bounded input, Origin validation, public MCP, streamed research, cancellation, and corrupt/unavailable browser storage.
- `npm run build`: optimized Next.js production build.
- `node scripts/smoke.mjs`: 37 route/API checks, root redirect, shared quotes/sentiment, public tool isolation, unavailable account storage, and incremental chat transport.
- `npm run test:browser`: route screenshots at 1440, 1280, 820, and 390 pixels, plus complete chat, market, and advisor workflows in isolated Chrome contexts. Run while localhost is running. Chrome must be installed; browsers are not bundled.
- `npm audit --omit=dev`: zero production dependency advisories at verification time. The current Next ESLint dependency tree has an unpatched development-only `braces` advisory; see feature status.

Browser workflows verify theme reload persistence, AMD autocomplete, streamed quote cards, saved/failed/truncated/cancelled conversations, TXT excerpts, history search/deletion, dashboard widget limits and deliberately empty layouts, interval measurement in both directions, keyboard measurement, watchlist persistence, screener filters, local alert crossing deduplication, client creation/editing/reviews, allocation validation, all three report types, page order/visibility/continuation, templates, save/reopen, and actual PDF/CSV downloads. No runtime browser errors or unintended page overflow remained in the tested journeys.

## Export evidence

The downloaded advisor QA PDF has seven landscape pages. Text extraction and page bounds were checked with pypdf and PyMuPDF, and rendered pages were visually inspected. Its 70/30 allocation, all selected holdings, long text continuation, and hidden-page exclusion were checked. `npm run examples` creates the smaller, readable [Balanced Global PDF](examples/balanced-global.pdf) and [CSV](examples/balanced-global.csv) from the same report/export model.

Raw browser screenshots and result JSON are written to ignored `artifacts/`. Selected screenshots are retained in `docs/screenshots/` for review. Test fixtures and example documents contain fictional data only.
