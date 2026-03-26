---
id: docker-test-recipes
parent: traefik-multi-project-routing
created: 2026-03-26T00:00:00Z
priority: 1
status: done
branch: main
---

# Docker-Based Test Recipes

## What Must Be True

The justfile includes Docker-based test recipes that work in both standalone and Traefik mode.

## Problem

In Traefik mode, postgres has no host port binding (no `docker-compose.override.yml`). The existing `server-test` recipe runs pytest on the host connecting to `127.0.0.1:5432`, which is unreachable. Tests fail silently or with a connection error.

## Required Recipes

```just
# Run server tests inside Docker (works in both standalone and Traefik mode)
[group('server')]
server-test-docker:
    docker compose exec -w /app/server server pytest

# Run client tests inside Docker
[group('client')]
client-test-docker:
    docker compose exec client npm run test

# Run all tests inside Docker
[group('all')]
test-docker: server-test-docker client-test-docker
    @echo "✅ All tests complete (Docker)"
```

### Why `-w /app/server`

The server container's `WORKDIR` is `/app` but the Django project lives in `/app/server`. Without `-w /app/server`, pytest can't find the Django project and fails with `No module named '<project>'`.

## Success Criteria

- ✅ `just server-test-docker` runs pytest inside the server container
- ✅ `just client-test-docker` runs `npm run test` inside the client container
- ✅ `just test-docker` runs both in sequence
- ✅ All three recipes work with both standalone and Traefik mode (no host port dependency)
- ✅ Recipes are in the appropriate `[group('...')]` sections
- ✅ Existing `server-test` and `client-test` (host-based) recipes are preserved for standalone-only use
