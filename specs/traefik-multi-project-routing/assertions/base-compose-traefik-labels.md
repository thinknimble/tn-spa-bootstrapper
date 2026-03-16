---
id: base-compose-traefik-labels
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
priority: 1
status: not_started
---

# Base Compose: Traefik Labels

## What Must Be True

The `{{cookiecutter.project_slug}}/docker-compose.yaml` template adds Traefik labels to `server` and `client` services that enable hostname-based routing.

## Labels Required

### Server Service (Backend API)

```yaml
services:
  server:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.${PROJECT}-api.rule=Host(`api.${PROJECT}.localhost`)"
      - "traefik.http.routers.${PROJECT}-api.entrypoints=web"
      - "traefik.http.services.${PROJECT}-api.loadbalancer.server.port=8000"
```

### Client Service (Frontend)

```yaml
services:
  client:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.${PROJECT}-web.rule=Host(`${PROJECT}.localhost`)"
      - "traefik.http.routers.${PROJECT}-web.entrypoints=web"
      - "traefik.http.services.${PROJECT}-web.loadbalancer.server.port=8080"
```

## Key Properties

- **Dynamic routing** via `${PROJECT}` variable — each project gets unique hostnames
- **Inert without Traefik** — labels have no effect in standalone mode
- **Service port specification** — tells Traefik which container port to forward to
- **Entrypoint** — uses `web` (port 80) entrypoint

## Success Criteria

- ✅ Labels use `${PROJECT}` for dynamic routing
- ✅ Server accessible at `api.${PROJECT}.localhost` in Traefik mode
- ✅ Client accessible at `${PROJECT}.localhost` in Traefik mode
- ✅ Labels do not cause errors or warnings in standalone mode
- ✅ Port specifications match actual service ports (8080 for client, 8000 for server)
