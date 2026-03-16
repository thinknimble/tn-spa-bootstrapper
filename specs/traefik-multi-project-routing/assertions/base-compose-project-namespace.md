---
id: base-compose-project-namespace
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
priority: 1
status: not_started
---

# Base Compose: PROJECT Variable Namespacing

## What Must Be True

The `{{cookiecutter.project_slug}}/docker-compose.yaml` template uses `${PROJECT}` variable to ensure container and network namespacing.

## Usage

Use `${PROJECT}` in **at least one** of these ways:

### Option 1: Container Names (Recommended)

```yaml
services:
  server:
    container_name: ${PROJECT}-server
  client:
    container_name: ${PROJECT}-client
  postgres:
    container_name: ${PROJECT}-postgres
  redis:
    container_name: ${PROJECT}-redis
```

### Option 2: Compose Project Name

Via `.env` file:
```
COMPOSE_PROJECT_NAME=${PROJECT}
```

### Option 3: Traefik Labels Only

Already covered by `base-compose-traefik-labels` — labels use `${PROJECT}` for router naming.

## Rationale

Prevents naming collisions when multiple projects run simultaneously. Each project's containers have unique names/networks.

## Success Criteria

- ✅ Two projects with different `PROJECT` values can run concurrently
- ✅ Container names include project identifier
- ✅ No "container name already in use" errors when starting multiple projects
- ✅ `docker ps` clearly shows which containers belong to which project
