---
id: auto-detect-traefik
parent: traefik-multi-project-routing
created: 2026-03-19T00:00:00Z
updated: 2026-03-26T00:00:00Z
priority: 1
status: done
depends-on: traefik-setup-docs
branch: main
---

# Auto-Detect Traefik: `just up` Applies Overlay When `proxy` Network Exists

## What Must Be True

`just up` calls `setup-traefik` as a dependency, then checks whether the `proxy` Docker network exists at runtime. If it does, it applies `compose/docker-compose.traefik.yml`; otherwise it falls back to `docker-compose.override.yml` (port bindings).

Calling `setup-traefik` as a dependency ensures Traefik is always running before the network check — so if Traefik was stopped, it gets restarted automatically rather than leaving services bound to hostnames with nothing routing traffic.

## Implementation

```just
up: setup-traefik
    #!/usr/bin/env bash
    project=$(just _project)
    if docker network inspect proxy >/dev/null 2>&1; then
      PROJECT=$project docker compose -f docker-compose.yaml -f compose/docker-compose.traefik.yml up -d
    else
      PROJECT=$project docker compose up -d
    fi
    echo "Application is starting (PROJECT=$project)..."
```

## Key Properties

- **Zero config** — no `.env` entry, no manual file selection
- **Reversible** — start/stop Traefik and the next `just up` picks the right mode
- **Same command** — `just up` works identically in both modes
- **Self-healing** — if Traefik was stopped, `just up` restarts it before proceeding

## Success Criteria

- ✅ `just up` without `proxy` network uses port bindings (override file)
- ✅ `just up` with `proxy` network applies traefik overlay, skips override
- ✅ No `.env` changes required to switch modes
- ✅ `just up` calls `setup-traefik` as a recipe dependency
- ✅ If Traefik container was stopped, `just up` restarts it automatically
