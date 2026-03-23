---
id: auto-detect-traefik
parent: traefik-multi-project-routing
created: 2026-03-19T00:00:00Z
priority: 1
status: done
---

# Auto-Detect Traefik: `just up` Applies Overlay When `proxy` Network Exists

## What Must Be True

`just up` checks whether the `proxy` Docker network exists at runtime. If it does, it applies `compose/docker-compose.traefik.yml`; otherwise it falls back to `docker-compose.override.yml` (port bindings).

## Implementation

```just
up:
    #!/usr/bin/env bash
    project=$(just _project)
    if docker network inspect proxy >/dev/null 2>&1; then
      PROJECT=$project docker compose -f docker-compose.yaml -f compose/docker-compose.traefik.yml up -d
    else
      PROJECT=$project docker compose up -d
    fi
```

## Key Properties

- **Zero config** — no `.env` entry, no manual file selection
- **Reversible** — start/stop Traefik and the next `just up` picks the right mode
- **Same command** — `just up` works identically in both modes

## Success Criteria

- ✅ `just up` without `proxy` network uses port bindings (override file)
- ✅ `just up` with `proxy` network applies traefik overlay, skips override
- ✅ No `.env` changes required to switch modes
- ✅ `docker-postgres-redis` recipe uses the same detection logic
