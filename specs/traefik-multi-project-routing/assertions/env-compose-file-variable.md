---
id: env-compose-file-variable
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
updated: 2026-03-19T00:00:00Z
priority: 1
status: superseded
---

# SUPERSEDED: Environment: COMPOSE_FILE Variable

## Status

This assertion is superseded by the auto-detection approach. `COMPOSE_FILE` is no longer used to toggle Traefik mode.

## New Behavior

`just up` detects whether the `proxy` Docker network exists at runtime and automatically applies the appropriate compose files:

- **Proxy network absent:** `docker compose up -d` (loads `docker-compose.yaml` + `docker-compose.override.yml`)
- **Proxy network present:** `docker compose -f docker-compose.yaml -f compose/docker-compose.traefik.yml up -d`

No `.env` entry or manual file switching required. See `auto-detect-traefik` assertion.
