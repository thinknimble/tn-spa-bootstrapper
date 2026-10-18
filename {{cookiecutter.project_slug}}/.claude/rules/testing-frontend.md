---
paths: client/**/*.test.{ts,tsx}, client/**/tests/**/*
---
# Frontend Testing Checklist

## Test File Location

Tests live **outside** `client/src/` in a dedicated `client/tests/` directory. Never place test files inside `client/src/`.

```
client/tests/
├── unit/           # Vitest unit/integration tests (*.spec.ts, *.test.tsx)
└── e2e/
    └── specs/      # Playwright E2E tests (*.spec.ts)
        ├── local/  # Tests that only run locally (not CI)
        └── utils/  # Shared test utilities and fixtures
```

## Required Patterns

- [ ] Wrap components in `QueryClientProvider` for TanStack Query
- [ ] Use `vi.mock()` for API mocking
- [ ] Use `waitFor()` for async assertions
- [ ] Use `screen.getByRole()` or `screen.getByTestId()` selectors

## Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
```

## E2E Tests (Playwright)

- [ ] Use `data-testid` attributes for stable selectors
- [ ] Use `page.waitForLoadState()` before assertions

### Traefik-Aware Base URL

The Playwright config reads `PLAYWRIGHT_TEST_BASE_URL` (defaults to `http://localhost:8080`). **Always pass this env var explicitly when running Playwright.** Do not modify `playwright.config.ts`.

**When Traefik is running** (the shared `proxy` Docker network exists):

```bash
PROJECT=$(just _project)
PLAYWRIGHT_TEST_BASE_URL="http://${PROJECT}.localhost" npx playwright test --project=chromium
```

**When Traefik is NOT running** (standalone mode via `docker-compose.override.yml`):

```bash
PLAYWRIGHT_TEST_BASE_URL="http://localhost:8080" npx playwright test --project=chromium
```

Hostname pattern: `http://${PROJECT}.localhost` where `PROJECT` is derived by `just _project`.

**Full patterns:** See `.claude/rules/frontend.md` - Testing Patterns section
