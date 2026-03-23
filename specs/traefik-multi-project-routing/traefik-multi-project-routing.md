---
id: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
updated: 2026-03-19T00:00:00Z
priority: 1
---

# Traefik Multi-Project Routing

## Problem

Running multiple projects simultaneously in local development causes port conflicts. Each project uses the same standard ports (e.g., 8080 for frontend, 8000 for backend). Assigning unique ports per project violates the principle of least surprise and creates ongoing maintenance burden.

## Solution

A shared Traefik reverse proxy instance owns port 80 on the host and routes traffic to project containers by hostname. Each project is accessed via `{project}.localhost` (frontend) and `api.{project}.localhost` (backend), leveraging RFC 6761 native browser resolution of `*.localhost` to 127.0.0.1.

## Architecture

- **Shared Traefik instance** routes to all projects
- **External proxy network** (`docker network create proxy`) connects all projects
- **Ports-first, Traefik-as-enhancement model:**
  - **Standalone mode (default):** `docker-compose.override.yml` binds host ports automatically — no Traefik required
  - **Traefik mode (auto):** When the `proxy` Docker network exists, `just up` detects it and applies `compose/docker-compose.traefik.yml` instead

## Template Structure

Each generated project contains:

1. **`docker-compose.yaml`** — Base services, container namespacing via `${PROJECT}`. No Traefik labels, no port bindings.

2. **`docker-compose.override.yml`** — Standard port bindings (8080, 8000, 5432, 6379). Auto-loaded by Docker Compose as the zero-config default.

3. **`compose/docker-compose.traefik.yml`** — Traefik overlay: attaches services to the `proxy` network, adds Traefik labels for hostname routing, and sets `VITE_HMR_HOST` for Vite HMR behind the proxy. Applied automatically by `just up` when Traefik is present.

## Mode Switching

- **Standalone mode (default):** Run `just up`. No Traefik required.
- **Traefik mode:** Run `just setup-traefik` once (creates `proxy` network + starts Traefik), then `just up` in any project — it detects Traefik automatically.

## PROJECT Isolation

`just up` derives `PROJECT` at runtime from the current git branch name (e.g. `main` → `myapp-main`, `feature/auth` → `myapp-auth`). This ensures worktrees and branches each get unique container names and Traefik routes automatically.

## Worktree Workflow

`just worktree add <branch>` creates a git worktree with a fully isolated Docker stack. Each worktree runs its own containers under a unique `PROJECT` name with no port conflicts.

## Constraints

- Internal services (postgres, redis) communicate over the default compose network and do not require host port exposure or Traefik routing.
- No VM-based isolation.
- RFC 6761 `*.localhost` resolution only (no custom /etc/hosts entries required).
