---
id: override-port-mappings
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
priority: 1
status: not_started
---

# Override File: Port Mappings

## What Must Be True

The `docker-compose.override.yml` file defines all port mappings that were removed from the base `docker-compose.yaml`.

## Required Content

```yaml
services:
  client:
    ports:
      - "8080:8080"
  
  server:
    ports:
      - "8000:8000"
      - "5678:5678"  # debugpy
  
  postgres:
    ports:
      - "5432:5432"
  
  redis:
    ports:
      - "6379:6379"
```

## Port Mappings

Match current bootstrapper defaults:
- **Client:** 8080 (frontend dev server)
- **Server:** 8000 (Django/backend), 5678 (debugpy for remote debugging)
- **Postgres:** 5432 (standard PostgreSQL)
- **Redis:** 6379 (standard Redis)

## Auto-Loading Behavior

Docker Compose automatically loads `docker-compose.override.yml` when:
- No `COMPOSE_FILE` environment variable is set
- File exists in the same directory as `docker-compose.yaml`

## Success Criteria

- ✅ All four services have port mappings
- ✅ Ports match current bootstrapper defaults
- ✅ File is auto-loaded in standalone mode
- ✅ `docker-compose config` shows port mappings when override is loaded
- ✅ `docker-compose config` shows NO port mappings when COMPOSE_FILE excludes override
