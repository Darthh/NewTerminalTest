<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Git delivery

For coding tasks, after completing and verifying requested changes, commit only the files changed for the task and push the commit to the current branch’s configured remote. Do not commit secrets or unrelated user changes. If pushing fails, report the error.

The application runtime uses JavaScript/JSX ES modules. Small SST/OpenNext tooling configurations are TypeScript. Keep preview data and browser storage labeled honestly. AWS deployment requires an explicit authorized account/stage; this workspace's initial scope is local only.
