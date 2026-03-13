---
id: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
priority: 1
---

# Traefik Multi-Project Routing

## Problem

Running multiple projects simultaneously in local development causes port conflicts. Each project uses the same standard ports (e.g., 8080 for frontend, 8000 for backend). Assigning unique ports per project violates the principle of least surprise and creates ongoing maintenance burden.

## Solution

A shared Traefik reverse proxy instance owns ports 80/443 on the host and routes traffic to project containers by hostname. Each project is accessed via `{project}.localhost` (frontend) and `api.{project}.localhost` (backend), leveraging RFC 6761 native browser resolution of `*.localhost` to 127.0.0.1.

## Architecture

- **Shared Traefik instance** routes to all projects
- **External proxy network** (`docker network create proxy`) connects all projects
- **Two operational modes:**
  - **Standalone mode (default):** Standard port mappings via docker-compose.override.yml
  - **Traefik mode:** No host ports, routing via Traefik labels

## Template Structure

Each generated project contains three compose files:

1. **docker-compose.yaml** — Base services with Traefik labels (inert without Traefik present). Uses `${PROJECT}` variable for namespace isolation.

2. **docker-compose.override.yml** — Standard port mappings (3000, 8000, 5432, 6379). Auto-loaded by Docker Compose by default, providing the familiar single-project dev experience.

3. **docker-compose.traefik.yml** — Attaches routable services to the shared `proxy` network.

### Mode Switching

- **Standalone mode (default):** No configuration needed. `docker-compose.yaml` + `docker-compose.override.yml` auto-load, exposing standard ports.
- **Traefik mode:** Set `COMPOSE_FILE=docker-compose.yaml:docker-compose.traefik.yml` in `.env`. This skips the override file, so no host ports are mapped.

## Constraints

- The compose template must be identical across all projects. The only project-specific value is `PROJECT` in `.env`.
- Internal services (postgres, redis) communicate over the default compose network and do not require host port exposure or Traefik routing.
- No VM-based isolation.
- RFC 6761 `*.localhost` resolution only (no custom /etc/hosts entries required).
