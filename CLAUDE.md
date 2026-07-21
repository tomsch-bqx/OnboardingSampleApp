# OnboardingSampleApp

Customer onboarding internal tool for CS teams. Monorepo: React 18 + Vite client, Express.js server, in-memory store (no database, no auth).

## Structure

- `client/` — React 18 + Vite frontend (port 5173)
- `server/` — Express.js API (port 3001), in-memory data store
- `tests/e2e/` — Playwright end-to-end tests
- `sample-data/` — fictional customer datasets for data-mapping testing

## Quick Start

```bash
just install   # or: npm run install:all
just start     # or: npm start (runs server + client concurrently)
```

Then open http://localhost:5173.

## Commands

| Command        | Description                                                   |
| -------------- | ------------------------------------------------------------- |
| `just start`   | Run full app (server + client)                                |
| `just test`    | Run unit tests (server, `node --test`) + Playwright e2e tests |
| `just lint`    | Run ESLint across client/server                               |
| `just format`  | Run Prettier across the repo                                  |
| `just install` | Install root, server, and client dependencies                 |

## Project Management

**Tool:** GitHub Issues
**Repository:** tomsch-bqx/OnboardingSampleApp
**Access method:** `gh` CLI (authenticated as `tomsch-bqx`, `repo` scope) — not an MCP server
**Auto ticket creation:** Enabled
