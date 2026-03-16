---
id: traefik-service-networks
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
priority: 1
status: not_started
---

# Traefik File: Service Network Attachments

## What Must Be True

The `docker-compose.traefik.yml` file attaches `server` and `client` services to both the `default` network and the external `proxy` network.

## Required Content

```yaml
services:
  server:
    networks:
      - default
      - proxy
  
  client:
    networks:
      - default
      - proxy
```

## Network Purposes

- **default:** Internal compose network for postgres/redis communication
- **proxy:** Shared external network for Traefik routing

## Why Both Networks

Services need:
1. **default** network to communicate with postgres, redis (internal services)
2. **proxy** network to be reachable by Traefik for HTTP routing

Internal services (postgres, redis) stay on default network only — they don't need Traefik routing.

## Success Criteria

- ✅ `server` and `client` services attached to both networks
- ✅ `postgres` and `redis` services NOT attached to proxy (remain on default only)
- ✅ Server can connect to postgres via `DB_HOST=postgres` (default network)
- ✅ Traefik can route to server/client via proxy network
- ✅ No network connectivity errors between services
