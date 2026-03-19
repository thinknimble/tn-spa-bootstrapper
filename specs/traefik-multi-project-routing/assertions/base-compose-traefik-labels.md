---
id: base-compose-traefik-labels
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
updated: 2026-03-19T00:00:00Z
priority: 1
status: done
---

# Traefik Overlay: Labels and Network

## What Must Be True

`compose/docker-compose.traefik.yml` contains Traefik labels for `server` and `client` services. Labels are NOT in `docker-compose.yaml` — they are applied only when Traefik is present.

## Labels Required

### Server Service (Backend API)

```yaml
services:
  server:
    networks:
      - default
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=proxy"
      - "traefik.http.routers.${PROJECT}-api.rule=Host(`api.${PROJECT}.localhost`)"
      - "traefik.http.routers.${PROJECT}-api.entrypoints=web"
      - "traefik.http.services.${PROJECT}-api.loadbalancer.server.port=8000"
```

### Client Service (Frontend)

```yaml
services:
  client:
    networks:
      - default
      - proxy
    environment:
      - VITE_DEV_BACKEND_URL=http://api.${PROJECT}.localhost
      - VITE_HMR_HOST=${PROJECT}.localhost
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=proxy"
      - "traefik.http.routers.${PROJECT}-web.rule=Host(`${PROJECT}.localhost`)"
      - "traefik.http.routers.${PROJECT}-web.entrypoints=web"
      - "traefik.http.services.${PROJECT}-web.loadbalancer.server.port=8080"
```

## Key Properties

- **Overlay only** — labels live in `compose/docker-compose.traefik.yml`, not `docker-compose.yaml`
- `traefik.docker.network=proxy` tells Traefik which network to use for routing
- `VITE_HMR_HOST` enables correct Vite HMR WebSocket connection through the proxy
- Labels have no effect when the overlay is not applied (standalone mode)

## Success Criteria

- ✅ Labels in `compose/docker-compose.traefik.yml`, not `docker-compose.yaml`
- ✅ Labels use `${PROJECT}` for dynamic routing
- ✅ Server accessible at `api.${PROJECT}.localhost` in Traefik mode
- ✅ Client accessible at `${PROJECT}.localhost` in Traefik mode
- ✅ Port specifications match actual service ports (8080 for client, 8000 for server)
