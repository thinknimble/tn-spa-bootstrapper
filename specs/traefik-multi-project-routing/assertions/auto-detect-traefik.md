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

`just up` supports two fully equal modes:

- **Standalone mode (default):** If the `proxy` Docker network does NOT exist, use `docker-compose.override.yml` (port bindings). No Traefik infrastructure is touched.
- **Traefik mode:** If the `proxy` Docker network exists, call `just setup-traefik` first (ensuring Traefik is running), then apply `compose/docker-compose.traefik.yml`.

Standalone mode must remain a fully supported first-class path. `just up` must NOT create the `proxy` network or install Traefik infrastructure unless the user has already opted in by running `just setup-traefik` themselves.

## Implementation

```just
up:
    #!/usr/bin/env bash
    project=$(just _project)
    if docker network inspect proxy >/dev/null 2>&1; then
      just setup-traefik
      PROJECT=$project docker compose -f docker-compose.yaml -f compose/docker-compose.traefik.yml up -d
    else
      PROJECT=$project docker compose up -d
    fi
    echo "Application is starting (PROJECT=$project)..."
```

The key distinction from the previous implementation: `setup-traefik` is called **inside** the `if` branch (only when the proxy network already exists), NOT as a recipe dependency (which would run unconditionally).

## Key Properties

- **Zero config** — no `.env` entry, no manual file switching
- **Standalone is the default** — fresh clone + `just up` uses port bindings, no Traefik required
- **Traefik opt-in** — user runs `just setup-traefik` once to enter Traefik mode; from then on `just up` is self-healing
- **Reversible** — remove the `proxy` network and `just up` falls back to standalone automatically

## Success Criteria

- ✅ `just up` without `proxy` network: uses port bindings, does NOT create proxy network, does NOT start Traefik
- ✅ `just up` with `proxy` network: calls `setup-traefik`, then applies traefik overlay
- ✅ No `.env` changes required to switch modes
- ✅ Fresh `git clone` + `just up` works with zero Traefik infrastructure
- ✅ If Traefik container was stopped but `proxy` network exists, `just up` restarts Traefik automatically
