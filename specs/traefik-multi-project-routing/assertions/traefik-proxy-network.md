---
id: traefik-proxy-network
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
priority: 1
status: done
---

# Traefik File: Proxy Network Definition

## What Must Be True

The `docker-compose.traefik.yml` file declares the `proxy` network as an external network.

## Required Content

```yaml
networks:
  proxy:
    external: true
```

## Behavior

- **External:** The network must already exist (created manually via `docker network create proxy`)
- **Shared:** All projects connect to the same network instance
- **Traefik routing:** Traefik must also be attached to this network to route traffic

## Why External

Unlike project-specific networks, the `proxy` network is shared infrastructure. It persists across project startups/shutdowns and enables Traefik to route to any running project.

## Success Criteria

- ✅ Network declared as `external: true`
- ✅ Network named `proxy` (matches documentation and Traefik setup)
- ✅ `docker-compose up` fails with clear error if network doesn't exist
- ✅ Error message guides user to create network: `docker network create proxy`
