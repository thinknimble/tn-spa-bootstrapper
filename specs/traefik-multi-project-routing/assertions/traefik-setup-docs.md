---
id: traefik-setup-docs
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
updated: 2026-03-19T00:00:00Z
priority: 1
status: done
---

# Traefik Setup: `just setup-traefik` Command

## What Must Be True

The justfile includes a `setup-traefik` recipe that idempotently provisions the shared Traefik gateway.

## Required Behavior

```bash
just setup-traefik
```

1. Creates the `proxy` Docker network if it doesn't exist
2. Starts the Traefik container from `~/traefik/docker-compose.yml` if not already running
3. Is idempotent — safe to run multiple times

## Implementation

```just
setup-traefik:
    #!/usr/bin/env bash
    set -e
    TRAEFIK_DIR="$HOME/traefik"
    if ! docker network inspect proxy >/dev/null 2>&1; then
      docker network create proxy
    fi
    if ! docker inspect traefik >/dev/null 2>&1; then
      docker compose -f "$TRAEFIK_DIR/docker-compose.yml" up -d
    fi
```

## Success Criteria

- ✅ `just setup-traefik` creates `proxy` network if missing
- ✅ `just setup-traefik` starts Traefik if not running
- ✅ Running it twice does not error
- ✅ After running, `just up` auto-detects Traefik and applies the overlay
