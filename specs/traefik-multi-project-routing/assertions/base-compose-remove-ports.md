---
id: base-compose-remove-ports
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
priority: 1
status: done
---

# Base Compose: Remove Port Mappings

## What Must Be True

The `{{cookiecutter.project_slug}}/docker-compose.yaml` template removes all `ports:` mappings from all services.

## Services Affected

- `server` — remove `ports: ["8000:8000", "5678:5678"]`
- `client` — remove `ports: ["8080:8080"]`
- `postgres` — remove `ports: ["5432:5432"]`
- `redis` — remove `ports: ["6379:6379"]`

## Rationale

Port mappings move to `docker-compose.override.yml` to:
1. Enable Traefik mode without port conflicts
2. Preserve standalone mode via auto-loaded override file
3. Keep base template identical across all projects

## Success Criteria

- ✅ `docker-compose.yaml` defines no `ports:` sections
- ✅ Services still have `expose:` directives if needed (for documentation)
- ✅ Standalone mode still works (via override file restoring ports)
- ✅ Traefik mode has no host port exposure
